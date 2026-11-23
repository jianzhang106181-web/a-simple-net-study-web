/**
 * 认证模块（纯前端实现，数据存储于 localStorage）
 *
 * 功能：
 *  - 注册 / 登录 / 退出：用户与登录态均存于 localStorage
 *  - 密码处理：随机盐 + SHA-256 哈希后存储，不保存明文
 *    （内置纯 JS SHA-256，兼容 file:// 等无 crypto.subtle 的场景）
 *  - 登录态管理：会话含过期时间（默认 7 天，勾选"记住我"延长至 30 天），过期自动清除
 *  - 页面守卫：通过 script 标签的 data-auth 属性自动生效
 *      data-auth="required" → 受保护页面，未登录跳转 login.html?next=当前页
 *      data-auth="guest"    → 登录/注册页，已登录则跳转首页
 *      不设置               → 公开页面，仅同步导航栏登录态
 *
 * 页面接入示例：
 *  <script src="static/js/auth.js" data-auth="required"></script>
 */
(function () {
    "use strict";

    var USERS_KEY = "edu_users";
    var SESSION_KEY = "edu_session";
    var SESSION_DAYS = 7;
    var SESSION_DAYS_REMEMBER = 30;

    /* ================= SHA-256 纯 JS 实现 ================= */

    function rightRotate(value, amount) {
        return (value >>> amount) | (value << (32 - amount));
    }

    function sha256(ascii) {
        var mathPow = Math.pow;
        var maxWord = mathPow(2, 32);
        var lengthProperty = "length";
        var i, j;
        var result = "";
        var words = [];
        var asciiBitLength = ascii[lengthProperty] * 8;
        var hash = sha256.h = sha256.h || [];
        var k = sha256.k = sha256.k || [];
        var primeCounter = k[lengthProperty];
        var isComposite = {};

        for (var candidate = 2; primeCounter < 64; candidate++) {
            if (!isComposite[candidate]) {
                for (i = 0; i < 313; i += candidate) {
                    isComposite[i] = candidate;
                }
                hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
                k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
            }
        }

        ascii += "\x80";
        while (ascii[lengthProperty] % 64 - 56) ascii += "\x00";
        for (i = 0; i < ascii[lengthProperty]; i++) {
            j = ascii.charCodeAt(i);
            if (j >> 8) return "";
            words[i >> 2] |= j << ((3 - i) % 4) * 8;
        }
        words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
        words[words[lengthProperty]] = (asciiBitLength);

        for (j = 0; j < words[lengthProperty];) {
            var w = words.slice(j, j += 16);
            var oldHash = hash;
            hash = hash.slice(0, 8);

            for (i = 0; i < 64; i++) {
                var w15 = w[i - 15], w2 = w[i - 2];
                var a = hash[0], e = hash[4];
                var temp1 = hash[7]
                    + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
                    + ((e & hash[5]) ^ ((~e) & hash[6]))
                    + k[i]
                    + (w[i] = (i < 16) ? w[i] : (
                        w[i - 16]
                        + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
                        + w[i - 7]
                        + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
                    ) | 0);
                var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
                    + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

                hash = [(temp1 + temp2) | 0].concat(hash);
                hash[4] = (hash[4] + temp1) | 0;
            }

            for (i = 0; i < 8; i++) {
                hash[i] = (hash[i] + oldHash[i]) | 0;
            }
        }

        for (i = 0; i < 8; i++) {
            for (j = 3; j + 1; j--) {
                var b = (hash[i] >> (j * 8)) & 255;
                result += ((b < 16) ? 0 : "") + b.toString(16);
            }
        }
        return result;
    }

    /** 字符串 → UTF-8 字节序列（二进制字符串），支持中文等非 ASCII 字符 */
    function hashString(str) {
        var bytes = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (_, h) {
            return String.fromCharCode(parseInt(h, 16));
        });
        return sha256(bytes);
    }

    /* ================= 工具函数 ================= */

    function readJSON(key, fallback) {
        try {
            var raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) {
            return fallback;
        }
    }

    function writeJSON(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    }

    function randomHex(byteLen) {
        var arr = new Uint8Array(byteLen);
        if (typeof crypto !== "undefined" && crypto.getRandomValues) {
            crypto.getRandomValues(arr);
        } else {
            for (var i = 0; i < arr.length; i++) {
                arr[i] = Math.floor(Math.random() * 256);
            }
        }
        return Array.prototype.map.call(arr, function (b) {
            return ("0" + b.toString(16)).slice(-2);
        }).join("");
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    /* ================= 校验规则（自定义校验） ================= */

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
    }

    /** 密码强度：至少 8 位且同时包含字母和数字 */
    function isStrongPassword(pw) {
        return typeof pw === "string" && pw.length >= 8 && /[A-Za-z]/.test(pw) && /\d/.test(pw);
    }

    /** 强度评分 0-4，用于注册页强度条 */
    function passwordStrength(pw) {
        pw = String(pw || "");
        var score = 0;
        if (pw.length >= 8) score++;
        if (pw.length >= 12) score++;
        if (/[A-Za-z]/.test(pw) && /\d/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        var labels = ["太弱", "弱", "一般", "较强", "很强"];
        return { score: score, label: labels[score] };
    }

    /* ================= 用户存储 ================= */

    function getUsers() {
        return readJSON(USERS_KEY, []);
    }

    function saveUsers(users) {
        return writeJSON(USERS_KEY, users);
    }

    function findByEmail(email) {
        var e = String(email || "").trim().toLowerCase();
        var list = getUsers();
        for (var i = 0; i < list.length; i++) {
            if (list[i].email === e) return list[i];
        }
        return null;
    }

    /* ================= 注册 / 登录 / 退出 ================= */

    function register(data) {
        var name = String(data && data.name || "").trim();
        var email = String(data && data.email || "").trim().toLowerCase();
        var password = data && data.password;

        if (name.length < 2 || name.length > 20) {
            return { ok: false, error: "姓名需为 2-20 个字符" };
        }
        if (!isValidEmail(email)) {
            return { ok: false, error: "邮箱格式不正确" };
        }
        if (!isStrongPassword(password)) {
            return { ok: false, error: "密码至少 8 位，且需同时包含字母和数字" };
        }
        if (findByEmail(email)) {
            return { ok: false, error: "该邮箱已被注册" };
        }

        var salt = randomHex(16);
        var user = {
            id: randomHex(8),
            name: name,
            email: email,
            salt: salt,                                  // 随机盐
            hash: hashString(salt + "::" + password),    // 仅存哈希，不存明文
            createdAt: Date.now()
        };
        var users = getUsers();
        users.push(user);
        if (!saveUsers(users)) {
            return { ok: false, error: "保存失败：浏览器存储不可用" };
        }
        return { ok: true, user: { id: user.id, name: user.name, email: user.email } };
    }

    function login(email, password, remember) {
        var user = findByEmail(email);
        // 统一提示，避免暴露"邮箱是否存在"
        if (!user || user.hash !== hashString(user.salt + "::" + String(password || ""))) {
            return { ok: false, error: "邮箱或密码错误" };
        }
        var days = remember ? SESSION_DAYS_REMEMBER : SESSION_DAYS;
        var session = {
            userId: user.id,
            name: user.name,
            email: user.email,
            token: randomHex(16),
            loginAt: Date.now(),
            expiresAt: Date.now() + days * 24 * 60 * 60 * 1000
        };
        if (!writeJSON(SESSION_KEY, session)) {
            return { ok: false, error: "保存失败：浏览器存储不可用" };
        }
        return { ok: true, user: { id: user.id, name: user.name, email: user.email } };
    }

    function logout() {
        try { localStorage.removeItem(SESSION_KEY); } catch (e) { }
    }

    /* ================= 登录态管理 ================= */

    function getSession() {
        var s = readJSON(SESSION_KEY, null);
        if (!s) return null;
        if (!s.expiresAt || Date.now() > s.expiresAt) {
            logout(); // 会话过期自动清除
            return null;
        }
        return s;
    }

    function isLoggedIn() {
        return !!getSession();
    }

    /* ================= 页面守卫 ================= */

    function currentPage() {
        var p = location.pathname.split("/").pop();
        return p || "index1.html";
    }

    /** 仅允许站内 .html 相对路径（可带 query 参数，如 ?id=xxx），防止开放重定向 */
    function safeRedirect(target, fallback) {
        if (target && /^[\w-]+\.html(\?[\w=&%.-]*)?$/.test(target)) return target;
        return fallback;
    }

    /** 受保护页面：未登录 → 跳转登录页并携带 next 参数 */
    function requireLogin() {
        if (isLoggedIn()) return true;
        location.replace("login.html?next=" + encodeURIComponent(currentPage()));
        return false;
    }

    /** 登录/注册页：已登录 → 跳转首页 */
    function redirectIfLoggedIn() {
        if (isLoggedIn()) location.replace("index1.html");
    }

    /* ================= 导航栏登录态同步 ================= */

    function syncNavbar() {
        /* 导航栏登录态（登录/注册按钮、用户下拉、退出）已由 components.js 统一渲染，此处不再重复处理 */
    }

    /* ================= 导出 ================= */

    var Auth = {
        register: register,
        login: login,
        logout: logout,
        getSession: getSession,
        isLoggedIn: isLoggedIn,
        isValidEmail: isValidEmail,
        emailExists: function (email) { return !!findByEmail(email); },
        isStrongPassword: isStrongPassword,
        passwordStrength: passwordStrength,
        requireLogin: requireLogin,
        redirectIfLoggedIn: redirectIfLoggedIn,
        safeRedirect: safeRedirect,
        currentPage: currentPage,
        _sha256: hashString
    };

    if (typeof window !== "undefined") window.Auth = Auth;

    /* ================= 自动守卫 ================= */

    (function autoRun() {
        if (typeof document === "undefined") return;
        var mode = "";
        try {
            mode = (document.currentScript && document.currentScript.getAttribute("data-auth")) || "";
        } catch (e) { }
        if (mode === "required") {
            requireLogin();
        } else if (mode === "guest") {
            redirectIfLoggedIn();
        }
        document.addEventListener("DOMContentLoaded", syncNavbar);
    })();

})();
