/**
 * 配置模組 - 包含應用程序的全局配置
 */
const Config = {
    // WebSocket 伺服器連接設置
    websocket: {
        url: 'ws://localhost:8080',
        reconnectInterval: 3000, // 重連間隔（毫秒）
        maxReconnectAttempts: 10 // 最大重連嘗試次數
    },
    
    // 本地存儲鍵
    storage: {
        userId: 'chat_user_id',
        userName: 'chat_user_name',
        userAvatar: 'chat_user_avatar',
        userColor: 'chat_user_color'
    },
    
    // UI 配置
    ui: {
        messageTimeFormat: {
            hour: '2-digit',
            minute: '2-digit'
        },
        maxMessages: 100, // 最大顯示消息數量
        scrollThreshold: 50 // 自動滾動閾值（像素），降低以提高靈敏度
    },
    
    // 動物頭像列表
    avatars: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '��', '🐸', '🐵']
}; 