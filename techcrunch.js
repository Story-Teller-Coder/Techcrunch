import puppeteer from "puppeteer";
import {writeFileSync} from "fs";
import {parse} from 'json2csv';

const saveAsCSV = (csvData) => {
    const csv = parse(csvData)
    writeFileSync('result.csv', csv);
}

const getQuotes = async () => {
    const browser = await puppeteer.launch({
        executablePath: 'C://chrome-win/chrome.exe',
        headless: false,
        defaultViewport: null,
    });

    // Open a new page
    const page = await browser.newPage();

    // await page.setDefaultNavigationTimeout(0)
    await page.goto("https://techcrunch.com/");

    await page.waitForTimeout(50000);
    
    let results = [];
    let data = [];

    results = results.concat(await extractedEvaluateCall(page));
    

    for (let i = 0; i < results.length; i++) {
        await page.goto(results[i].url);
        const article = await getArticles(page);

        const insertData = {
            date: results[i].date,
            title: results[i].title,
            content: results[i].content,
            articles: article.article,
            url: results[i].url
        }
        data.push(insertData)
    }

    // Close the browser
    await browser.close();

    saveAsCSV(data);
};

async function extractedEvaluateCall(page) {
    // Get page data
    const quotes = await page.evaluate(() => {
        const quoteList = document.querySelectorAll("div.river article");

        return Array.from(quoteList).map((quote) => {
            const url = quote.querySelector("h2.post-block__title a").href;
            const title = quote.querySelector("h2.post-block__title a").innerText;
            const date = quote.querySelector("div.post-block__meta time").innerText;
            const content = quote.querySelector("div.post-block__content").innerText;

            return { url, title, content, date };
        });
    });

    return quotes;
}

async function getArticles(page) {
    await page.waitForSelector('div#tc-main-content article.article-container')

    let article = '';

    try {
        article = await page.$eval("div#tc-main-content article.article-container", el => el.innerText);
    } catch (e) {

    }

    return { article }
}

// Start the scraping
getQuotes();