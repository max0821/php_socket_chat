/**
 * UI模組 - 處理用戶界面相關功能
 */
const UI = {
    // DOM元素引用
    elements: {
        userList: document.getElementById('user-list'),
        chatMessages: document.getElementById('chat-messages'),
        messageInput: document.getElementById('message-input'),
        sendButton: document.getElementById('send-button'),
        connectionStatus: document.getElementById('connection-status'),
        userUuid: document.getElementById('user-uuid'),
        userUuidValue: document.querySelector('#user-uuid .uuid-value'),
        usernameModal: null,
        usernameInput: document.getElementById('username-input'),
        saveUsernameButton: document.getElementById('save-username')
    },
    
    /**
     * 初始化UI
     */
    init: function() {
        // 初始化Bootstrap模態框
        this.elements.usernameModal = new bootstrap.Modal(document.getElementById('username-modal'));
        
        // 設置事件監聽器
        this.setupEventListeners();
        
        // 初始化連接狀態
        this.updateConnectionStatus('disconnected');
        
        // 初始化用戶UUID顯示
        this.updateUserUuid(null);
        
        // 初始化捲動監聽器
        this.initScrollListener();
    },
    
    /**
     * 設置UI事件監聽器
     */
    setupEventListeners: function() {
        // 發送按鈕點擊事件
        this.elements.sendButton.addEventListener('click', () => {
            this.handleSendMessage();
        });
        
        // 輸入框按Enter鍵事件
        this.elements.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSendMessage();
            }
        });
        
        // 保存用戶名按鈕點擊事件
        this.elements.saveUsernameButton.addEventListener('click', () => {
            const name = this.elements.usernameInput.value.trim();
            if (name) {
                // 觸發自定義事件
                const event = new CustomEvent('username:save', { detail: { name } });
                document.dispatchEvent(event);
                this.elements.usernameModal.hide();
            }
        });
    },
    
    /**
     * 處理發送消息
     */
    handleSendMessage: function() {
        const content = this.elements.messageInput.value.trim();
        if (content) {
            // 觸發自定義事件
            const event = new CustomEvent('message:send', { detail: { content } });
            document.dispatchEvent(event);
            
            // 清空輸入框
            this.elements.messageInput.value = '';
            this.elements.messageInput.focus();
        }
    },
    
    /**
     * 顯示用戶名設置模態框
     * @param {string} [defaultName=''] 默認用戶名
     */
    showUsernameModal: function(defaultName = '') {
        this.elements.usernameInput.value = defaultName;
        this.elements.usernameModal.show();
        this.elements.usernameInput.focus();
    },
    
    /**
     * 更新連接狀態
     * @param {string} status 連接狀態 ('connected', 'connecting', 'disconnected')
     */
    updateConnectionStatus: function(status) {
        this.elements.connectionStatus.className = 'connection-status ' + status;
        
        const statusText = this.elements.connectionStatus.querySelector('.status-text');
        switch (status) {
            case 'connected':
                statusText.textContent = '已連接';
                break;
            case 'connecting':
                statusText.textContent = '連接中...';
                break;
            case 'disconnected':
                statusText.textContent = '未連接';
                break;
        }
    },
    
    /**
     * 檢查是否應該自動滾動到底部
     * @returns {boolean} 是否應該自動滾動
     */
    shouldAutoScroll: function() {
        const { scrollTop, scrollHeight, clientHeight } = this.elements.chatMessages;
        // 如果用戶已經接近底部（在閾值範圍內），則自動捲動
        return (scrollHeight - scrollTop - clientHeight) < Config.ui.scrollThreshold;
    },
    
    /**
     * 滾動聊天區域到底部
     */
    scrollToBottom: function() {
        // 使用 requestAnimationFrame 確保在 DOM 更新後捲動
        requestAnimationFrame(() => {
            this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
        });
    },
    
    /**
     * 初始化捲動監聽器
     */
    initScrollListener: function() {
        // 監聽捲動事件，用於記錄用戶是否手動捲動
        this.elements.chatMessages.addEventListener('scroll', () => {
            // 如果用戶手動捲動到底部，記錄此狀態
            this.isUserNearBottom = this.shouldAutoScroll();
        });
        
        // 初始狀態設為 true，表示應該自動捲動
        this.isUserNearBottom = true;
    },
    
    /**
     * 更新用戶UUID
     * @param {string} [uuid] 新的用戶UUID
     */
    updateUserUuid: function(uuid) {
        if (uuid) {
            this.elements.userUuid.style.display = 'block';
            this.elements.userUuidValue.textContent = uuid;
        } else {
            this.elements.userUuid.style.display = 'none';
        }
    }
}; 