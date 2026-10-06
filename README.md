# Canvas Record Studio

@电子音乐考古小分队

**在线试玩：** https://electro-dig.github.io/canvas-record-studio/ （英文版：https://electro-dig.github.io/canvas-record-studio/?lang=en）

这是一个手绘风格的音乐工作台。你在画纸上画一个图案，把它放进轨道，它就会被放到唱片上一起转；图案上的点转过唱针下的红线时就会发出声音。

- **原曲模式：** 播放「节奏的形状」。原曲的每一层都由对应的笔先画在纸上，再送上唱片：四拍、反拍、铺底和弦、Clave、Tresillo、3 对 4、相位、惠特尼和 Drop。
- **编辑模式：** 不放原曲，只循环播放你画的 16 小节。
- **画材就是乐器：** 浓墨是鼓组，铅笔是拨弦，蜡笔是木琴，水彩是低音。×1–4 设置图案每小节转几圈。
- **轨道：** 跟着音乐向左移动，播放头固定在唱针正下方。拖动片段可以改位置，拖尾巴可以改长度，点 × 删除。

## 运行

整个页面是一个独立的 HTML 文件，用到的 rough.js 和 Google Fonts 都从 CDN 加载。

```bash
python -m http.server 8779
```

然后在浏览器里打开 http://localhost:8779/draw.html ，点「开始」打开声音。

- `draw.html`：工作台
- `index.html`：入口页，会跳转到 `draw.html`
- `sample.html`：最早的 16 秒画风小样

页面默认显示中文。点右上角的「EN」按钮，或者在网址里加 `?lang=en`，可以切换到英文。

点「✏️ 自由创作」进入自由模式：不放原曲，只循环播放你自己画的 16 小节。

## 导出视频

`draw.html?render` 会打开渲染模式：每一帧由 `renderAt(t)` 按时间画出来，原曲由 `renderAudio()` 离线合成。导出步骤：

1. 先像上面那样启动本地服务。
2. 在 `tools/` 目录里安装依赖：

   ```bash
   npm i puppeteer-core
   ```

3. 运行渲染脚本：

   ```bash
   node tools/render.mjs
   ```

渲染脚本会用本机的 Chrome 逐帧截图，再用 ffmpeg 合成 `renders/canvas-record-studio.mp4`（1080p，30fps）。

## English version

Add `lang=en` to the URL to get the English workbench, for example `draw.html?lang=en`. All handwriting is switched to English (in the Caveat font) and the account is shown as @Electro-dig.

To export the English video and covers, set `LANG_EN=1` when running the scripts:

```bash
LANG_EN=1 node tools/render.mjs
```

```bash
LANG_EN=1 TITLE="Draw a Song/with Four Pens" SUB="A visual music-making tool" TAG=en node tools/cover.mjs
```
