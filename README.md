# 交流方式观展手册 · 北京模块节 2026

个人使用、移动端优先的纯前端手册。React + TypeScript + Tailwind CSS + Vite，使用 React Router Hash 路由，可部署到普通静态托管或子目录。

## 运行

```sh
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

生产发布上传 `dist/`。Hash 路由无需服务端路径回退。离线缓存仅在生产构建、HTTPS或localhost下注册；首次联网且缓存完成后可离线访问，外部报名和购票链接仍需网络。

## 功能

- 概览、日程列表、单日多舞台全景、五天展期总览。
- 场馆图、楼层功能图、交互展位图与原图；文字定位替代。
- 展商搜索与详情、艺术家/组合场次、活动详情、关联展商。
- 收藏、已逛、确定时段冲突提示、主题切换。
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

localStorage键 `mc-beijing-2026-personal-v1`，与官方数据分开。不跨设备同步。导入备份合并收藏/已逛；兼容旧备份，忽略其中已移除的笔记字段。存储不可用时显示提示，仍可浏览和导出本次记录。

## 设计与开发

产品约束见`PRODUCT.md`，视觉约定见`DESIGN.md`。没有后端、账号、定位API或在线支付。收藏不代表报名。场馆示意图不提供精确距离与路径。
