package com.example.edu.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.edu.entity.Student;
import com.example.edu.service.StudentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * 注册 / 登录 / 会话 / 退出接口
 *
 * 返回统一 JSON：
 *   成功 {ok:true, user:{id,name,email,createdAt}}
 *   失败 {ok:false, error:"提示", field:"出错字段"}
 *   会话 {loggedIn:true|false, user:...}
 */
@RestController
@RequestMapping("/api")
public class AuthController {

    private static final Pattern EMAIL_RE = Pattern.compile("^[\\w.+-]+@[\\w-]+(\\.[\\w-]+)+$");

    /** 会话有效期（秒）：默认 7 天，勾选记住我 30 天 */
    private static final int SESSION_DAYS = 7 * 24 * 3600;
    private static final int SESSION_DAYS_REMEMBER = 30 * 24 * 3600;

    @Autowired
    private StudentService service;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    /* ================= 工具 ================= */

    private Map<String, Object> ok(Object user) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("ok", true);
        if (user != null) m.put("user", user);
        return m;
    }

    private Map<String, Object> fail(String error, String field) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("ok", false);
        m.put("error", error);
        if (field != null) m.put("field", field);
        return m;
    }

    private Map<String, Object> userPayload(Student s) {
        Map<String, Object> u = new LinkedHashMap<>();
        u.put("id", s.getId());
        u.put("name", s.getUsername());
        u.put("email", s.getEmail());
        u.put("createdAt", s.getCreatedAt() == null ? null : s.getCreatedAt().toString());
        return u;
    }

    /* ================= 注册 ================= */

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody Map<String, String> body) {
        String username = str(body.get("username"));
        String email = str(body.get("email")).toLowerCase();
        String password = str(body.get("password"));

        if (username.length() < 2 || username.length() > 20) {
            return fail("用户名需为 2-20 个字符", "username");
        }
        if (!EMAIL_RE.matcher(email).matches()) {
            return fail("邮箱格式不正确", "email");
        }
        if (password.length() < 8 || !password.matches(".*[A-Za-z].*") || !password.matches(".*\\d.*")) {
            return fail("密码至少 8 位，且需同时包含字母和数字", "password");
        }

        Student s = new Student();
        s.setUsername(username);
        s.setEmail(email);
        s.setPassword(encoder.encode(password)); // BCrypt 哈希，不存明文

        try {
            service.save(s);
        } catch (DuplicateKeyException e) {
            // 唯一索引冲突：区分是用户名还是邮箱
            boolean dupUser = service.count(new QueryWrapper<Student>().eq("username", username)) > 0;
            if (dupUser) return fail("该用户名已被注册", "username");
            return fail("该邮箱已被注册，请直接登录", "email");
        }
        return ok(userPayload(s));
    }

    /* ================= 登录（支持用户名或邮箱） ================= */

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        String account = str(body.get("account"));
        String password = str(body.get("password"));
        boolean remember = Boolean.TRUE.equals(body.get("remember"));

        if (account.isEmpty() || password.isEmpty()) {
            return fail("请输入用户名/邮箱和密码", null);
        }

        Student user = service.getOne(new QueryWrapper<Student>()
                .eq("username", account)
                .or()
                .eq("email", account.toLowerCase())
                .last("LIMIT 1"));

        // 统一提示，避免暴露账号是否存在
        if (user == null || !encoder.matches(password, user.getPassword())) {
            return fail("用户名/邮箱或密码错误", "password");
        }

        HttpSession httpSession = request.getSession(true);
        httpSession.setAttribute("uid", user.getId());
        httpSession.setMaxInactiveInterval(remember ? SESSION_DAYS_REMEMBER : SESSION_DAYS);
        return ok(userPayload(user));
    }

    /* ================= 当前会话 ================= */

    @GetMapping("/session")
    public Map<String, Object> session(HttpServletRequest request) {
        Map<String, Object> m = new LinkedHashMap<>();
        HttpSession httpSession = request.getSession(false);
        Object uid = httpSession == null ? null : httpSession.getAttribute("uid");
        Student user = uid == null ? null : service.getById((Integer) uid);
        if (user == null) {
            m.put("loggedIn", false);
            return m;
        }
        m.put("loggedIn", true);
        m.put("user", userPayload(user));
        return m;
    }

    /* ================= 退出 ================= */

    @PostMapping("/logout")
    public Map<String, Object> logout(HttpServletRequest request) {
        HttpSession httpSession = request.getSession(false);
        if (httpSession != null) httpSession.invalidate();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("ok", true);
        return m;
    }

    private String str(Object v) {
        return v == null ? "" : String.valueOf(v).trim();
    }
}
