import { chromium } from 'playwright';
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function connectToChrome(data) {
    console.log(data);

    try {
        const browser = await chromium.connectOverCDP(`http://127.0.0.1:9222`);
        console.log('成功连接到Chrome!');
        const defaultContext = browser.contexts()[0];
        // 遍历所有页面并打印其 URL 和标题
        // const pages = .pages();
        // const page = pages.find(p => p.url() === "https://pump.fun/create");
        const page = await defaultContext.newPage() 
        await page.goto("https://pump.fun/create");
        if (!page) {
            throw new Error("Could not find pump.fun/create page");
        }
        await page.bringToFront();
        await sleep(2000);
        await page.getByLabel('name').fill(data.name);
        await page.getByLabel('ticker').fill(data.ticker);
        await page.getByLabel('description').fill(data.description);


        const fileInput = page.locator('input[type="file"][accept="video/*,image/*"][multiple]');
        await fileInput.setInputFiles(data.avatar);

        await page.getByText('show more options ↓').click();
        await page.getByLabel('Telegram link').fill(data.telegram);
        await page.getByLabel('Website link').fill(data.website);
        await page.getByLabel('Twitter or X link').fill(data.twitter);

        await sleep(2000)
        await page.getByRole('button', { name: 'create coin' }).click();

        await sleep(1000)
        await page.fill('#amount', '3.3');

        await sleep(2000)
        await page.getByRole('button', { name: 'create coin' }).click();
        defaultContext.on("page", async newPage => {
            let title = await newPage.title()
            if ('Phantom Wallet' == title) {
                const confirmButton = newPage.locator('button', { hasText: /确认/ });
                await confirmButton.click();
                const viewButtonSelector = 'a[href^="/coin/"] button.border.border-white.py-2.px-4.rounded-lg.text-sm.hover\\:bg-gray-900';
                await page.waitForSelector(viewButtonSelector);
                await page.click(viewButtonSelector);
            }
        })
        await sleep(10000)
        return { success: true, data: { name: data.name, ticker: data.ticker } };
        //await page.pause()
        // await page.close()
        // await defaultContext.close()
    } catch (error) {
        console.error('连接Chrome失败:', error);
        throw error;
    }
}

// 创建 Express 服务器端点
import express from 'express';
import cors from 'cors';

const app = express();

// 配置 CORS
app.use(cors({
    origin: '*',
    methods: '*'
}));

// 添加 JSON 解析中间件
app.use(express.json());

app.post('/api/create-pump', async (req, res) => {
    try {
        const result = await connectToChrome(req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

// (async () => {
//     const result = await connectToChrome({
//         name: 'test1',
//         ticker: 'test2',
//         description: 'test3',
//         avatar: 'C:\\Users\\TUF\\Downloads\\test.jpg',
//         telegram: 'https://t.me/test',
//         website: 'https://www.test.com',
//         twitter: 'https://x.com/test'
//     });
// })();
