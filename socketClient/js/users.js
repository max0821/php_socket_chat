/**
 * 用戶管理模組 - 處理用戶相關功能
 */
const Users = {
    // 當前用戶信息
    currentUser: null,
    
    // 用戶列表
    userList: [],
    
    /**
     * 初始化用戶管理
     */
    init: function() {
        // 從本地存儲加載用戶信息
        this.currentUser = Utils.getUserFromStorage();
        
        // 設置事件監聽器
        this.setupEventListeners();
    },
    
    /**
     * 設置事件監聽器
     */
    setupEventListeners: function() {
        // 監聽用戶名保存事件
        document.addEventListener('username:save', (e) => {
            this.updateUsername(e.detail.name);
        });
        
        // 監聽用戶列表點擊事件（用於編輯名稱）
        UI.elements.userList.addEventListener('click', (e) => {
            const userItem = e.target.closest('.user-item');
            // 如果點擊的是頭像元素，且是當前用戶的頭像
            if (e.target.classList.contains('user-avatar') && userItem && userItem.classList.contains('user-self')) {
                this.startNameEdit(userItem);
                return;
            }
            
            // 原有的點擊整個用戶項目的邏輯
            if (userItem && userItem.classList.contains('user-self')) {
                this.startNameEdit(userItem);
            }
        });
        
        // 監聽用戶列表按鍵事件（用於編輯名稱）
        UI.elements.userList.addEventListener('keypress', (e) => {
            if (e.target.classList.contains('user-name-edit') && e.key === 'Enter') {
                this.finishNameEdit(e.target);
            }
        });
        
        // 監聽用戶列表失去焦點事件（用於編輯名稱）
        UI.elements.userList.addEventListener('focusout', (e) => {
            if (e.target.classList.contains('user-name-edit')) {
                this.finishNameEdit(e.target);
            }
        });
        
        // 添加點擊頭像編輯名稱的事件處理
        document.addEventListener('DOMContentLoaded', () => {
            // 使用 jQuery 選擇器找到當前用戶的頭像並添加點擊事件
            const setupAvatarClickEvent = () => {
                const myId = $('#user-uuid .uuid-value').text();
                if (myId) {
                    const myAvatar = $('#user-list .list-group-item.user-item[data-user-id="' + myId + '"] .user-avatar');
                    if (myAvatar.length > 0) {
                        // 移除之前可能存在的事件監聽器，避免重複
                        myAvatar.off('click').on('click', () => {
                            const userItem = myAvatar.closest('.user-item');
                            if (userItem.length > 0) {
                                this.startNameEdit(userItem[0]);
                            }
                        });
                        console.log('已為用戶頭像設置編輯名稱事件');
                    }
                }
            };
            
            // 初始設置
            setupAvatarClickEvent();
            
            // 當用戶列表更新時重新設置
            document.addEventListener('userList:updated', setupAvatarClickEvent);
        });
    },
    
    /**
     * 檢查用戶是否已註冊
     * @returns {boolean} 是否已註冊
     */
    isRegistered: function() {
        return this.currentUser !== null;
    },
    
    /**
     * 註冊新用戶
     * @param {string} name 用戶名稱
     * @param {string} userId 用戶ID
     */
    register: function(name, userId) {
        // 檢查是否已經註冊過相同ID的用戶
        if (this.currentUser && this.currentUser.id === userId) {
            console.log('用戶已經註冊過，跳過重複註冊:', userId);
            return;
        }
        
        this.currentUser = {
            id: userId,
            name: name,
            avatar: Utils.generateAvatar(name),
            color: Utils.generateColor(name)
        };
        
        // 保存到本地存儲
        Utils.saveUserToStorage(this.currentUser);
        
        console.log('用戶註冊成功:', this.currentUser);
        
        // 如果已有用戶列表，立即重新渲染
        if (this.userList && this.userList.length > 0) {
            console.log('註冊後立即重新渲染用戶列表');
            this.renderUserList();
        }
        
        // 觸發自定義事件
        const event = new CustomEvent('user:registered', { detail: this.currentUser });
        document.dispatchEvent(event);
    },
    
    /**
     * 更新用戶名稱
     * @param {string} newName 新用戶名稱
     */
    updateUsername: function(newName) {
        if (this.currentUser) {
            const oldName = this.currentUser.name;
            
            // 保存原有的用戶ID
            const userId = this.currentUser.id;
            
            this.currentUser.name = newName;
            this.currentUser.avatar = Utils.generateAvatar(newName);
            this.currentUser.color = Utils.generateColor(newName);
            
            // 確保ID不變
            this.currentUser.id = userId;
            
            // 保存到本地存儲
            Utils.saveUserToStorage(this.currentUser);
            
            // 如果已有用戶列表，立即重新渲染
            if (this.userList && this.userList.length > 0) {
                console.log('名稱更新後立即重新渲染用戶列表');
                // 更新當前用戶在用戶列表中的信息
                const currentUserInList = this.userList.find(user => user.id === this.currentUser.id);
                if (currentUserInList) {
                    currentUserInList.name = newName;
                    currentUserInList.avatar = this.currentUser.avatar;
                    currentUserInList.color = this.currentUser.color;
                    // 確保ID不變
                    currentUserInList.id = userId;
                }
                this.renderUserList();
            }
            
            // 觸發自定義事件
            const event = new CustomEvent('user:nameChanged', { 
                detail: { 
                    oldName, 
                    newName, 
                    user: this.currentUser 
                } 
            });
            document.dispatchEvent(event);
        } else {
            // 如果用戶尚未註冊，則註冊新用戶
            this.register(newName, Utils.generateId());
        }
    },
    
    /**
     * 更新用戶列表
     * @param {Array} users 用戶列表
     */
    updateUserList: function(users) {
        console.log('更新用戶列表，用戶數量:', users.length);
        
        // 檢查是否有重複的用戶ID
        const userIds = users.map(u => u.id);
        const uniqueUserIds = [...new Set(userIds)];
        if (userIds.length !== uniqueUserIds.length) {
            console.warn('用戶列表中存在重複ID!');
            console.log('所有ID:', userIds);
            console.log('唯一ID:', uniqueUserIds);
            
            // 過濾掉重複的用戶，保留第一個出現的
            const uniqueUsers = [];
            const seenIds = new Set();
            for (const user of users) {
                if (!seenIds.has(user.id)) {
                    uniqueUsers.push(user);
                    seenIds.add(user.id);
                }
            }
            console.log('過濾後的用戶數量:', uniqueUsers.length);
            this.userList = uniqueUsers;
        } else {
            this.userList = users;
        }
        
        // 確保用戶列表不為空
        if (this.userList && this.userList.length > 0) {
            console.log('準備渲染用戶列表');
            this.renderUserList();
            
            // 在下一個事件循環中設置頭像點擊事件，確保DOM已經更新
            setTimeout(() => {
                const myId = $('#user-uuid .uuid-value').text();
                if (myId) {
                    const myAvatar = $('#user-list .list-group-item.user-item[data-user-id="' + myId + '"] .user-avatar');
                    if (myAvatar.length > 0) {
                        // 移除之前可能存在的事件監聽器，避免重複
                        myAvatar.off('click').on('click', () => {
                            const userItem = myAvatar.closest('.user-item');
                            if (userItem.length > 0) {
                                this.startNameEdit(userItem[0]);
                            }
                        });
                        console.log('用戶列表更新後重新設置頭像點擊事件');
                    }
                }
            }, 0);
        } else {
            console.log('用戶列表為空，不進行渲染');
        }
    },
    
    /**
     * 渲染用戶列表
     */
    renderUserList: function() {
        UI.elements.userList.innerHTML = '';
        
        // 確保用戶列表不為空
        if (!this.userList || this.userList.length === 0) {
            console.log('用戶列表為空，無法渲染');
            return;
        }
        
        console.log('開始渲染用戶列表，總用戶數:', this.userList.length);
        
        // 獲取當前顯示的UUID
        const currentUuid = UI.elements.userUuidValue ? UI.elements.userUuidValue.textContent : null;
        console.log('當前顯示的UUID:', currentUuid);
        
        // 將用戶列表分為兩部分：UUID匹配的用戶和其他用戶
        let matchingUuidUser = null;
        let otherUsers = [];
        
        // 遍歷用戶列表，分離UUID匹配的用戶和其他用戶
        for (let i = 0; i < this.userList.length; i++) {
            const user = this.userList[i];
            if (currentUuid && user.id === currentUuid) {
                matchingUuidUser = user;
                console.log('找到UUID匹配的用戶:', user.id, user.name);
            } else {
                otherUsers.push(user);
            }
        }
        
        // 對其他用戶按名稱排序
        otherUsers.sort((a, b) => a.name.localeCompare(b.name));
        
        // 創建最終排序列表
        let sortedUsers = [];
        
        // 如果找到UUID匹配的用戶，將其放在第一位
        if (matchingUuidUser) {
            sortedUsers.push(matchingUuidUser);
            console.log('將UUID匹配的用戶放在第一位:', matchingUuidUser.id, matchingUuidUser.name);
        }
        
        // 添加其他用戶
        sortedUsers = sortedUsers.concat(otherUsers);
        
        console.log('排序後的用戶列表:', sortedUsers.map(u => u.id));
        
        // 渲染用戶列表
        sortedUsers.forEach(user => {
            const isSelf = this.currentUser && user.id === this.currentUser.id;
            
            const userItem = document.createElement('li');
            userItem.className = `list-group-item user-item ${isSelf ? 'user-self me' : ''}`;
            userItem.dataset.userId = user.id;
            
            const avatar = document.createElement('div');
            avatar.className = 'user-avatar';
            avatar.style.backgroundColor = user.color;
            avatar.textContent = user.avatar;
            
            const userInfo = document.createElement('div');
            userInfo.className = 'user-info';
            
            const name = document.createElement('div');
            name.className = 'user-name';
            // 確保當前用戶名稱前有星號，如果是UUID匹配的用戶，再多加一個星號
            const isUuidMatch = currentUuid && user.id === currentUuid;
            name.textContent = (isSelf ? '★ ' : '') + (isUuidMatch && !isSelf ? '★ ' : '') + user.name;
            
            const userId = document.createElement('div');
            userId.className = 'user-id';
            userId.textContent = user.id;
            
            userInfo.appendChild(name);
            userInfo.appendChild(userId);
            
            userItem.appendChild(avatar);
            userItem.appendChild(userInfo);
            
            UI.elements.userList.appendChild(userItem);
            
            if (isSelf) {
                console.log('已渲染當前用戶:', user.id, user.name, '位置:', sortedUsers.indexOf(user) + 1);
            }
        });
        
        // 觸發用戶列表更新事件
        document.dispatchEvent(new CustomEvent('userList:updated'));
    },
    
    /**
     * 開始編輯用戶名稱
     * @param {HTMLElement} userItem 用戶列表項元素
     */
    startNameEdit: function(userItem) {
        const nameElement = userItem.querySelector('.user-name');
        let currentName = nameElement.textContent;
        
        // 確保去除 "★ " 前綴
        currentName = currentName.replace(/^★\s+/, '');
        console.log('開始編輯名稱，去除星號後:', currentName);
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'user-name-edit';
        input.value = currentName;
        
        nameElement.textContent = '';
        nameElement.appendChild(input);
        
        input.focus();
        input.select();
    },
    
    /**
     * 完成編輯用戶名稱
     * @param {HTMLElement} input 輸入框元素
     */
    finishNameEdit: function(input) {
        const newName = input.value.trim();
        if (newName && newName !== this.currentUser.name) {
            this.updateUsername(newName);
        } else {
            // 如果名稱未更改，恢復原名稱（帶星號）
            const nameElement = input.parentElement;
            // 確保添加星號
            nameElement.textContent = '★ ' + this.currentUser.name;
            console.log('名稱未更改，恢復原名稱（帶星號）:', nameElement.textContent);
        }
    }
}; 