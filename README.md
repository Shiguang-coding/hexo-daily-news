# Hexo 每日新闻插件

这是一个 Hexo 插件，用于从 [ALapi](ALapi.cn) 获取每日新闻数据并在你的 Hexo 博客中生成新的文章。

![image-20240621171409121](https://img2023.cnblogs.com/blog/2233039/202406/2233039-20240621171409145-1892318092.png)

## 安装

要在你的 Hexo 项目目录中安装此插件，请运行以下命令：

```bash
npm install hexo-daily-news --save
```

推荐使用 `cnpm` 安装

```bash
cnpm install hexo-daily-news --save
```

## 配置

将以下配置添加到你的 `_config.yml` 文件中：

复制

```yaml
hexo-daily-news:
  apiUrl: 'https://v2.alapi.cn/api/zaobao'
  token: 'your-api-token'
```

## 使用

安装并配置好插件后，运行以下命令生成每日新闻文章：

```bash
hexo generate
```

插件将从指定的 API 获取最新的新闻数据，将其保存为 `source/_data` 目录中的 JSON 文件，并在 `source/_posts` 目录中生成一个新的 Markdown 文章。

## 贡献

欢迎贡献！请提交问题或拉取请求以改进或修复任何问题。

