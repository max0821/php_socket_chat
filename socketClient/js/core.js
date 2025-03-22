/**
 * 核心模組 - 處理WebSocket連接和核心功能
 */
const Core = {
    // WebSocket連接
    socket: null,
    
    // 重連計數器
    reconnectAttempts: 0,
    
    // 重連計時器
    reconnectTimer: null,
    
    /**
     * 初始化核心功能
     */
    init: function() {
        // 設置事件監聽器
        this.setupEventListeners();
        
        // 連接WebSocket
        this.connect();
    },
    
    /**
     * 設置事件監聽器
     */
    setupEventListeners: function() {
        // 監聽用戶註冊事件
        document.addEventListener('user:registered', (e) => {
            this.sendRegister(e.detail);
        });
        
        // 監聽用戶名稱更改事件
        document.addEventListener('user:nameChanged', (e) => {
            this.sendNameChange(e.detail.newName);
        });
        
        // 監聽Socket發送事件
        document.addEventListener('socket:send', (e) => {
            this.sendMessage(e.detail);
        });
    },
    
    /**
     * 連接WebSocket
     */
    connect: function() {
        try {
            UI.updateConnectionStatus('connecting');
            
            this.socket = new WebSocket(Config.websocket.url);
            
            // 連接打開事件
            this.socket.onopen = () => {
                console.log('WebSocket連接已建立');
                UI.updateConnectionStatus('connected');
                this.reconnectAttempts = 0;
                
                // 如果用戶已註冊，發送註冊信息
                if (Users.isRegistered()) {
                    console.log('用戶已註冊，發送註冊信息:', Users.currentUser);
                    this.sendRegister(Users.currentUser);
                } else {
                    // 否則顯示用戶名設置模態框
                    console.log('用戶未註冊，顯示用戶名設置模態框');
                    UI.showUsernameModal();
                }
            };
            
            // 接收消息事件
            this.socket.onmessage = (event) => {
                this.handleMessage(event.data);
            };
            
            // 連接關閉事件
            this.socket.onclose = () => {
                console.log('WebSocket連接已關閉');
                UI.updateConnectionStatus('disconnected');
                UI.updateUserUuid(null); // 隱藏UUID顯示
                this.attemptReconnect();
            };
            
            // 連接錯誤事件
            this.socket.onerror = (error) => {
                console.error('WebSocket錯誤:', error);
                UI.updateConnectionStatus('disconnected');
                UI.updateUserUuid(null); // 隱藏UUID顯示
            };
        } catch (error) {
            console.error('連接WebSocket時出錯:', error);
            UI.updateConnectionStatus('disconnected');
            this.attemptReconnect();
        }
    },
    
    /**
     * 嘗試重新連接
     */
    attemptReconnect: function() {
        // 清除之前的重連計時器
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        
        // 檢查是否超過最大重連嘗試次數
        if (this.reconnectAttempts < Config.websocket.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`嘗試重新連接 (${this.reconnectAttempts}/${Config.websocket.maxReconnectAttempts})...`);
            
            // 設置重連計時器
            this.reconnectTimer = setTimeout(() => {
                this.connect();
            }, Config.websocket.reconnectInterval);
        } else {
            console.error('達到最大重連嘗試次數，停止重連');
            
            // 添加系統消息
            Messages.addSystemMessage({
                type: 'system',
                content: '無法連接到伺服器，請刷新頁面重試',
                timestamp: Math.floor(Date.now() / 1000)
            });
        }
    },
    
    /**
     * 處理接收到的消息
     * @param {string} data 消息數據
     */
    handleMessage: function(data) {
        try {
            const message = JSON.parse(data);
            
            switch (message.type) {
                case 'connection':
                    // 處理連接消息
                    console.log('收到連接消息:', message);
                    
                    // 更新用戶UUID顯示
                    UI.updateUserUuid(message.userId);
                    
                    if (!Users.isRegistered()) {
                        console.log('用戶未註冊，進行註冊');
                        Users.register('訪客' + message.userId.substr(0, 4), message.userId);
                    } else {
                        console.log('用戶已註冊，跳過註冊流程');
                        // 確保用戶ID與伺服器分配的ID一致
                        if (Users.currentUser.id !== message.userId) {
                            console.warn('用戶ID不一致，更新為伺服器分配的ID');
                            console.log('本地ID:', Users.currentUser.id, '伺服器ID:', message.userId);
                            // 這裡不更新ID，避免出現問題
                        }
                    }
                    break;
                    
                case 'nameChanged':
                    // 處理名稱被伺服器修改的消息
                    console.log('收到名稱修改消息:', message);
                    if (message.reason === 'duplicate') {
                        console.warn(`名稱 "${message.oldName}" 已被使用，伺服器自動修改為 "${message.newName}"`);
                        
                        // 更新本地用戶信息
                        if (Users.currentUser && Users.currentUser.name === message.oldName) {
                            Users.currentUser.name = message.newName;
                            Utils.saveUserToStorage(Users.currentUser);
                            
                            // 添加系統消息
                            Messages.addSystemMessage({
                                type: 'system',
                                content: `您的名稱 "${message.oldName}" 已被使用，已自動修改為 "${message.newName}"`,
                                timestamp: Math.floor(Date.now() / 1000)
                            });
                        }
                    }
                    break;
                    
                case 'userList':
                    // 處理用戶列表更新
                    console.log('收到用戶列表更新消息，用戶數量:', message.users.length);
                    console.log('用戶列表詳情:', message.users.map(u => ({ id: u.id, name: u.name })));
                    
                    // 確保當前用戶信息已設置
                    if (Users.currentUser) {
                        console.log('當前用戶ID:', Users.currentUser.id, '名稱:', Users.currentUser.name);
                        
                        // 檢查當前用戶是否在列表中
                        const currentUserInList = message.users.find(user => user.id === Users.currentUser.id);
                        
                        // 如果當前用戶在列表中，但名稱不同，更新列表中的名稱為當前用戶的名稱
                        if (currentUserInList && currentUserInList.name !== Users.currentUser.name) {
                            console.log('更新列表中的當前用戶名稱');
                            console.log('列表中名稱:', currentUserInList.name, '本地名稱:', Users.currentUser.name);
                            currentUserInList.name = Users.currentUser.name;
                            currentUserInList.avatar = Users.currentUser.avatar;
                            currentUserInList.color = Users.currentUser.color;
                        }
                        // 如果用戶不在列表中，說明伺服器沒有該用戶記錄，不應該自動添加
                        else if (!currentUserInList) {
                            console.warn('當前用戶不在收到的用戶列表中，可能已斷開連接');
                            console.log('當前用戶ID:', Users.currentUser.id);
                            console.log('列表中的用戶IDs:', message.users.map(u => u.id));
                            // 不再自動添加當前用戶到列表
                        } else {
                            console.log('當前用戶在列表中，ID:', currentUserInList.id, '名稱:', currentUserInList.name);
                        }
                    } else {
                        console.log('當前用戶未設置，跳過用戶列表處理');
                    }
                    
                    // 更新用戶列表
                    Users.updateUserList(message.users);
                    break;
                    
                case 'message':
                    // 處理用戶消息
                    Messages.addUserMessage(message);
                    break;
                    
                case 'system':
                    // 處理系統消息
                    Messages.addSystemMessage(message);
                    break;
            }
        } catch (error) {
            console.error('處理消息時出錯:', error);
        }
    },
    
    /**
     * 發送消息
     * @param {Object} data 消息數據
     */
    sendMessage: function(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.error('WebSocket未連接，無法發送消息');
            
            // 添加系統消息
            Messages.addSystemMessage({
                type: 'system',
                content: '無法發送消息，請檢查連接',
                timestamp: Math.floor(Date.now() / 1000)
            });
        }
    },
    
    /**
     * 發送註冊信息
     * @param {Object} user 用戶信息
     */
    sendRegister: function(user) {
        this.sendMessage({
            type: 'register',
            name: user.name,
            avatar: user.avatar,
            color: user.color
        });
    },
    
    /**
     * 發送名稱更改信息
     * @param {string} newName 新用戶名稱
     */
    sendNameChange: function(newName) {
        // 確保用戶ID不變
        console.log('發送名稱更改消息，用戶ID保持不變:', Users.currentUser.id);
        
        this.sendMessage({
            type: 'nameChange',
            name: newName
        });
    }
}; 