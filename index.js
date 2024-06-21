const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const moment = require('moment');

moment.locale('zh-cn');

hexo.extend.filter.register('before_generate', async function () {
    const log = this.log;
    const cmd = hexo.env.cmd;

    // 只在包含 hexo generate 或 hexo g 的命令中执行插件逻辑
    if (!cmd.includes('generate') && !cmd.includes('g')) {
        // log.info("跳过 hexo-daily-news 插件，因为它不包含 'generate' 或 'g' 命令。");
        return;
    }

    log.info("【hexo-daily-news】插件开始运行...");

    const { config } = hexo;

    // 使用 hexo.base_dir 获取 Hexo 项目的根目录
    const base_dir = hexo.base_dir;
    // log.info("Hexo 项目根目录是: ", base_dir);

    const apiUrl = config['hexo-daily-news']?.apiUrl;
    const token = config['hexo-daily-news']?.token;

    // log.info("API URL: " + apiUrl);
    // log.info("Token: " + token);

    try {
        const response = await axios.get(apiUrl, {
            params: {
                token: token
            }
        });

        const data = response.data;
        if (data.code === 200) {
            let newsData = data.data;

            const postDate = newsData.date;
            const postDayOfWeek = moment(postDate).format('dddd');

            // 构建 JSON 文件的路径
            const jsonFilePath = path.join(base_dir, 'source/_data', postDate + '.json');
            // log.info("【hexo-daily-news】JSON 文件路径: ", jsonFilePath);

            // 检查并创建 `source/_data` 目录
            const dataDirPath = path.join(base_dir, 'source/_data');
            try {
                await fs.access(dataDirPath);
            } catch (error) {
                await fs.mkdir(dataDirPath, { recursive: true });
                log.info("【hexo-daily-news】创建目录: ", dataDirPath);
            }

            // 写入 JSON 文件
            await fs.writeFile(jsonFilePath, JSON.stringify(newsData, null, 2));
            log.info("【hexo-daily-news】每日新闻数据已保存到: ", jsonFilePath);

            // 构建 Markdown 文件的路径
            const postTitle = `【每日早报】-${postDate} - ${postDayOfWeek}`;
            const postContent = `---
title: ${postTitle}
date: ${postDate} 00:00:00
tags:
  - 每日早报
categories:
  - 每日早报
series: 每日早报
cover: ${newsData.head_image}
---

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>每日早报</title>
</head>

<body>
    <div style="text-align: center;"> <img src="`+ newsData.image + `"
            alt="每日早报" width="100%"> </div>
</body>

</html>`;

            const postFilePath = path.join(base_dir, 'source/_posts', `${postTitle}.md`);
            await fs.writeFile(postFilePath, postContent); // 使用 fs.promises.writeFile 进行异步写入

            log.info('【hexo-daily-news】每日新闻文章已保存到: ', postFilePath);

        } else {
            log.error('【hexo-daily-news】获取每日新闻失败: ', data.msg);
        }
    } catch (error) {
        log.error('【hexo-daily-news】获取每日新闻时发生错误: ', error);
    }
});