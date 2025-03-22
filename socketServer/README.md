# WebSocket 聊天室伺服器

## 安裝步驟

1. 確保已安裝 PHP 7.4 或更高版本
2. 安裝 Composer (https://getcomposer.org/)
3. 在此目錄執行以下命令安裝依賴：
   ```
   composer install
   ```

## 啟動伺服器

Windows 用戶可以直接雙擊 `start_server.bat` 文件啟動伺服器。

或者，您可以手動執行以下命令：
```
php server.php
```

伺服器將在 ws://localhost:8080 上運行。

## 注意事項

- 確保端口 8080 未被其他應用程序佔用
- 如需更改端口，請編輯 server.php 文件中的相應設置
- 伺服器運行時請保持命令窗口開啟 