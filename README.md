# WebSocket 聊天室功能說明

## 核心功能
1. 即時聊天 - 用戶可以發送和接收即時消息
2. 用戶管理 - 顯示線上用戶列表，包含用戶頭像和名稱
3. 名稱編輯 - 用戶可以直接在線上用戶列表中編輯自己的名稱
4. 連接狀態 - 顯示WebSocket連接狀態，並在斷開時自動重連
5. 系統消息 - 顯示用戶加入、離開和名稱更新等系統消息

## 用戶界面
1. 聊天區域 - 顯示所有消息，包括系統消息和用戶消息
2. 用戶列表 - 顯示所有線上用戶，自己的名稱高亮顯示
3. 輸入區域 - 用於輸入和發送消息，完全置底設計
4. 連接狀態 - 顯示當前連接狀態

## 特色功能
1. 動物頭像 - 每個用戶分配一個動物名稱和相應顏色的頭像
2. 名稱內聯編輯 - 點擊自己的名稱可以直接編輯，無需彈窗
3. 消息樣式 - 不同類型的消息有不同的樣式，自己的消息和他人的消息區分顯示
4. 本地存儲 - 使用localStorage保存用戶信息，支持重連時恢復身份
5. 智能捲動 - 新消息到達時自動捲動，用戶手動捲動查看歷史消息時不干擾
6. 響應式設計 - 適配不同螢幕尺寸，在手機和桌面都有良好體驗

## 安裝與部署

### Windows 環境

#### 伺服器端安裝
1. 確保已安裝 PHP 7.0.33 或更高版本
2. 安裝 Composer (https://getcomposer.org/)
3. 在 socketServer 目錄中執行以下命令安裝依賴：
   ```
   cd socketServer
   composer install
   ```
4. 啟動伺服器：
   ```
   # 方法一：使用批處理文件
   start_server.bat
   
   # 方法二：直接執行 PHP 命令
   php server.php
   ```

#### 客戶端使用
1. 確保伺服器已啟動
2. 在瀏覽器中打開 socketClient/index.html 文件
3. 輸入您的名稱並開始聊天

### Linux 環境

#### 伺服器端安裝
1. 確保已安裝 PHP 7.0.33 或更高版本：
   ```bash
   php -v
   ```
   如果未安裝，可以使用以下命令安裝（以 Ubuntu/Debian 為例）：
   ```bash
   sudo apt update
   sudo apt install php php-mbstring php-xml
   ```

2. 安裝 Composer：
   ```bash
   curl -sS https://getcomposer.org/installer | php
   sudo mv composer.phar /usr/local/bin/composer
   ```

3. 在 socketServer 目錄中安裝依賴：
   ```bash
   cd socketServer
   composer install
   ```

4. 創建啟動腳本：
   ```bash
   echo '#!/bin/bash
   php server.php' > start_server.sh
   chmod +x start_server.sh
   ```

5. 啟動伺服器：
   ```bash
   ./start_server.sh
   ```
   
   或直接執行：
   ```bash
   php server.php
   ```

#### 客戶端使用
1. 確保伺服器已啟動
2. 如果需要通過 HTTP 訪問，可以使用 PHP 內建的 Web 伺服器：
   ```bash
   cd socketClient
   php -S localhost:8000
   ```
3. 在瀏覽器中訪問 http://localhost:8000
4. 輸入您的名稱並開始聊天

## CSS 樣式說明

### 聊天區域樣式
聊天區域採用了 Flex 佈局，確保消息區域能夠自適應高度，並且輸入區域完全置底：

```css
.chat-container .card {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.chat-container .card-body {
    flex: 1;
    padding: 0;
    overflow: hidden;
}

.chat-messages {
    overflow-y: auto;
    padding: 15px;
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 70vh;
    scroll-behavior: smooth;
}

.chat-container .card-footer {
    padding: 10px;
    background-color: #f8f9fa;
    border-top: 1px solid rgba(0, 0, 0, 0.125);
    position: sticky;
    bottom: 0;
    z-index: 10;
}
```

### 輸入區域樣式
輸入區域採用了圓角設計，提升用戶體驗：

```css
#message-input {
    border-radius: 20px 0 0 20px;
    padding-left: 15px;
    height: 40px;
}

#send-button {
    border-radius: 0 20px 20px 0;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}
```

### 響應式設計
在小螢幕設備上，聊天室佈局會自動調整，確保良好的用戶體驗：

```css
@media (max-width: 768px) {
    .row {
        flex-direction: column-reverse;
    }
    
    .chat-container .card {
        min-height: 400px;
    }
    
    .chat-messages {
        min-height: 300px;
    }
}
```

## 模組化結構

### 文件結構
```
/socketClient
  /js
    /core.js      - 核心功能和WebSocket連接
    /ui.js        - UI相關功能
    /messages.js  - 消息處理功能
    /users.js     - 用戶管理功能
    /utils.js     - 工具函數
    /config.js    - 配置參數
    /main.js      - 主入口文件，引入並初始化其他模組
  index.html      - 主HTML文件
  styles.css      - CSS樣式文件

/socketServer
  server.php      - WebSocket 伺服器
  composer.json   - Composer 依賴配置
  start_server.bat - Windows 啟動腳本
  start_server.sh  - Linux 啟動腳本 (需手動創建)
```

### 模組間通信
模組間通信採用自定義事件系統，使代碼更加解耦：

```javascript
// 發送事件
const event = new CustomEvent('message:send', { detail: { content } });
document.dispatchEvent(event);

// 監聽事件
document.addEventListener('message:send', (e) => {
    // 處理事件
});
```

## 注意事項
1. 確保伺服器端和客戶端的 WebSocket 連接地址一致
2. 默認連接地址為 `ws://localhost:8080`，可在 config.js 中修改
3. 如果在不同設備上訪問，需要將連接地址修改為伺服器的實際 IP 地址
4. 在 Linux 環境中，可能需要配置防火牆以允許 WebSocket 連接
5. 如果使用 Nginx 或 Apache 作為反向代理，需要特別配置以支持 WebSocket