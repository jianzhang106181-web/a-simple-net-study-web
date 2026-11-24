/**
 * 认证模块（服务端实现）
 *
 * 后端：Spring Boot（server/ 目录，Maven 工程）+ MySQL 1110.student 表 + BCrypt 密码哈希
 * 接口：
 *   POST /api/register  {username, email, password}              → {ok, user | error, field}
 *   POST /api/login     {account(用户名/邮箱), password, remember} → {ok, user | error, field}
 *   GET  /api/session                                              → {loggedIn, user}
 *   POST /api/logout                                               → {ok}
 *
 * 登录态：服务端 Session（HttpOnly Cookie），注册/登录后浏览器自动携带
 *
 * 重要变化（相对旧的纯前端版）：
 *  - 会话不再存 localStorage，页面加载时通过 Auth.ready（单例 Promise）从服务端获取
 *  - register/login/logout 变为异步（返回 Promise）
 *  - 页面守卫 data-auth="required"/"guest" 改为会话就绪后判断
 *
 * 页面接入示例：
 *  <script src="static/js/auth.js" data-auth="required"></script>
 */
(function () {
    "use strict";

    var state = { session: null, loaded: false };

    /* ================= 请求封装 ================= */

    function request(url, body, method) {
        return fetch(url, {
            method: method || (body ? "POST" : "GET"),
            headers: body ? { "Content-Type": "application/json" } : undefined,
            credentials: "same-origin", // 携带会话 Cookie
            body: body ? JSON.stringify(body) : undefined
        }).then(function (res) {
            return res.json().catch(function () { return {}; }).then(function (data) {
                return { status: res.status, data: data };
            });
        });
    }

    function networkError() {
        return { ok: false, error: "网络错误：无法连接服务器，请确认后端已启动（server 目录，端口 8080）", field: null };
    }

    /* ================= 同步校验工具（与后端规则一致） ================= */

    function isValidEmail(email) {
        return /^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(String(email || "").trim());
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

    /* ================= 登录态 ================= */

    function getSession() {
        return state.session; // 服务端会话的本地缓存（Auth.ready 就绪后有值）
    }

    function isLoggedIn() {
        return !!state.session;
    }

    /* ================= 注册 / 登录 / 退出（异步） ================= */

    function register(data) {
        var payload = {
            username: String(data && data.name || "").trim(),
            email: String(data && data.email || "").trim().toLowerCase(),
            password: data && data.password
        };

        // 客户端预校验（与后端规则一致，减少一次往返）
        if (payload.username.length < 2 || payload.username.length > 20) {
            return Promise.resolve({ ok: false, error: "用户名需为 2-20 个字符", field: "username" });
        }
        if (!isValidEmail(payload.email)) {
            return Promise.resolve({ ok: false, error: "邮箱格式不正确", field: "email" });
        }
        if (!isStrongPassword(payload.password)) {
            return Promise.resolve({ ok: false, error: "密码至少 8 位，且需同时包含字母和数字", field: "password" });
        }

        return request("api/register", payload).then(function (r) {
            if (r.data && r.data.ok) return { ok: true, user: r.data.user };
            return {
                ok: false,
                error: (r.data && r.data.error) || "注册失败，请稍后重试",
                field: (r.data && r.data.field) || null
            };
        }).catch(function () { return networkError(); });
    }

    function login(account, password, remember) {
        return request("api/login", {
            account: String(account || "").trim(),
            password: String(password || ""),
            remember: !!remember
        }).then(function (r) {
            if (r.data && r.data.ok) {
                state.session = r.data.user;
                state.loaded = true;
                return { ok: true, user: r.data.user };
            }
            return {
                ok: false,
                error: (r.data && r.data.error) || "登录失败",
                field: (r.data && r.data.field) || null
            };
        }).catch(function () { return networkError(); });
    }

    function logout() {
        return request("api/logout", {}).then(function () {
            state.session = null;
            return true;
        }).catch(function () {
            state.session = null; // 即使请求失败也视为已退出
            return true;
        });
    }

    /* ================= 页面守卫工具 ================= */

    function currentPage() {
        var p = location.pathname.split("/").pop();
        return p || "index1.html";
    }

    /** 仅允许站内 .html 相对路径（可带 query 参数），防止开放重定向 */
    function safeRedirect(target, fallback) {
        if (target && /^[\w-]+\.html(\?[\w=&%.-]*)?$/.test(target)) return target;
        return fallback;
    }

    function requireLoginRedirect() {
        location.replace("login.html?next=" + encodeURIComponent(currentPage()));
    }

    /** 受保护页面逻辑内使用：请放在 Auth.ready.then 回调中判断 */
    function requireLogin() {
        if (isLoggedIn()) return true;
        requireLoginRedirect();
        return false;
    }

    function redirectIfLoggedIn() {
        if (isLoggedIn()) location.replace("index1.html");
    }

    /* ================= 导出 ================= */

    var Auth = {
        register: register,
        login: login,
        logout: logout,
        getSession: getSession,
        isLoggedIn: isLoggedIn,
        isValidEmail: isValidEmail,
        isStrongPassword: isStrongPassword,
        passwordStrength: passwordStrength,
        requireLogin: requireLogin,
        redirectIfLoggedIn: redirectIfLoggedIn,
        safeRedirect: safeRedirect,
        currentPage: currentPage
    };

    if (typeof window !== "undefined") window.Auth = Auth;

    /* ================= 会话预热（单例 Promise） ================= */

    Auth.ready = request("api/session").then(function (r) {
        state.session = r.data && r.data.loggedIn ? r.data.user : null;
        state.loaded = true;
        return state.session;
    }).catch(function () {
        state.loaded = true;
        return null;
    });

    /* ================= 自动守卫 ================= */

    (function autoRun() {
        if (typeof document === "undefined") return;
        var mode = "";
        try {
            mode = (document.currentScript && document.currentScript.getAttribute("data-auth")) || "";
        } catch (e) { }
        if (!mode) return;
        Auth.ready.then(function () {
            if (mode === "required" && !Auth.isLoggedIn()) requireLoginRedirect();
            if (mode === "guest" && Auth.isLoggedIn()) location.replace("index1.html");
        });
    })();

})();
