# 必修2 環境介紹影片（第一版）

整支影片 3:42，分成 8 段接起來：

| 段落 | 內容 | 怎麼做 |
|---|---|---|
| P1 | 校門照片 | `render2d.html` |
| v2a | 空拍配置圖＋走進校園（S02–S19） | 3D 模型 `RB.V2[0]`，在瀏覽器用 `exportScenes({scenes: RB.V2})` 匯出 |
| v2b | 國幼班、遊樂器材區（S20–S21） | 3D 模型 `RB.V2[1]` |
| P2 | 學校 → 雜貨店（螢幕錄影＋宿舍照片） | `render2d.html` |
| P3 | 快速複習 | `render2d.html` |
| P4 | 早上接小朋友 | `render2d.html` |
| P5 | 回家時間與向上／向右／八鄰路線 | `render2d.html` |
| P6 | 結尾 | `render2d.html` |

- 旁白稿：`script.json`（40 句，編號就是畫面右上角的 2-xx）。
- 配音：Google 翻譯 TTS（zh-TW），去頭尾靜音後 1.5 倍速；每句長度在 `vo_durs.json`。
- 3D 段的鏡頭停留時間由旁白長度決定（`src/06_character.js` 的 `vo`／`voAt`／`pad`）。
- 2D 段：`node render2d.mjs all` 產生 P1–P6 與章節標籤 PNG；`python3 assemble.py` 產生字幕、旁白音軌和最後的 ffmpeg 指令。
- 素材（街景錄影、宿舍照片、地圖截圖）不放在這個 repo。
