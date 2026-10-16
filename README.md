# 交流方式观展手册 · 北京模块节 2026

个人使用、移动端优先的纯前端手册。React + TypeScript + Tailwind CSS + Vite，使用 React Router Hash 路由，可部署到普通静态托管或子目录。

## 运行

使用 Node.js 24（见 `.node-version`）。

```sh
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

生产发布上传 `dist/`。Hash 路由无需服务端路径回退。离线缓存仅在生产构建、HTTPS或localhost下注册；首次联网且缓存完成后可离线访问，外部报名和购票链接仍需网络。

## Cloudflare 部署

使用 Cloudflare Workers Static Assets 托管纯静态站点，无需后端 Worker 代码。`wrangler.jsonc` 指定站点名称与 `dist/` 目录，预览和部署都会先自动执行生产构建。Hash 路由无需 SPA 回退，缺失文件返回 404。

```sh
npm ci
npm run preview:cloudflare
```

首次发布时登录 Cloudflare 账号，再执行部署：

```sh
npx wrangler login
npm run deploy
```

部署成功后，Wrangler 会输出 HTTPS 的 `workers.dev` 访问地址。需要自定义域名时，在 Cloudflare 控制台该 Worker 的 Settings → Domains & Routes 中添加。

也可以在 Cloudflare 控制台的 Workers & Pages 中导入 Git 仓库，选择 Workers 项目，配置：

- 项目 / Worker 名称：`modular-commune-festival-beijing-2026`，与 `wrangler.jsonc` 一致。
- 根目录：仓库根目录。
- 构建命令：留空；部署命令：`npm run deploy`（Wrangler 会自动运行 `npm run build`）。
- 生产分支：`main`；验证本分支时可先选择 `codex/cloudflare-deploy`。
- 构建环境：Node.js 24；若控制台未读取 `.node-version`，设置环境变量 `NODE_VERSION=24`。

CLI 或外部 CI 使用 API Token 时，通过环境变量提供 `CLOUDFLARE_API_TOKEN` 与 `CLOUDFLARE_ACCOUNT_ID`，不要提交凭据。Cloudflare Git 集成可在控制台完成账号授权。

`public/_headers` 会随构建复制到 `dist/`：带哈希的脚本和样式使用长期缓存，`sw.js` 每次重新验证，其他静态文件沿用 Cloudflare 默认的重新验证策略。离线应用会在新 Service Worker 安装激活后使用新缓存；发布后若页面仍显示旧内容，可再次刷新。

## 功能

- 概览、日程列表、单日多舞台全景、五天展期总览。
- 场馆图、楼层功能图、交互展位图与原图；文字定位替代。
- 展商搜索与详情、艺术家/组合场次、活动详情、关联展商。
- 收藏、已逛、确定时段冲突提示；全界面固定深色主题。
- 个人JSON备份导入/导出、ICS日历导出。

## 数据

`src/data/events.json`：2026-10-12直接读取官方演出与工作坊页面，导入194场。11场有明确结束时间，其余只记录开始时间。

`src/data/festival.ts`：展商、场馆、名称映射和时间工具。展商/展位依据对话中五张原始图片，保存在`public/maps/`；一层42个名称，共用展位分别列出。二层使用内部稳定键，界面不将内部键作为公开编号显示。

重新导入（先保存公开官网HTML）：

```sh
python3 scripts/import-schedule.py /tmp/mc-performances.html /tmp/mc-workshops.html
```

导入后检查来源、日期、场次和链接。不要据下一场开始时间补造结束时间。讲座的具体场地、普通入场规则、展区开放时间与Afterparty票务仍待核实。

## 个人数据

localStorage键 `mc-beijing-2026-personal-v1`，与官方数据分开。不跨设备同步。导入备份合并收藏/已逛；兼容旧备份，忽略其中已移除的笔记与主题设置字段。存储不可用时显示提示，仍可浏览和导出本次记录。

## 设计与开发

产品约束见`PRODUCT.md`，视觉约定见`DESIGN.md`。没有后端、账号、定位API或在线支付。收藏不代表报名。场馆示意图不提供精确距离与路径。

详情采用统一浏览面板：PC左右并排，手机与平板使用大模态浮层；源页面的筛选、滚动和地图状态保留，关联详情在面板内浏览，独立详情链接继续可用。
