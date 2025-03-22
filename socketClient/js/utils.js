/**
 * 工具模組 - 包含通用工具函數
 */
const Utils = {
    /**
     * 從本地存儲獲取用戶信息
     * @returns {Object|null} 用戶信息對象或null
     */
    getUserFromStorage: function() {
        const userId = localStorage.getItem(Config.storage.userId);
        const userName = localStorage.getItem(Config.storage.userName);
        
        if (!userId || !userName) {
            return null;
        }
        
        return {
            id: userId,
            name: userName,
            avatar: localStorage.getItem(Config.storage.userAvatar) || this.generateAvatar(userName),
            color: localStorage.getItem(Config.storage.userColor) || this.generateColor(userName)
        };
    },
    
    /**
     * 將用戶信息保存到本地存儲
     * @param {Object} user 用戶信息對象
     */
    saveUserToStorage: function(user) {
        localStorage.setItem(Config.storage.userId, user.id);
        localStorage.setItem(Config.storage.userName, user.name);
        localStorage.setItem(Config.storage.userAvatar, user.avatar);
        localStorage.setItem(Config.storage.userColor, user.color);
    },
    
    /**
     * 根據名稱生成頭像
     * @param {string} name 用戶名稱
     * @returns {string} 頭像表情符號
     */
    generateAvatar: function(name) {
        const hash = this.hashString(name);
        return Config.avatars[hash % Config.avatars.length];
    },
    
    /**
     * 根據名稱生成顏色
     * @param {string} name 用戶名稱
     * @returns {string} 十六進制顏色代碼
     */
    generateColor: function(name) {
        const hash = this.hashString(name);
        // 生成柔和的顏色
        const h = hash % 360;
        const s = 60 + (hash % 20);
        const l = 65 + (hash % 15);
        return this.hslToHex(h, s, l);
    },
    
    /**
     * 計算字符串的哈希值
     * @param {string} str 輸入字符串
     * @returns {number} 哈希值
     */
    hashString: function(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0; // 轉換為32位整數
        }
        return Math.abs(hash);
    },
    
    /**
     * 將HSL顏色轉換為十六進制顏色代碼
     * @param {number} h 色相 (0-360)
     * @param {number} s 飽和度 (0-100)
     * @param {number} l 亮度 (0-100)
     * @returns {string} 十六進制顏色代碼
     */
    hslToHex: function(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    },
    
    /**
     * 格式化時間戳為可讀時間
     * @param {number} timestamp 時間戳（秒）
     * @returns {string} 格式化的時間字符串
     */
    formatTime: function(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString(undefined, Config.ui.messageTimeFormat);
    },
    
    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    /**
     * 轉義HTML特殊字符
     * @param {string} text 輸入文本
     * @returns {string} 轉義後的文本
     */
    escapeHtml: function(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}; 