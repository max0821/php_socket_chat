# WebSocket 聊天室客戶端

## 功能特點

- 即時聊天 - 發送和接收即時消息
- 用戶管理 - 顯示線上用戶列表，包含用戶頭像和名稱
- 名稱編輯 - 直接在線上用戶列表中編輯自己的名稱
- 連接狀態 - 顯示WebSocket連接狀態，並在斷開時自動重連
- 系統消息 - 顯示用戶加入、離開和名稱更新等系統消息
- 動物頭像 - 每個用戶分配一個動物名稱和相應顏色的頭像
- 本地存儲 - 使用localStorage保存用戶信息，支持重連時恢復身份

## 使用方法

1. 確保WebSocket伺服器已啟動（參見 `/socketServer` 目錄）
2. 在瀏覽器中打開 `index.html` 文件
3. 輸入您的名稱並開始聊天

## 文件結構

- `index.html` - 主HTML文件
- `styles.css` - CSS樣式文件
- `js/` - JavaScript模組目錄
  - `config.js` - 配置參數
  - `utils.js` - 工具函數
  - `ui.js` - UI相關功能
  - `users.js` - 用戶管理功能
  - `messages.js` - 消息處理功能
  - `core.js` - 核心功能和WebSocket連接
  - `main.js` - 主入口文件

## 技術說明

- 使用原生JavaScript實現，無需額外框架
- 使用Bootstrap 5進行UI設計
- 使用WebSocket進行即時通信
- 使用localStorage進行本地存儲
- 使用自定義事件進行模組間通信

## 注意事項

- 默認連接到 `ws://localhost:8080`，如需更改，請編輯 `config.js` 文件
- 確保瀏覽器支持WebSocket和localStorage
- 如果遇到連接問題，請檢查伺服器是否正常運行 