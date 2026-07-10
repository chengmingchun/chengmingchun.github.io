# 程明春的工程笔记

`main` 分支是一套无需后端即可部署的静态技术博客。

## 内容结构

- 系统设计
- 数据与性能
- AI 工程化
- 基础与算法
- 工程复盘

## 性能原则

- 不加载第三方字体、框架或 CDN
- 不依赖 `/api/posts` 等后端接口
- 不使用持续运行的打字、数字滚动或背景动画
- 非首屏内容使用 `content-visibility`
- 搜索渲染通过 `requestAnimationFrame` 合并更新
- 支持 `prefers-reduced-motion`

直接将仓库根目录作为 GitHub Pages 发布源即可。
