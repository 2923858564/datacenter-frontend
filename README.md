# 聚玩数据中台前端

可独立修改、构建和预览的前端工程，面向 Claude 等工具的代码审查与质量改进。

| 目录 | 内容 | 状态 |
| --- | --- | --- |
| `main-app/src/pages` | 34 个主站页面及布局模块 | 根据当前应用模块重建的可编辑源码 |
| `main-app/src/runtime` | 主站路由、状态及共享逻辑 | 可编辑源码，保留编译时 JSX 运行时调用和部分短变量名 |
| `main-app/src/extensions` | 联系人、工单、付费用户、风控等独立脚本 | 可编辑源码，构建时按原有加载顺序输出 |
| `main-app/src/modules` | 复用看板及运行时模块 | 含应用代码和第三方代码，保持原有模块接口 |
| `main-app/src/styles` | 样式 | 可编辑 |
| `system-console/src` | React 18 + Ant Design 5 管理端 | 现有原始源码 |
| `channel-detail/src` | 渠道明细 | 从 Git 历史恢复的 React 原始源码，独立构建 |
| `reference/main-20260808` | 2026-08-08 主站 React 原型 | 历史对照源码，不作为当前主站运行入口 |
| `web` | 前端交接时的静态快照 | 对照资料，默认预览不从此目录加载应用 |

## 安装、构建、预览

Node.js 22.12–24 与 npm：

```sh
npm run setup
npm run build
npm run preview
```

主站：http://127.0.0.1:8401/ 。管理端：http://127.0.0.1:8401/admin 。未配置测试后端时，预览 API 返回 JSON 503；主站可能显示空数据状态和原有嵌入示例，管理端进入登录页。

```sh
npm run dev:main
npm run dev:console
```

主站开发入口：http://127.0.0.1:8402/ 。管理端开发入口：http://127.0.0.1:8399/admin 。所有服务默认仅监听本机。`npm run dev` 等同于管理端开发入口。

单独构建可执行 `npm run build:main`、`npm run build:console`、`npm run build:channel`。渠道源码输出在 `channel-detail/dist`，用于独立审查，不替换主站现有渠道路由。其原有测试使用 `npm run test --prefix channel-detail`。

## 测试后端与公开范围

通过进程环境变量 `DC_API_TARGET` 指定已授权测试后端。仅 `/api/` 请求代理；不要配置生产后端。页面中的新增、编辑、删除会实际调用指定后端。凭据只使用环境变量或凭据管理器，不写入仓库或聊天。

源码以 2026-10-12 本地前端交接快照为行为对照，包含未发布改动，不代表同日生产版本。当前主站重建源码可以重新构建，但无法恢复全部原始变量名、注释和 JSX 写法，不能称为找回了完整原始工程。

历史主站来源为 Git 提交 `f16a4ba`，历史渠道来源为 `f0e0106`；两者版本边界不同，不直接覆盖当前主站。历史主站仍包含旧鉴权写法和示例数据，只供对照。

仓库不包含后端、采集、数据库、配置账号清单和真实业务数据文件。示例身份匿名化；运行状态、备份和原项目 Git 历史不随代码交付。示例金额、图表和聊天内容不能用于业务验收。

## Claude 源码入口

先阅读 [CLAUDE.md](CLAUDE.md)。目录浏览受限时，使用 [源码索引与原始文件直链](docs/源码索引.md)；[Claude 源码交接文本](docs/Claude源码交接.md)包含请求层、状态层、构建配置和花名册源码。页面映射见 [source-map.json](docs/source-map.json)，验证边界见 [验证说明](docs/验证.md)。
