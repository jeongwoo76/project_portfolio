package com.yoonlee3.diary.user;

import java.util.List;
import java.util.stream.Collectors;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.yoonlee3.diary.diary.Diary;
import com.yoonlee3.diary.diary.DiaryRepository;
import com.yoonlee3.diary.follow.Block;
import com.yoonlee3.diary.follow.BlockRepository;
import com.yoonlee3.diary.follow.Follow;
import com.yoonlee3.diary.follow.FollowRepository;
import com.yoonlee3.diary.group.YL3Group;
import com.yoonlee3.diary.like.LikeRepository;
import com.yoonlee3.diary.like.Likes;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final BlockRepository blockRepository;
	@Autowired
	FollowRepository followRepository;
	@Autowired
	LikeRepository likeRepository;
	@Autowired
	DiaryRepository diaryRepository;

	// insert
	public User insertUser(User user) {
		user.setPassword(passwordEncoder.encode(user.getPassword()));
		return userRepository.save(user);
	}

	// selectAll
	public List<User> selectUserAll() {
		return userRepository.findAll();
	}

	// select
	public User findById(Long user_id) {
		return userRepository.findById(user_id).get();
	}

	public User findByEmail(String email) {
		return userRepository.findByEmail(email).orElse(null);
	}

	public User findByUsername(String username) {
		return userRepository.findByUsername(username);
	}

	public List<User> findUsersByUsername(String username) {
		return userRepository.findUsersByUsername(username);
	}

	public boolean SameUsername(String username) {
		return userRepository.existsByUsername(username); // 닉네임 중복 확인
	}

	// update
	public int updateByPass(User user) {
		return userRepository.updateByIdAndPassword(user.getPassword(), user.getEmail());
	}

	public int updateByUsername(Long user_id, User user) {
		return userRepository.updateById(user.getId(), user.getUsername());
	}

	public List<User> searchUsers(String keyword) {
		return userRepository.findByUsernameContaining(keyword); // username을 포함한 사용자 찾기
	}

	public User getCurrentUser() {
		return null;
	}

	// 내가 차단한 사용자 목록
	public List<User> getBlockedUsers(Long currentUserId) {
		return blockRepository.findBlockedUsersByBlockerId(currentUserId);
	}

	public int getFollowerCount(String username) {
		User user = userRepository.findByUsername(username);
		if (user == null)
			return 0;
		return (int) followRepository.countByFollowing(user); // 팔로워 수
	}

	public int getFollowingCount(String username) {
		User user = userRepository.findByUsername(username);
		if (user == null)
			return 0;
		return (int) followRepository.countByFollower(user); // 팔로잉 수
	}
	
	///////////////////////// 0430
	public List<User> getUsersWhoBlocked(Long userId) {
	       User currentUser = userRepository.findById(userId)
	                                        .orElseThrow(() -> new RuntimeException("사용자 없음"));
	       return blockRepository.findByBlocked(currentUser)
	                             .stream()
	                             .map(Block::getBlocker)
	                             .collect(Collectors.toList());
	   }

}
