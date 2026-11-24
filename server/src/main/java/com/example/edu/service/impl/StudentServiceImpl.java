package com.example.edu.service.impl;

import com.baomidou.mybatisplus.spring.service.impl.ServiceImpl;
import com.example.edu.entity.Student;
import com.example.edu.mapper.StudentMapper;
import com.example.edu.service.StudentService;
import org.springframework.stereotype.Service;

@Service
public class StudentServiceImpl extends ServiceImpl<StudentMapper, Student> implements StudentService {
}
