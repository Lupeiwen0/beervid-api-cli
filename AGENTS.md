# AGENTS.md

## 项目概览

这是一个基于 TypeScript + Node.js 22 的 BeerVid Open API CLI/SDK 项目。

- CLI 入口: `src/cli.ts`
- SDK 入口: `src/index.ts`
- HTTP/认证/输出核心: `src/client/index.ts`
- 命令定义: `src/commands/**`
- 类型定义: `src/types/index.ts`
- 本地配置: `src/config.ts`
- 日志: `src/logger.ts`

运行时目标很明确:

1. 通过 `commander` 暴露 `beervid-api` 命令。
2. 通过统一的 `client` 层请求 BeerVid Open API。
3. 同时导出可复用的 TypeScript SDK。

## 目录结构与模块职责

### 根目录

- `package.json`
  项目清单。定义了 `build`、`dev`、`test`、`typecheck` 脚本，以及 `beervid-api -> dist/cli.mjs` 的二进制入口。

- `README.md`
  面向用户的安装、命令示例和 SDK 快速使用说明。

- `tsconfig.json`
  TypeScript 编译配置。

- `tsup.config.ts`
  打包配置。把 `src/cli.ts` 和 `src/index.ts` 打包到 `dist/`，输出 ESM 和类型声明，并在 CLI 文件上添加 shebang。

- `vitest.config.ts`
  测试配置，使用 Node 环境。

- `.github/workflows/publish.yml`
  发布流程。tag push 后执行 `npm ci`、`npm run build`、`npm publish`。

- `dist/`
  构建产物目录，不是源码编辑入口。

### `src/`

#### `src/cli.ts`

CLI 总入口。

- 初始化 `commander` 程序对象。
- 注册全局选项 `--quiet`、`--pretty`。
- 在 `preAction` hook 中把全局选项同步到 `logger` 和 `client`。
- 汇总注册所有一级命令组:
  - `auth`
  - `video`
  - `strategy`
  - `account`
  - `template`
  - `label`
  - `product`
  - `record`
  - `analytics`
  - `config`

#### `src/index.ts`

SDK 公共导出层。

- 统一 re-export 类型定义。
- 统一 re-export `client` 层中的 API 方法、错误类型和输出函数。
- 这是 npm 包给外部 TS/JS 调用方使用的稳定入口。

#### `src/client/index.ts`

整个项目最核心的运行时模块，职责集中且清晰。

- 认证与环境读取
  - `getApiKey()` 从 `BEERVID_API_KEY` 或本地配置读取 API Key。
  - `getBaseUrl()` 从 `BEERVID_API_BASE_URL`、本地配置或默认值读取服务地址。

- HTTP 请求封装
  - `apiGet`
  - `apiPost`
  - `apiDelete`
  - `apiUpload`

- 响应归一化
  - `handleResponse()` 统一处理 HTTP 错误、JSON 解析错误、OpenAPI `code !== 200` 场景。
  - `ApiError` 用于表达业务错误码失败。

- 文件上传辅助
  - `localFileToFile()` 把本地路径转成 `File`，并按扩展名推导 MIME。

- 业务 SDK 方法
  - 认证: `getProfile`、`checkAuth`
  - 上传: `uploadFile`
  - 视频: `createVideo`、`getVideoTasks`、`listVideoLibrary`、`publishVideo`
  - 策略: `createStrategy`、`listStrategies`、`getStrategyDetail`、`toggleStrategy`、`deleteStrategy`
  - 账号: `listAccounts`
  - 模板: `listTemplates`、`getTemplateDetail`
  - 标签: `listLabels`
  - 商品: `listProducts`
  - 记录: `listRecords`
  - 数据分析: `getVideoAnalytics`

- 输出控制
  - `setPretty()` 控制 JSON 美化输出。
  - `printResult()` 统一写 stdout。

这是最值得复用和谨慎修改的模块，因为 CLI 和 SDK 都依赖它。

#### `src/config.ts`

本地配置读写模块。

- 配置目录固定为 `~/.beervid-api/config.json`
- `loadConfig()` 负责读取并容错
- `saveConfig()` 负责落盘
- `getConfigPath()` 用于 CLI 显示配置文件路径

这个模块只处理本地文件，不关心命令行逻辑和网络请求。

#### `src/logger.ts`

轻量日志模块。

- `setQuiet()` 控制是否抑制普通日志
- `log.info/success/warn/error` 统一输出到 `stderr`

设计意图是把“过程日志”和“最终结果 JSON”分离:

- 过程日志走 `stderr`
- 最终结果走 `stdout`

#### `src/types/index.ts`

集中定义 BeerVid Open API 的类型模型。

主要分为几类:

- 通用协议
  - `OpenApiResponse`
  - `PaginatedResult`

- 枚举/联合类型
  - `TechType`
  - `TaskStatus`
  - `ShoppableType`
  - `StrategyType`
  - `Frequency`
  - 其他业务枚举

- 业务实体与请求参数
  - 认证结果
  - 上传结果
  - 视频创建参数、任务、视频库、发布参数
  - 策略创建/详情/列表
  - TikTok 账号
  - 模板、标签、商品、发布记录、视频分析

这里是 `client` 与 `commands` 之间的类型契约层。

### `src/commands/`

命令层采用“目录分组 + 叶子命令文件”结构。

共同模式基本一致:

1. `index.ts` 负责注册一个一级命令组。
2. 每个子命令文件导出 `register(cmd: Command)`。
3. 子命令内部做参数解析、最小校验、调用 `client` 方法。
4. 成功时 `printResult()` 输出 JSON。
5. 失败时 `log.error()` 并 `process.exit(1)`。

这层本质上是“CLI 适配层”，不承载复杂业务逻辑。

#### `src/commands/auth/`

- `index.ts`: 注册 `auth` 命令组
- `profile.ts`: 查询当前用户资料
- `check.ts`: 校验 API Key 是否有效

#### `src/commands/video/`

- `index.ts`: 注册 `video` 命令组
- `create.ts`: 创建视频生成任务，要求 `--json`，支持 JSON 字符串、文件路径或 stdin
- `tasks.ts`: 查询视频生成任务列表
- `library.ts`: 查询视频库
- `publish.ts`: 发布视频到 TikTok，包含商品挂车参数校验
- `upload.ts`: 上传本地文件

这是最重的命令组，覆盖“生成 -> 查询 -> 入库 -> 发布”主链路。

#### `src/commands/strategy/`

- `index.ts`: 注册 `strategy` 命令组
- `create.ts`: 通过 JSON 创建自动发布策略
- `list.ts`: 分页/筛选查询策略
- `detail.ts`: 获取策略详情
- `toggle.ts`: 启停策略，包含 `--enable/--disable` 互斥校验
- `delete.ts`: 删除策略

#### `src/commands/account/`

- `list.ts`: 查询 TikTok 账号列表，要求 `--shoppable-type`

#### `src/commands/template/`

- `list.ts`: 查询模板列表
- `detail.ts`: 查询模板详情

#### `src/commands/label/`

- `list.ts`: 查询标签列表

#### `src/commands/product/`

- `list.ts`: 查询商品列表，要求 `--creator-user-open-id`

#### `src/commands/record/`

- `list.ts`: 查询发布记录，支持分页、状态、时间区间、排序等筛选

#### `src/commands/analytics/`

- `video.ts`: 查询指定视频的数据分析

#### `src/commands/config.ts`

配置命令单文件实现。

- `config set <key> <value>`
- `config get <key>`
- `config path`

因为配置命令规模很小，所以没有单独拆目录。

### `tests/`

测试覆盖了当前仓库的基础稳定面。

- `tests/cli.test.ts`
  校验 CLI 帮助信息、版本输出、子命令注册是否完整。

- `tests/client.test.ts`
  校验 `client` 的请求方法、错误处理和输出行为。

- `tests/config.test.ts`
  校验配置读取与写入。

- `tests/logger.test.ts`
  校验 quiet 模式和日志输出。

当前测试更偏单元/烟雾测试，命令参数到 API 入参的映射有一定覆盖，但并没有完整的端到端集成测试。

### `skills/`

这是随 npm 包一起分发的技能文档，不属于 CLI 运行时代码。

- `skills/SKILL.md`
  BeerVid 场景说明、命令导航和典型工作流。

- `skills/references/*.md`
  各命令组的细化参考文档。

- `skills/skill.json`
  技能元数据。

如果修改 CLI 能力或参数，通常需要同步更新这里的文档。

### `docs/superpowers/`

设计与规划文档，不参与运行时。

- `plans/`: 任务计划
- `specs/`: 设计说明

## 模块依赖关系

核心依赖方向如下:

`src/cli.ts` -> `src/commands/**` -> `src/client/index.ts` -> `src/config.ts` / Node `fetch`

并且:

- `src/commands/**` 会依赖 `src/logger.ts` 和 `src/types/index.ts`
- `src/index.ts` 直接对外暴露 `src/client/index.ts` 与 `src/types/index.ts`

建议保持这个方向，不要让:

- `client` 反向依赖 `commands`
- `types` 依赖运行时代码
- `config` 混入 CLI 参数处理

## 当前代码风格与实现约定

- CLI 结果统一输出 JSON，不做表格格式化。
- 过程日志统一写 `stderr`，结果统一写 `stdout`。
- 各命令的错误处理基本都是本地 `try/catch + process.exit(1)`。
- 参数解析尽量就地完成，再把已成型对象传给 `client`。
- `client` 层保持无状态，除 `pretty` 输出开关外几乎没有共享可变状态。
- 配置优先级:
  - API Key: 环境变量 > 本地配置
  - Base URL: 环境变量 > 本地配置 > 默认地址

## 修改建议

### 新增 API 能力时

推荐顺序:

1. 先在 `src/types/index.ts` 补请求/响应类型。
2. 在 `src/client/index.ts` 增加 SDK 方法。
3. 如需 CLI 支持，再在 `src/commands/<group>/` 新增命令文件并在对应 `index.ts` 注册。
4. 更新 `src/index.ts` 导出。
5. 补 `README.md`、`skills/` 文档和测试。

### 修改现有命令时

重点检查:

- 是否影响 stdout JSON 结构
- 是否影响 `README.md` 命令示例
- 是否影响 `skills/references/*.md`
- 是否需要补充 `cli.test.ts` 的帮助文本断言

### 不建议的改法

- 不要把业务请求细节散落到 `commands` 层。
- 不要在多个命令文件里重复实现 fetch/鉴权逻辑。
- 不要直接编辑 `dist/`。

## 本地开发常用命令

```bash
npm run dev -- --help
npm run test
npm run typecheck
npm run build
```

直接调试 CLI 也可以使用:

```bash
npx tsx src/cli.ts video --help
```

## 对后续 Agent 的简短结论

如果你要快速理解这个仓库，只要记住三层:

- `commands` 是 CLI 参数适配层
- `client` 是 API/SDK 核心层
- `types` 是协议契约层

其余目录大多是测试、文档、发布配置和构建产物。
