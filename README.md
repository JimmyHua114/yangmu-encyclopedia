# 羊母百科 · YM Encyclopedia

这是一个围绕“羊母不存在”的虚构 ARG 娱乐讽刺网站，静态 HTML/CSS/JavaScript，无需服务器或数据库。

## 目前状态

网页正文、样式、交互和 GitHub Pages 工作流已上传。
五段 MP4 视频和五张视频封面暂未上传；这些资源在本地完整版部署包的 `media/` 和 `assets/posters/` 目录中。

## 站点发布

进入仓库 **Settings → Pages → Build and deployment**，将 **Source** 选为 **GitHub Actions**。
然后在 **Actions → Publish YM Encyclopedia** 页面运行或重新运行发布工作流。

配置完成后，公开站点地址应为：

https://JimmyHua114.github.io/yangmu-encyclopedia/

这只是预计地址；是否上线需以 GitHub Pages 部署成功为准。

## 视频文件上传

从本地“羊母百科_GitHubPages部署包.zip”中解压，然后将以下文件上传到对应路径：

- `media/YM视频.mp4`
- `media/YX视频.mp4`
- `media/YX视频2.mp4`
- `media/视频2026-11-19_213338_398.mp4`
- `media/视频2026-11-19_213352_750.mp4`
- `assets/posters/` 目录中的全部五张 JPG 封面

视频及封面上传以后，网页已使用相对路径引用它们，无须修改 HTML。

## 页面

- `index.html`：羊母百科首页
- `影像档案.html`：影像档案
- `YX行为艺术.html`、`YX666 .HTML`：旧入口兼容
- `style.css`：样式
- `script.js`：搜索、实验、视频筛选交互
