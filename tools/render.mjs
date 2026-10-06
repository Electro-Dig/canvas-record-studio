// Renders draw.html?render to an mp4: frames from the page's own renderAt(t), audio from its offline renderAudio(), joined by ffmpeg.
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';

const EN = process.env.LANG_EN === '1', SUFFIX = EN ? '-en' : '';
const URL = `http://localhost:8779/draw.html?render${EN ? '&lang=en' : ''}`;
const OUT_DIR = 'D:/claude/rhythm-sketch/renders';
const FPS = Number(process.env.FPS || 30), LIMIT = Number(process.env.LIMIT || 0);
mkdirSync(OUT_DIR, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--window-size=1700,1000'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1700, height: 1000 });
page.on('pageerror', e => console.error('page error:', e.message));
await page.goto(URL, { waitUntil: 'networkidle0', timeout: 120000 });
await page.waitForFunction(() => window.renderReady && window.rough, { timeout: 60000 });
await page.evaluate(() => window.renderReady());

const span = await page.evaluate(() => window.renderSpan);
console.log('rendering audio…');
const wav = await page.evaluate(() => window.renderAudio());
const wavPath = `${OUT_DIR}/canvas-record-studio${SUFFIX}.wav`;
writeFileSync(wavPath, Buffer.from(wav, 'base64'));

const total = Math.ceil((span.to - span.from + 1.0) * FPS), frames = LIMIT || total;
const mp4 = `${OUT_DIR}/canvas-record-studio${SUFFIX}${LIMIT ? '-test' : ''}.mp4`;
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', wavPath,
  '-vf', 'scale=1920:1080:flags=lanczos', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', mp4], { stdio: ['pipe', 'inherit', 'inherit'] });

const t0 = Date.now();
for (let f = 0; f < frames; f++) {
  const t = span.from + f / FPS;
  const url = await page.evaluate((t, w) => window.renderAt(t, w), t, 100000 + (f * 1000) / FPS);
  const buf = Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (f % 150 === 0) console.log(`frame ${f}/${frames}  t=${t.toFixed(1)}s  ${((Date.now() - t0) / 1000).toFixed(0)}s elapsed`);
}
ff.stdin.end();
await new Promise(r => ff.on('close', r));
await browser.close();
console.log('done:', mp4);
