<?php
// 設置頁面編碼
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebSocket 聊天室</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            padding: 20px;
            background-color: #f8f9fa;
        }
        .card {
            margin-bottom: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .card-header {
            background-color: #f1f1f1;
            border-bottom: 1px solid #e0e0e0;
        }
        .btn-primary {
            background-color: #007bff;
            border-color: #007bff;
        }
        .btn-primary:hover {
            background-color: #0069d9;
            border-color: #0062cc;
        }
        .code {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border: 1px solid #e0e0e0;
            font-family: monospace;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="mb-4">WebSocket 聊天室</h1>
        
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5>伺服器端</h5>
                    </div>
                    <div class="card-body">
                        <p>WebSocket 伺服器需要先啟動才能使用聊天功能。</p>
                        <h6>啟動步驟：</h6>
                        <ol>
                            <li>確保已安裝 PHP 7.4 或更高版本</li>
                            <li>安裝 Composer 依賴：
                                <div class="code">cd socketServer<br>composer install</div>
                            </li>
                            <li>啟動伺服器：
                                <div class="code">// Windows 用戶<br>雙擊 start_server.bat<br><br>// 或手動執行<br>php server.php</div>
                            </li>
                        </ol>
                        <a href="socketServer/" class="btn btn-primary">前往伺服器目錄</a>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5>客戶端</h5>
                    </div>
                    <div class="card-body">
                        <p>在伺服器啟動後，您可以打開客戶端開始聊天。</p>
                        <h6>使用步驟：</h6>
                        <ol>
                            <li>確保伺服器已啟動</li>
                            <li>打開客戶端頁面</li>
                            <li>輸入您的名稱</li>
                            <li>開始聊天！</li>
                        </ol>
                        <a href="socketClient/" class="btn btn-primary">打開聊天室</a>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card mt-4">
            <div class="card-header">
                <h5>功能說明</h5>
            </div>
            <div class="card-body">
                <h6>核心功能：</h6>
                <ul>
                    <li>即時聊天 - 用戶可以發送和接收即時消息</li>
                    <li>用戶管理 - 顯示線上用戶列表，包含用戶頭像和名稱</li>
                    <li>名稱編輯 - 用戶可以直接在線上用戶列表中編輯自己的名稱</li>
                    <li>連接狀態 - 顯示WebSocket連接狀態，並在斷開時自動重連</li>
                    <li>系統消息 - 顯示用戶加入、離開和名稱更新等系統消息</li>
                </ul>
                
                <h6>特色功能：</h6>
                <ul>
                    <li>動物頭像 - 每個用戶分配一個動物名稱和相應顏色的頭像</li>
                    <li>名稱內聯編輯 - 點擊自己的名稱可以直接編輯，無需彈窗</li>
                    <li>消息樣式 - 不同類型的消息有不同的樣式，自己的消息和他人的消息區分顯示</li>
                    <li>本地存儲 - 使用localStorage保存用戶信息，支持重連時恢復身份</li>
                </ul>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
