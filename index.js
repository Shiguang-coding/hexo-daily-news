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

    const { config } = hexo;
    const dailyNewsConfig = config['hexo-daily-news'];

    // 检查是否启用了插件
    if (!dailyNewsConfig || !dailyNewsConfig.enable) {
        // log.info("【hexo-daily-news】插件已禁用，跳过执行。");
        return;
    }

    log.info("【hexo-daily-news】插件开始运行...");

    const base_dir = hexo.base_dir;
    const apiUrl = dailyNewsConfig.apiUrl;
    const token = dailyNewsConfig.token;

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

            const jsonFilePath = path.join(base_dir, 'source/_data/','daily_news_'+ postDate + '.json');

            const dataDirPath = path.join(base_dir, 'source/_data');
            try {
                await fs.access(dataDirPath);
            } catch (error) {
                await fs.mkdir(dataDirPath, { recursive: true });
                log.info("【hexo-daily-news】创建目录: ", dataDirPath);
            }

            await fs.writeFile(jsonFilePath, JSON.stringify(newsData, null, 2));
            log.info("【hexo-daily-news】每日新闻数据已保存到: ", jsonFilePath);

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
            await fs.writeFile(postFilePath, postContent);

            log.info('【hexo-daily-news】每日新闻文章已保存到: ', postFilePath);

        } else {
            log.error('【hexo-daily-news】获取每日新闻失败: ', data.msg);
        }
    } catch (error) {
        log.error('【hexo-daily-news】获取每日新闻时发生错误: ', error);
    }
});