package com.yoonlee3.diary.user;


import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.annotation.Rollback;

import com.yoonlee3.diary.Diary1Application;
import com.yoonlee3.diary.user.User;
import com.yoonlee3.diary.user.UserRepository;

@SpringBootTest(classes = Diary1Application.class)
@Rollback(false)
public class UserTest {
	
	@Autowired 
    UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Test
    public void insertUser2() {
        User user = new User();
        user.setUsername("admin");
        user.setEmail("admin@admin.com");
        user.setPassword(passwordEncoder.encode("1234")); // 비밀번호 암호화
        
        userRepository.save(user);
        
        // 다른 사용자들에도 동일하게 암호화된 비밀번호 설정
        User user2 = new User();
        user2.setUsername("test1");
        user2.setEmail("test1@test.com");
        user2.setPassword(passwordEncoder.encode("test1")); // 비밀번호 암호화
        
        userRepository.save(user2);
        
        User user3 = new User();
        user3.setUsername("apple");
        user3.setEmail("apple@test.com");
        user3.setPassword(passwordEncoder.encode("1111")); // 비밀번호 암호화
        
        userRepository.save(user3);
        
        User user4 = new User();
        user4.setUsername("banana");
        user4.setEmail("banana@test.com");
        user4.setPassword(passwordEncoder.encode("2222")); // 비밀번호 암호화
        
        userRepository.save(user4);
        
        User user5 = new User();
        user5.setUsername("mango");
        user5.setEmail("mango@test.com");
        user5.setPassword(passwordEncoder.encode("3333")); // 비밀번호 암호화
        
        userRepository.save(user5);
    }
}

