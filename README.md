# 石油勘探开发的智能化可能性地图

一个按石油作业链组织场景、方法与可运行案例的纯前端参考网站。

## 在线预览

Repository: <https://github.com/OneSh1r/solid-giggle>

Public site: <https://htmlpreview.github.io/?https://github.com/OneSh1r/solid-giggle/blob/main/index.html>

## 内容

- 13 个石油作业环节、61 个候选智能化场景
- 10 个可运行案例，其中 9 个为本项目新增
- 增采环节 5 个子场景全部覆盖
- 另外覆盖钻井、测井和运输各 1 个场景
- 支持按环节、方法、难度浏览
- 支持通过“添加案例”导入独立案例包

## 本地运行

直接打开根目录的 `index.html`。网站不依赖后端，也不请求外部数据。

## 提交材料

- `submission/docs/网站关键亮点说明.pdf`
- `submission/案例包/*.zip`
- `submission/交付说明.md`

讲解视频和结课报告保留在本地提交材料中，未上传到 GitHub。

## 技术结构

- `assets/data.js`: 场景地图元数据
- `assets/cases/`: 内置案例与交互运行时
- `assets/core/`: 路由、外壳、案例导入和可视化组件
- `submission/`: 网站亮点说明与独立案例包

## 案例

| 环节 | 场景 | 案例 |
| --- | --- | --- |
| 增采 | e1 | 压裂参数智能优化 |
| 增采 | e2 | 压裂裂缝形态预测 |
| 增采 | e3 | 化学驱配方智能筛选 |
| 增采 | e4 | 蒸汽吞吐注采参数优化 |
| 增采 | e5 | 微生物采油菌群活性预测 |
| 测井 | w3 | 成像测井裂缝识别 |
| 测井 | w5 | 测井数据修复 |
| 钻井 | d2 | 井下复杂事故前兆预警 |
| 运输 | t1 | 管道泄漏智能检测 |
