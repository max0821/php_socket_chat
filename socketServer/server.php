<?php
// 設置編碼
mb_internal_encoding('UTF-8');
mb_http_output('UTF-8');

require 'vendor/autoload.php';

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

class ChatServer implements MessageComponentInterface {
    protected $clients;
    protected $users = [];

    public function __construct() {
        $this->clients = new \SplObjectStorage;
        echo "伺服器已啟動！等待連接...\n";
    }

    /**
     * 清理重複名稱的用戶
     * 這個方法會檢查所有用戶，如果發現有重複名稱的用戶，會為它們添加隨機後綴
     */
    protected function cleanupDuplicateNames() {
        $nameCount = [];
        $duplicates = [];
        
        // 統計每個名稱出現的次數
        foreach ($this->users as $id => $user) {
            $name = $user['name'];
            if (!isset($nameCount[$name])) {
                $nameCount[$name] = [];
            }
            $nameCount[$name][] = $id;
        }
        
        // 找出重複的名稱
        foreach ($nameCount as $name => $ids) {
            if (count($ids) > 1) {
                echo "發現重複名稱: {$name}, 用戶數: " . count($ids) . "\n";
                
                // 保留第一個用戶的名稱不變，為其他用戶添加後綴
                $originalId = array_shift($ids);
                
                foreach ($ids as $id) {
                    $newName = $name . '_' . rand(100, 999);
                    echo "修改用戶 {$id} 的名稱從 {$name} 到 {$newName}\n";
                    
                    // 更新用戶名稱
                    $this->users[$id]['name'] = $newName;
                    
                    // 通知用戶名稱已被修改
                    foreach ($this->clients as $client) {
                        if (isset($client->userId) && $client->userId === $id) {
                            $client->send(json_encode([
                                'type' => 'nameChanged',
                                'oldName' => $name,
                                'newName' => $newName,
                                'reason' => 'duplicate'
                            ]));
                            break;
                        }
                    }
                }
                
                // 廣播系統消息
                $this->broadcastSystemMessage("系統檢測到重複名稱，已自動修正");
            }
        }
        
        // 如果有重複名稱被修改，廣播更新後的用戶列表
        if (count($duplicates) > 0) {
            $this->broadcastUserList();
        }
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
        $conn->userId = uniqid();
        
        echo "新連接! ({$conn->resourceId}) - 用戶ID: {$conn->userId}\n";
        
        // 發送連接成功消息給新用戶
        $conn->send(json_encode([
            'type' => 'connection',
            'userId' => $conn->userId,
            'status' => 'connected'
        ]));
        
        echo "已發送連接成功消息給用戶 {$conn->userId}\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        $data = json_decode($msg, true);
        
        echo "收到消息: " . json_encode($data) . " 來自用戶 {$from->userId}\n";
        
        switch ($data['type']) {
            case 'register':
                // 檢查名稱是否已被使用
                $nameExists = false;
                $suggestedName = $data['name'];
                
                // 檢查是否有其他用戶使用相同名稱
                foreach ($this->users as $id => $user) {
                    if ($id !== $from->userId && $user['name'] === $suggestedName) {
                        $nameExists = true;
                        break;
                    }
                }
                
                // 如果名稱已被使用，添加隨機數字後綴
                if ($nameExists) {
                    $suggestedName = $data['name'] . '_' . rand(100, 999);
                    echo "名稱 '{$data['name']}' 已被使用，自動修改為 '{$suggestedName}'\n";
                    
                    // 通知用戶名稱已被修改
                    $from->send(json_encode([
                        'type' => 'nameChanged',
                        'oldName' => $data['name'],
                        'newName' => $suggestedName,
                        'reason' => 'duplicate'
                    ]));
                }
                
                // 用戶註冊/更新名稱
                $oldName = isset($this->users[$from->userId]['name']) ? $this->users[$from->userId]['name'] : null;
                $this->users[$from->userId] = [
                    'name' => $suggestedName,
                    'avatar' => $data['avatar'] ?? $this->generateAvatar($suggestedName),
                    'color' => $data['color'] ?? $this->generateColor($suggestedName)
                ];
                
                echo "用戶註冊/更新: ID={$from->userId}, 名稱={$suggestedName}, 舊名稱={$oldName}\n";
                echo "當前用戶數: " . count($this->users) . "\n";
                
                // 廣播用戶列表更新
                $this->broadcastUserList();
                
                // 只有新用戶才發送加入消息，更新名稱不發送
                if ($oldName === null) {
                    // 廣播系統消息，添加用戶ID
                    $this->broadcastSystemMessage("{$this->users[$from->userId]['name']} 加入了聊天室 (ID: {$from->userId})");
                    echo "發送系統消息: {$this->users[$from->userId]['name']} 加入了聊天室 (ID: {$from->userId})\n";
                }
                break;
                
            case 'message':
                // 廣播用戶消息
                $this->broadcastMessage($from->userId, $data['content']);
                echo "廣播用戶消息: 來自={$this->users[$from->userId]['name']}, 內容={$data['content']}\n";
                break;
                
            case 'nameChange':
                // 檢查新名稱是否已被使用
                $nameExists = false;
                $suggestedName = $data['name'];
                
                // 檢查是否有其他用戶使用相同名稱
                foreach ($this->users as $id => $user) {
                    if ($id !== $from->userId && $user['name'] === $suggestedName) {
                        $nameExists = true;
                        break;
                    }
                }
                
                // 如果名稱已被使用，添加隨機數字後綴
                if ($nameExists) {
                    $suggestedName = $data['name'] . '_' . rand(100, 999);
                    echo "名稱 '{$data['name']}' 已被使用，自動修改為 '{$suggestedName}'\n";
                    
                    // 通知用戶名稱已被修改
                    $from->send(json_encode([
                        'type' => 'nameChanged',
                        'oldName' => $data['name'],
                        'newName' => $suggestedName,
                        'reason' => 'duplicate'
                    ]));
                }
                
                // 用戶更改名稱
                $oldName = $this->users[$from->userId]['name'];
                
                // 保存原有的頭像和顏色
                $avatar = $this->users[$from->userId]['avatar'];
                $color = $this->users[$from->userId]['color'];
                
                // 只更新名稱，保持其他信息不變
                $this->users[$from->userId]['name'] = $suggestedName;
                
                echo "用戶更改名稱: ID={$from->userId}, 舊名稱={$oldName}, 新名稱={$suggestedName}\n";
                echo "保持原有頭像和顏色不變\n";
                
                // 廣播用戶列表更新
                $this->broadcastUserList();
                
                // 廣播系統消息，添加用戶ID
                $this->broadcastSystemMessage("{$oldName} 更改名稱為 {$suggestedName} (ID: {$from->userId})");
                echo "發送系統消息: {$oldName} 更改名稱為 {$suggestedName} (ID: {$from->userId})\n";
                break;
        }
    }

    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
        
        if (isset($conn->userId) && isset($this->users[$conn->userId])) {
            $userName = $this->users[$conn->userId]['name'];
            $userId = $conn->userId;
            unset($this->users[$conn->userId]);
            
            // 廣播用戶列表更新
            $this->broadcastUserList();
            
            // 廣播系統消息，添加用戶ID
            $this->broadcastSystemMessage("{$userName} 離開了聊天室 (ID: {$userId})");
            echo "用戶離開: {$userName} (ID: {$userId})\n";
        }
        
        echo "連接 {$conn->resourceId} 已關閉\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "錯誤: {$e->getMessage()}\n";
        $conn->close();
    }
    
    // 廣播用戶列表
    protected function broadcastUserList() {
        // 先清理重複名稱
        $this->cleanupDuplicateNames();
        
        $userList = [];
        foreach ($this->users as $id => $user) {
            $userList[] = [
                'id' => $id,
                'name' => $user['name'],
                'avatar' => $user['avatar'],
                'color' => $user['color']
            ];
        }
        
        echo "廣播用戶列表更新: " . count($userList) . " 個用戶\n";
        
        foreach ($this->clients as $client) {
            $client->send(json_encode([
                'type' => 'userList',
                'users' => $userList
            ]));
        }
    }
    
    // 廣播系統消息
    protected function broadcastSystemMessage($message) {
        foreach ($this->clients as $client) {
            $client->send(json_encode([
                'type' => 'system',
                'content' => $message,
                'timestamp' => time()
            ]));
        }
    }
    
    // 廣播用戶消息
    protected function broadcastMessage($userId, $content) {
        $user = $this->users[$userId] ?? ['name' => '未知用戶'];
        
        foreach ($this->clients as $client) {
            $client->send(json_encode([
                'type' => 'message',
                'userId' => $userId,
                'sender' => $user['name'],
                'avatar' => $user['avatar'] ?? '',
                'color' => $user['color'] ?? '#cccccc',
                'content' => $content,
                'timestamp' => time(),
                'isSelf' => $client->userId === $userId
            ]));
        }
    }
    
    // 生成頭像
    protected function generateAvatar($name) {
        $animals = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'];
        $hash = crc32($name);
        return $animals[$hash % count($animals)];
    }
    
    // 生成顏色
    protected function generateColor($name) {
        $hash = crc32($name);
        return sprintf('#%06x', $hash & 0xFFFFFF);
    }
}

// 設置伺服器
$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new ChatServer()
        )
    ),
    8080
);

echo "WebSocket 伺服器啟動於 ws://localhost:8080\n";
$server->run(); 