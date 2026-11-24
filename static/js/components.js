/**
 * 站点统一组件：导航栏 + 页脚（JS 注入）
 *
 * 用法：页面只需放置占位符并按顺序引入：
 *   <div id="site-nav"></div>     <!-- 原导航栏位置 -->
 *   ...
 *   <div id="site-footer"></div>  <!-- 原页脚位置 -->
 *   <script src="static/js/auth.js"></script>
 *   <script src="static/js/components.js"></script>
 *
 * 特性：
 *   1. active 自动判断：location.pathname 取当前文件名与导航项 href 比对
 *   2. 登录态渲染：Auth.getSession() 无 → "登录 / 注册"按钮；有 → 用户名下拉
 *   3. 退出登录：下拉项绑定 click，Auth.logout() 清除登录态后 location.reload()
 *   4. 搜索框：导航右侧 form submit + preventDefault → course-list.html?q=encodeURIComponent(关键词)
 *   5. 页脚：真实链接、明文 mailto、动态版权年份、订阅邮箱校验、图集懒加载与 alt、国内社交图标
 *   6. 路径均为相对文件名；若日后进入子目录，只需在此处统一加 basePath 前缀
 */
(function () {
    "use strict";

    /* ---------- 工具 ---------- */
    function esc(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    /** 当前页面文件名（项目平铺，直接取最后一段；无文件名时视为主页） */
    function currentPage() {
        var p = location.pathname.split("/").pop();
        return p || "index1.html";
    }

    /** 2) active 自动判断 */
    function isActive(href) {
        return currentPage().toLowerCase() === String(href).toLowerCase();
    }

    /* ---------- 导航数据 ---------- */
    var MAIN_ITEMS = [
        { href: "index1.html", label: "首页" },
        { href: "about.html", label: "关于我们" },
        { href: "courses.html", label: "课程" }
    ];
    var DROP_ITEMS = [
        { href: "course-list.html", label: "课程列表" },
        { href: "profile.html", label: "个人中心" },
        { href: "faq.html", label: "常见问题" },
        { href: "terms.html", label: "服务条款" },
        { href: "team.html", label: "讲师团队" },
        { href: "testimonial.html", label: "学员评价" },
        { href: "404.html", label: "404 页面" }
    ];

    /* ---------- 导航栏 ---------- */
    function buildNav() {
        var session = (window.Auth && typeof Auth.getSession === "function") ? Auth.getSession() : null;
        var html = '<nav class="navbar navbar-expand-lg bg-white navbar-light shadow sticky-top p-0">';
        html += '<a href="index1.html" class="navbar-brand d-flex align-items-center px-4 px-lg-5">';
        html += '<h2 class="m-0 text-primary"><i class="fa fa-book me-3"></i>在线学习</h2></a>';
        html += '<button type="button" class="navbar-toggler me-4" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">';
        html += '<span class="navbar-toggler-icon"></span></button>';
        html += '<div class="collapse navbar-collapse" id="navbarCollapse">';
        html += '<div class="navbar-nav ms-auto p-4 p-lg-0">';

        MAIN_ITEMS.forEach(function (it) {
            html += '<a href="' + it.href + '" class="nav-item nav-link' + (isActive(it.href) ? " active" : "") + '">' + esc(it.label) + "</a>";
        });

        var dropActive = DROP_ITEMS.some(function (it) { return isActive(it.href); });
        html += '<div class="nav-item dropdown">';
        html += '<a href="#" class="nav-link dropdown-toggle' + (dropActive ? " active" : "") + '" data-bs-toggle="dropdown">更多页面</a>';
        html += '<div class="dropdown-menu fade-down m-0">';
        DROP_ITEMS.forEach(function (it) {
            html += '<a href="' + it.href + '" class="dropdown-item' + (isActive(it.href) ? " active" : "") + '">' + esc(it.label) + "</a>";
        });
        /* 小屏按钮被隐藏，未登录时在下拉里保留登录/注册入口 */
        if (!session) {
            html += '<a href="login.html" class="dropdown-item">登录</a>';
            html += '<a href="register.html" class="dropdown-item">注册</a>';
        }
        html += "</div></div>";

        html += '<a href="contact.html" class="nav-item nav-link' + (isActive("contact.html") ? " active" : "") + '">联系我们</a>';
        html += "</div>";

        /* 4) 搜索框：导航中间，小屏隐藏（小屏用页面内搜索） */
        html += '<form class="d-none d-lg-flex align-items-center mx-3" id="navSearchForm" role="search">'
            + '<div class="input-group input-group-sm" style="width: 200px;">'
            + '<input type="search" class="form-control border-0 py-2" placeholder="搜索课程..." aria-label="搜索课程">'
            + '<button class="btn btn-primary" type="submit" aria-label="搜索"><i class="fa fa-search"></i></button>'
            + "</div></form>";

        /* 3) 登录态渲染 */
        if (session) {
            html += '<div class="nav-item dropdown d-none d-lg-block">'
                + '<a href="#" class="btn btn-outline-primary py-3 px-lg-4 dropdown-toggle" data-bs-toggle="dropdown">'
                + '<i class="fa fa-user-circle me-2"></i>' + esc(session.name) + "</a>"
                + '<div class="dropdown-menu fade-down m-0">'
                + '<a class="dropdown-item" href="profile.html#my-courses"><i class="fa fa-book-open me-2"></i>我的课程</a>'
                + '<a class="dropdown-item" href="profile.html"><i class="fa fa-user me-2"></i>个人中心</a>'
                + '<hr class="dropdown-divider">'
                + '<a class="dropdown-item" href="javascript:;" id="navLogout"><i class="fa fa-sign-out-alt me-2"></i>退出登录</a>'
                + "</div></div>";
        } else {
            html += '<a href="login.html" class="btn btn-primary py-4 px-lg-5 d-none d-lg-block">登录 / 注册<i class="fa fa-arrow-right ms-3"></i></a>';
        }

        html += "</div></nav>";
        return html;
    }

    /* 4) 搜索提交 + 3) 退出登录 */
    function bindNavEvents(root) {
        var form = root.querySelector("#navSearchForm");
        if (form) {
            form.addEventListener("submit", function (e) {
                e.preventDefault();
                var input = form.querySelector("input[type=search]");
                var kw = ((input && input.value) || "").trim();
                if (!kw) return;
                location.href = "course-list.html?q=" + encodeURIComponent(kw);
            });
        }
        var logoutLink = root.querySelector("#navLogout");
        if (logoutLink) {
            logoutLink.addEventListener("click", function (e) {
                e.preventDefault();
                var done = false;
                var go = function () { if (!done) { done = true; location.reload(); } };
                try {
                    var p = Auth.logout(); // 服务端销毁会话（异步）
                    if (p && typeof p.then === "function") p.then(go);
                    else go();
                } catch (err) {
                    go();
                }
                setTimeout(go, 2000); // 网络异常兜底
            });
        }
    }

    /* ---------- 页脚 ---------- */
    var EMAIL_RE = /^[\w.+-]+@[\w-]+(\.[\w-]+)+$/;

    function buildFooter() {
        var year = new Date().getFullYear(); /* 动态版权年份 */

        /* 课程图集：alt + 懒加载 */
        var gallery = "";
        for (var i = 1; i <= 6; i++) {
            var n = ((i - 1) % 3) + 1;
            gallery += '<div class="col-4"><img class="img-fluid bg-light p-1" src="static/picture/course-' + n
                + '.jpg" alt="课程掠影 ' + i + '" loading="lazy"></div>';
        }

        var socials = [
            { label: "微博", icon: '<i class="fab fa-weibo"></i>' },
            { label: "微信公众号", icon: '<i class="fab fa-weixin"></i>' },
            { label: "哔哩哔哩", icon: '<i class="bi bi-play-btn"></i>' },
            { label: "GitHub", icon: '<i class="fab fa-github"></i>' }
        ].map(function (s) {
            return '<a class="btn btn-outline-light btn-social" href="javascript:;" onclick="alert(\'暂未设置\')" aria-label="' + s.label + '">' + s.icon + "</a>";
        }).join("");

        return '<div class="container-fluid bg-dark text-light footer pt-5 mt-5">'
            + '<div class="container py-5"><div class="row g-5">'
            /* 快速链接：全部为真实页面 */
            + '<div class="col-lg-3 col-md-6 col-sm-12"><h4 class="text-white mb-3">快速链接</h4>'
            + '<a class="btn btn-link" href="about.html">关于我们</a>'
            + '<a class="btn btn-link" href="courses.html">课程列表</a>'
            + '<a class="btn btn-link" href="course-list.html">全部课程</a>'
            + '<a class="btn btn-link" href="faq.html">常见问题</a>'
            + '<a class="btn btn-link" href="terms.html">服务条款</a>'
            + "</div>"
            /* 联系方式：明文 mailto */
            + '<div class="col-lg-3 col-md-6 col-sm-12"><h4 class="text-white mb-3">联系方式</h4>'
            + '<p class="mb-2"><i class="fa fa-map-marker-alt me-3"></i>中国某某省某某市某某区某某路123号</p>'
            + '<p class="mb-2"><i class="fa fa-phone-alt me-3"></i>+86 138 0000 0000</p>'
            + '<p class="mb-2"><i class="fa fa-envelope me-3"></i><a class="text-light" href="mailto:contact@example.com">contact@example.com</a></p>'
            + '<div class="d-flex pt-2">' + socials + "</div>"
            + "</div>"
            + '<div class="col-lg-3 col-md-6 col-sm-12"><h4 class="text-white mb-3">课程图集</h4>'
            + '<div class="row g-2 pt-2">' + gallery + "</div>"
            + "</div>"
            /* 订阅表单：submit 处理 + 邮箱校验 + 成功/失败提示 */
            + '<div class="col-lg-3 col-md-6 col-sm-12"><h4 class="text-white mb-3">订阅资讯</h4>'
            + "<p>订阅我们的邮件，第一时间获取最新课程与活动资讯。</p>"
            + '<form id="footerSubscribe" novalidate>'
            + '<div class="position-relative mx-auto" style="max-width: 400px;">'
            + '<input class="form-control border-0 w-100 py-3 ps-4 pe-5" type="email" placeholder="请输入您的邮箱" aria-label="订阅邮箱">'
            + '<button class="btn btn-primary py-2 position-absolute top-0 end-0 mt-2 me-2" type="submit">订阅</button>'
            + "</div>"
            + '<small class="d-block mt-2" id="subscribeMsg"></small>'
            + "</form>"
            + "</div>"
            + "</div></div>"
            + '<div class="container"><div class="copyright"><div class="row">'
            + '<div class="col-md-6 text-center text-md-start mb-3 mb-md-0">版权所有 &copy; ' + year + ' 在线学习 保留所有权利.</div>'
            + '<div class="col-md-6 text-center text-md-end"><div class="footer-menu">'
            + '<a href="index1.html">首页</a>'
            + '<a href="courses.html">课程</a>'
            + '<a href="faq.html">帮助</a>'
            + '<a href="contact.html">联系</a>'
            + "</div></div></div></div></div></div>";
    }

    function bindFooterEvents(root) {
        var form = root.querySelector("#footerSubscribe");
        if (!form) return;
        var input = form.querySelector("input[type=email]");
        var msg = form.querySelector("#subscribeMsg");
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var v = ((input && input.value) || "").trim();
            if (!EMAIL_RE.test(v)) {
                msg.textContent = "订阅失败：邮箱格式不正确，请检查后重试。";
                msg.className = "d-block mt-2 text-warning";
                if (input) input.focus();
                return;
            }
            msg.textContent = "订阅成功！确认邮件已发送至 " + v + "。";
            msg.className = "d-block mt-2 text-success";
            if (input) input.value = "";
        });
    }

    /* ---------- 挂载 ---------- */
    /* 页脚与登录态无关，立即挂载；导航栏含登录态渲染，等服务端会话（Auth.ready）就绪后再挂载 */
    var footPh = document.getElementById("site-footer");
    if (footPh) {
        footPh.outerHTML = buildFooter();
        bindFooterEvents(document);
    }

    function mountNav() {
        var navPh = document.getElementById("site-nav");
        if (navPh) {
            navPh.outerHTML = buildNav();
            bindNavEvents(document);
        }
    }

    if (window.Auth && window.Auth.ready && typeof window.Auth.ready.then === "function") {
        window.Auth.ready.then(mountNav);
    } else {
        mountNav(); // 未引入 auth.js 的兜底
    }
})();
