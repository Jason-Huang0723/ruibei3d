# 必修2 環境介紹影片（第三版）

整支影片 2:30，分成 7 段接起來。依使用者在逐段修改頁的整體意見改的：不再帶著走校園，改用表格說教室用途；校內講完接校外（宿舍、雜貨店、三條回家路線）。

| 段落 | 內容 | 怎麼做 |
|---|---|---|
| P1 | 校門照片（2-01） | `render2d.html` |
| v2a | 校門口 → 空拍配置圖（2-02～2-08） | 3D 模型 `RB.V2[0]`（`src/07b_video2.js`），在瀏覽器用 `exportScenes([0], {scenes: RB.V2, labels: true})` 匯出 |
| PT | 各間教室的用途表格（2-09～2-17） | `render2d.html` 的 `PT` |
| P2 | 學校 → 宿舍 → 雜貨店（2-18～2-21） | `render2d.html` |
| P4 | 早上接小朋友（2-22～2-24） | `render2d.html` |
| P5 | 回家路線動畫（2-25～2-31） | `render2d.html` 的 `P5`，路線在 `routes.json` |
| P6 | 結尾（2-32） | `render2d.html` |

- 旁白稿：`script.json`（32 句，編號就是畫面右上角的 2-xx）；每句長度在 `vo_durs.json`。
- 配音：Google 翻譯 TTS（zh-TW），去頭尾靜音後 1.5 倍速。
- 回家路線底圖：內政部國土測繪中心正射影像（PHOTO2，z18），用 `map/georef.py` 以學校、林上商號兩個控制點轉成使用者原本地圖的方向（上方≈西）。路線形狀照使用者原本畫的線，`map/paths.py` 抽骨架、平滑後存成 `routes.json`。
- `node render2d.mjs all` 產生 P1、PT、P2、P4、P5、P6 與章節標籤；`python3 assemble.py` 產生字幕、旁白音軌和最後的 ffmpeg 指令（輸出 `final_v3.mp4`）。
- 逐段修改頁的切段時間在 `review_segs.json`。
- 素材（街景照片、宿舍照片、底圖）不放在這個 repo。
