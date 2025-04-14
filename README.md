# AI 图像画廊

这是一个使用Hexo构建的AI生成图像展示网站，具有瀑布流布局和模态框查看详情功能。

## 特点

- 使用瀑布流布局展示图片
- 点击图片在模态框中显示大图及详情
- 显示每张图片的Prompt和生成平台信息
- 从YAML数据文件动态读取图片信息
- 响应式设计，适配各种设备尺寸
- GitHub Actions自动部署

## 安装

```bash
# 克隆本仓库
git clone <repository-url>

# 进入项目目录
cd gallery

# 安装依赖
npm install
```

## 运行开发服务器

```bash
npm run server
```

然后在浏览器中访问 `http://localhost:4000`

## 构建

```bash
npm run build
```

生成的静态文件将位于 `public` 目录中。

## 添加新图片

编辑 `source/_data/gallery.yml` 文件，按照以下格式添加新图片：

```yaml
images:
  - img_link: "图片URL"
    prompt: "生成图片使用的提示词"
    creator: "使用的AI平台名称"
```

## 添加新的AI提供商

如果需要添加新的AI提供商，需要进行以下步骤：

1. 在 `gallery/themes/gallery/layout/index.ejs` 文件中添加新的过滤器按钮：

```html
<button class="gallery-filter" data-filter="新提供商标识">
  <i class="gallery-filter__icon fa-solid fa-图标类名"></i>新提供商名称
</button>
```

2. 在 `gallery/themes/gallery/source/js/gallery.js` 文件中修改过滤器逻辑：

```javascript
// 在applyFilters函数中添加新的条件判断
if (activeFilter === '新提供商标识') return creatorFirstPart.toLowerCase() === '新提供商名称小写';
```

3. 在同一文件的模态框图标设置部分添加对应的图标：

```javascript
// 在initModalEvents函数中添加新的平台图标判断
else if (creatorFirstPart === '新提供商名称小写') {
  platformIcon.classList.add('fa-图标类名');
}
```

> 注意：creator字段会取空格前的第一段作为平台名称。例如"Midjourney V7"会被识别为"Midjourney"平台。

## 部署

项目使用GitHub Actions自动部署。当推送到main分支时，会自动构建并部署到GitHub Pages。

## 许可证

MIT 