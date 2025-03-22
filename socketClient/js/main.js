/**
 * 主入口文件 - 初始化應用程序
 */
document.addEventListener('DOMContentLoaded', function() {
    // 初始化各模組
    UI.init();
    Users.init();
    Messages.init();
    Core.init();
    
    console.log('WebSocket聊天室應用已初始化');
}); 