// Renders social covers from draw.html?cover: one 16:9 and one 3:4, with the title given as "line1/line2".
import puppeteer from 'puppeteer-core';
import { writeFileSync, mkdirSync } from 'node:fs';
const OUT = 'D:/claude/rhythm-sketch/renders';
const TITLE = process.env.TITLE || '把节奏/画在唱片上', SUB = process.env.SUB || '视觉音乐创作工具分享', CN = process.env.CN || '画布唱片工作室', TAG = process.env.TAG || 'v1';
mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage();
page.on('pageerror', e => console.error('page error:', e.message));
await page.goto('http://localhost:8779/draw.html?cover', { waitUntil: 'networkidle0', timeout: 120000 });
await page.waitForFunction(() => window.renderCover && window.rough);
await page.evaluate((t) => document.fonts.load('120px "Ma Shan Zheng"', t), TITLE + SUB + CN);
await page.evaluate(() => window.renderReady());
for (const [name, w, h] of [['16x9', 1920, 1080], ['4x3', 1440, 1080], ['3x4', 1080, 1440]]) {
  const url = await page.evaluate((o) => window.renderCover(o), { w, h, title: TITLE, sub: SUB, cn: CN });
  const file = `${OUT}/cover-${name}-${TAG}.png`;
  writeFileSync(file, Buffer.from(url.split(',')[1], 'base64')); console.log(file);
}
await browser.close();
