package com.example.edu.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 学生账号表：1110.student
 * password 字段存 BCrypt 哈希，永远不存明文
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@TableName("student")
public class Student {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private String username;
    private String email;
    private String password;
    private LocalDateTime createdAt;
}
