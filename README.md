# 羊母百科 · YM Encyclopedia

这是一个围绕“羊母不存在”的虚构 ARG 娱乐讽刺网站，静态 HTML/CSS/JavaScript，无需服务器或数据库。

## 目前状态

静态网页、交互、五段视频与五张封面已齐全。四段较大的 MP4 使用 `media/chunks/` 分片，由前端脚本自动重组播放；另一段直接读取 MP4。

2026-11-23 更新：加入六份档案员批注、章翰峰附注、十条轮换实验反馈，以及累计七次观测后解封的 ARG 附页。三张用户提供的角色形象对应羊母、羊曦、章翰峰，保存在 `assets/characters/`，原图保持不变。

## 站点发布

GitHub Pages 工作流 `.github/workflows/pages.yml` 在 `main` 更新后自动部署。公开入口：

https://jimmyhua114.github.io/yangmu-encyclopedia/

Cloudflare Pages 的预定项目名称为 `ymnb`（若占用则尝试 `yxnb`），目前仍需完成账号授权与项目创建；未创建的域名不代表已经上线。

连接此仓库时使用 `main` 分支、无框架预设、构建命令 `exit 0`、输出目录 `.`。此站点不需要数据库或访客账号。

## 页面

- `index.html`：羊母百科首页
- `影像档案.html`：影像档案
- `YX行为艺术.html`、`YX666 .HTML`：旧入口兼容
- `style.css`：样式
- `script.js`：搜索、实验、视频筛选交互
