/**
 * 已购课程模块（纯前端，数据存储于 localStorage）
 *
 * 与 static/js/auth.js 的存储体系保持一致：
 *  - 键名：my_courses，值为已购/已加入课程的 id 数组（JSON）
 *  - 读取时做防御性解析（非法 JSON / 非数组均回退为空数组）
 *  - 供 course-detail.html / learn.html / profile.html 共用
 */
(function () {
    "use strict";

    var KEY = "my_courses";

    function readList() {
        try {
            var raw = localStorage.getItem(KEY);
            var list = raw ? JSON.parse(raw) : [];
            return Array.isArray(list) ? list : [];
        } catch (e) {
            return [];
        }
    }

    function writeList(list) {
        try {
            localStorage.setItem(KEY, JSON.stringify(list));
            return true;
        } catch (e) {
            return false;
        }
    }

    function hasCourse(id) {
        return readList().indexOf(String(id)) !== -1;
    }

    function addCourse(id) {
        id = String(id);
        if (!id) return false;
        var list = readList();
        if (list.indexOf(id) !== -1) return true; // 已存在视为成功
        list.push(id);
        return writeList(list);
    }

    function removeCourse(id) {
        id = String(id);
        return writeList(readList().filter(function (item) { return item !== id; }));
    }

    function count() {
        return readList().length;
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    if (typeof window !== "undefined") {
        window.MyCourses = {
            get: readList,
            has: hasCourse,
            add: addCourse,
            remove: removeCourse,
            count: count,
            escapeHtml: escapeHtml
        };
    }
})();
