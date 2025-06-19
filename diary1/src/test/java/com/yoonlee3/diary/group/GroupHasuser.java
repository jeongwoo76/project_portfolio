package com.yoonlee3.diary.group;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.yoonlee3.diary.Diary1Application;
import com.yoonlee3.diary.badge.Badge;
import com.yoonlee3.diary.badge.BadgeRepository;
import com.yoonlee3.diary.group.YL3Group;
import com.yoonlee3.diary.groupHasUser.JoinToGroupService;
import com.yoonlee3.diary.group.GroupRepository;
import com.yoonlee3.diary.group.GroupService;
import com.yoonlee3.diary.user.User;
import com.yoonlee3.diary.user.UserRepository;

@SpringBootTest(classes = Diary1Application.class)
public class GroupHasuser {
	
	@Autowired GroupRepository groupRepository;
	@Autowired GroupService groupService;
	@Autowired BadgeRepository badgeRepository;
	@Autowired UserRepository userRepository;
	@Autowired JoinToGroupService joinToGroupService;
	
	@Disabled
	void insert() {
		
		YL3Group group1 = new YL3Group();
		group1.setGroup_title("윤이삼");
		group1.setGroup_content("윤씨 한 명과 이씨 세 명");
		Badge badge1 =  badgeRepository.findById(5l)
				.orElseThrow( ()-> new RuntimeException("해당 배지를 찾을 수 없습니다."));
		group1.setBadge(badge1);
		
		User user1 = userRepository.findById(1l)
				.orElseThrow();
		group1.setGroup_leader(user1);
		
		groupRepository.save(group1);
		
		YL3Group group2 = new YL3Group();
		group2.setGroup_title("노라조");
		group2.setGroup_content("놀고 싶은 사람들의 모임");
		Badge badge2 =  badgeRepository.findById(1l)
				.orElseThrow( ()-> new RuntimeException("해당 배지를 찾을 수 없습니다."));
		group2.setBadge(badge2);
		
		User user2 = userRepository.findById(2l)
				.orElseThrow();
		group2.setGroup_leader(user2);
		
		groupRepository.save(group2);
		
		YL3Group group3 = new YL3Group();
		group3.setGroup_title("개발바닥 연구소");
		group3.setGroup_content("견주들의 모임");
		Badge badge3 =  badgeRepository.findById(2l)
				.orElseThrow( ()-> new RuntimeException("해당 배지를 찾을 수 없습니다."));
		group3.setBadge(badge3);
		
		User user3 = userRepository.findById(2l)
				.orElseThrow();
		group3.setGroup_leader(user3);
		
		groupRepository.save(group3);
		
		YL3Group group4 = new YL3Group();
		group4.setGroup_title("개발새발");
		group4.setGroup_content("이게 개발인지 새발인지");
		Badge badge4 =  badgeRepository.findById(4l)
				.orElseThrow( ()-> new RuntimeException("해당 배지를 찾을 수 없습니다."));
		group4.setBadge(badge4);
		
		User user4 = userRepository.findById(3l)
				.orElseThrow();
		group4.setGroup_leader(user4);
		
		groupRepository.save(group4);
		
		
		YL3Group group5 = new YL3Group();
		group5.setGroup_title("냥빨대작전");
		group5.setGroup_content("점순아 너 인물났다");
		Badge badge5 =  badgeRepository.findById(1l)
				.orElseThrow( ()-> new RuntimeException("해당 배지를 찾을 수 없습니다."));
		group5.setBadge(badge5);
		
		User user5 = userRepository.findById(4l)
				.orElseThrow();
		group5.setGroup_leader(user5);
		
		groupRepository.save(group5);
		
	}
	
	@Disabled
	public void joinGroup() {
		User user = new User();
		user.setId(2L);
		
		YL3Group group = new YL3Group();
		group.setId(1l);
		
		joinToGroupService.joinToGroup(group.getId(), user.getId());
		//////
		
		User user2 = new User();
		user2.setId(3L);
		
		YL3Group group2 = new YL3Group();
		group2.setId(1l);
		
		joinToGroupService.joinToGroup(group2.getId(), user2.getId());
		//////
		
		User user3 = new User();
		user3.setId(4L);
		
		YL3Group group3 = new YL3Group();
		group3.setId(1l);
		
		joinToGroupService.joinToGroup(group3.getId(), user3.getId());
		/////
		
		User user4 = new User();
		user4.setId(5L);
		
		YL3Group group4 = new YL3Group();
		group4.setId(1l);
		
		joinToGroupService.joinToGroup(group4.getId(), user4.getId());
		/////
		
		User user5 = new User();
		user5.setId(2L);
		
		YL3Group group5 = new YL3Group();
		group5.setId(2l);
		
		joinToGroupService.joinToGroup(group5.getId(), user5.getId());
		
	}
	
	@Disabled
	void leaveGroup() {
		// 그룹리더가 떠나기
		/*
		User user = userRepository.findById(1l).orElseThrow();
		YL3Group group = groupRepository.findById(1l).orElseThrow();
		
		joinToGroupService.leaveGroup(group.getGroup_id(), user.getUser_id());
		*/
		
		// 그룹원이 떠나기
		User user2 = userRepository.findById(2l).orElseThrow();
		YL3Group group2 = groupRepository.findById(1l).orElseThrow();
		
//		joinToGroupService.leaveGroup(group2.getId(), user2.getId());
		
	}
	
	
}
