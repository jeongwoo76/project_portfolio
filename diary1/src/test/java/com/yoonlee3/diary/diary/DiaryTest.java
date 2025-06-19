package com.yoonlee3.diary.diary;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.yoonlee3.diary.Diary1Application;
import com.yoonlee3.diary.user.UserRepository;


@SpringBootTest(classes = Diary1Application.class)
public class DiaryTest {
	@Autowired DiaryRepository diaryRepository;
	@Autowired UserRepository userRepository;
	
	@Disabled 
	//@Test
	public void insert() {
		Diary diary = new Diary();
		diary.setDiary_title("title1");
		diary.setDiary_content("content2");
		
		diaryRepository.save(diary);
	}
	
	@Disabled 
	//@Test 
	public void findAll() {
		List<Diary> list = diaryRepository.findAll();
		System.out.println(list);
	}
	
	@Disabled 
	//@Test 
	public void findDiary() {
		Optional<Diary> findDiary = diaryRepository.findById(1L);
		if(findDiary.isPresent()) {
			Diary diary = findDiary.get();
			System.out.println(diary.getDiary_title());
			diaryRepository.save(diary);
		}
	}
	
	@Disabled 
	//@Test 
	public void update() {
		Optional<Diary> findDiary = diaryRepository.findById(1L);
		if(findDiary.isPresent()) {
			Diary diary = findDiary.get();
			diary.setDiary_title("title-new");
			diary.setDiary_content("content-new");
			diaryRepository.save(diary);
		}
	}
	
	@Disabled 
	//@Test
	public void delete() {
		Optional<Diary> findDiary = diaryRepository.findById(1L);
		if(findDiary.isPresent()) {
			Diary diary = findDiary.get();
			diaryRepository.delete(diary);
		}
	}
}
