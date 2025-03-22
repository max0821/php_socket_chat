/**
 * 消息處理模組 - 處理消息相關功能
 */
const Messages = {
    // 消息列表
    messages: [],
    
    /**
     * 初始化消息處理
     */
    init: function() {
        // 設置事件監聽器
        this.setupEventListeners();
    },
    
    /**
     * 設置事件監聽器
     */
    setupEventListeners: function() {
        // 監聽消息發送事件
        document.addEventListener('message:send', (e) => {
            // 觸發自定義事件
            const event = new CustomEvent('socket:send', { 
                detail: { 
                    type: 'message',
                    content: e.detail.content
                } 
            });
            document.dispatchEvent(event);
        });
    },
    
    /**
     * 添加用戶消息
     * @param {Object} message 消息對象
     */
    addUserMessage: function(message) {
        // 檢查是否超過最大消息數量
        if (this.messages.length >= Config.ui.maxMessages) {
            this.messages.shift();
        }
        
        // 添加消息到列表
        this.messages.push(message);
        
        // 檢查是否應該自動滾動（使用 UI 模組中的 isUserNearBottom 屬性）
        const shouldScroll = UI.isUserNearBottom;
        
        // 渲染消息
        const messageElement = this.createUserMessageElement(message);
        UI.elements.chatMessages.appendChild(messageElement);
        
        // 如果需要，滾動到底部
        if (shouldScroll) {
            UI.scrollToBottom();
        }
    },
    
    /**
     * 添加系統消息
     * @param {Object} message 消息對象
     */
    addSystemMessage: function(message) {
        // 檢查是否超過最大消息數量
        if (this.messages.length >= Config.ui.maxMessages) {
            this.messages.shift();
        }
        
        // 添加消息到列表
        this.messages.push(message);
        
        // 檢查是否應該自動滾動（使用 UI 模組中的 isUserNearBottom 屬性）
        const shouldScroll = UI.isUserNearBottom;
        
        // 渲染消息
        const messageElement = this.createSystemMessageElement(message);
        UI.elements.chatMessages.appendChild(messageElement);
        
        // 如果需要，滾動到底部
        if (shouldScroll) {
            UI.scrollToBottom();
        }
    },
    
    /**
     * 創建用戶消息元素
     * @param {Object} message 消息對象
     * @returns {HTMLElement} 消息元素
     */
    createUserMessageElement: function(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.isSelf ? 'message-self' : 'message-other'}`;
        
        // 消息頭部（頭像和發送者）
        const header = document.createElement('div');
        header.className = 'message-header';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.style.backgroundColor = message.color;
        avatar.textContent = message.avatar;
        
        const sender = document.createElement('div');
        sender.className = 'message-sender';
        sender.textContent = message.sender;
        
        header.appendChild(avatar);
        header.appendChild(sender);
        
        // 消息內容
        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = message.content;
        
        // 消息時間
        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = Utils.formatTime(message.timestamp);
        
        messageDiv.appendChild(header);
        messageDiv.appendChild(content);
        messageDiv.appendChild(time);
        
        return messageDiv;
    },
    
    /**
     * 創建系統消息元素
     * @param {Object} message 消息對象
     * @returns {HTMLElement} 消息元素
     */
    createSystemMessageElement: function(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message message-system';
        
        // 消息內容
        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = message.content;
        
        // 消息時間
        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = Utils.formatTime(message.timestamp);
        
        messageDiv.appendChild(content);
        messageDiv.appendChild(time);
        
        return messageDiv;
    },
    
    /**
     * 清空消息列表
     */
    clearMessages: function() {
        this.messages = [];
        UI.elements.chatMessages.innerHTML = '';
    }
}; 