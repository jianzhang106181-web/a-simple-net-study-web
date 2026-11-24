package com.example.edu.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 静态站点托管：
 *   - 后端放在项目 server/ 子目录，静态站点在上级目录（moban6564/）
 *   - /** 直接映射到上级目录，页面与接口同源，fetch 带 Cookie 无跨域问题
 *   - 访问 / 时重定向到首页 index1.html
 *   - 可用 -Dapp.site-dir=绝对路径 覆盖站点目录
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String siteDir = System.getProperty("app.site-dir");
        if (siteDir == null || siteDir.isBlank()) {
            // 默认：server/ 的上级目录（即 moban6564 项目根）
            siteDir = Paths.get(System.getProperty("user.dir")).toAbsolutePath()
                    .normalize().getParent().toString();
        }
        Path root = Paths.get(siteDir).toAbsolutePath().normalize();
        if (!Files.isDirectory(root)) {
            throw new IllegalStateException("站点目录不存在: " + root);
        }
        String location = "file:" + root.toString().replace('\\', '/') + "/";
        registry.addResourceHandler("/**")
                .addResourceLocations(location)
                .setCachePeriod(0);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addRedirectViewController("/", "/index1.html");
    }
}
