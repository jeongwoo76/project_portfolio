package com.yoonlee3.diary.goal;

import java.sql.Date;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.yoonlee3.diary.Diary1Application;
import com.yoonlee3.diary.openScope.OpenScope;
import com.yoonlee3.diary.openScope.OpenScopeRepository;
import com.yoonlee3.diary.user.User;
import com.yoonlee3.diary.user.UserRepository;
import com.yoonlee3.diary.user.UserService;

@SpringBootTest(classes = Diary1Application.class)
public class GoalTest {
	
	@Autowired
	GoalService goalService;
	@Autowired
	GoalRepository goalRepository;
	@Autowired
	UserRepository userRepository;
	@Autowired
	OpenScopeRepository openScopeRepository;
	
	@Test
	void insert() {
		Goal goal = new Goal();
		User user = userRepository.findById(1l).orElseThrow();
		
		goal.setUser(user);
		goal.setGoal_content("매일 30분 독서하기");
		

//		Date dueDate = Date.valueOf("2025-04-01");
//		goal.setDueDate(dueDate);
		
		OpenScope openscope = openScopeRepository.findById(4l).orElseThrow();
		goal.setOpenScope(openscope);
		
		goalRepository.save(goal);
	}
	
}
