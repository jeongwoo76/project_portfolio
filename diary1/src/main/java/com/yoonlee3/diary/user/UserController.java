package com.yoonlee3.diary.user;

import java.security.Principal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.servlet.http.HttpServletRequest;
import javax.transaction.Transactional;
import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.yoonlee3.diary.diary.Diary;
import com.yoonlee3.diary.diary.DiaryRepository;
import com.yoonlee3.diary.diary.DiaryService;
import com.yoonlee3.diary.follow.Block;
import com.yoonlee3.diary.follow.BlockRepository;
import com.yoonlee3.diary.follow.Follow;
import com.yoonlee3.diary.follow.FollowRepository;
import com.yoonlee3.diary.follow.FollowService;
import com.yoonlee3.diary.goal.Goal;
import com.yoonlee3.diary.goal.GoalService;
import com.yoonlee3.diary.goalStatus.GoalSatusService;
import com.yoonlee3.diary.goalStatus.GoalStatus;
import com.yoonlee3.diary.goalStatus.GoalStatusRepository;
import com.yoonlee3.diary.group.GroupRepository;
import com.yoonlee3.diary.group.GroupService;
import com.yoonlee3.diary.group.YL3Group;
import com.yoonlee3.diary.groupDiary.GroupDiary;
import com.yoonlee3.diary.groupDiary.GroupDiaryRepository;
import com.yoonlee3.diary.groupHasUser.JoinToGroupService;
import com.yoonlee3.diary.userAchiv.UserAchivService;
import com.yoonlee3.diary.user_kakao.KakaoLogin;
import com.yoonlee3.diary.user_navermail.NaverMail;

@Controller
public class UserController {

	@Autowired
	UserService userService;
	@Autowired
	UserRepository userRepository;
	@Autowired
	private PasswordEncoder passwordEncoder;
	@Autowired
	KakaoLogin api;
	@Autowired
	DiaryService diaryService;
	@Autowired
	DiaryRepository diaryRepository;
	@Autowired
	FollowRepository followRepository;
	@Autowired
	private GoalService goalService;
	@Autowired
	JoinToGroupService joinToGroupService;
	@Autowired
	GroupService groupService;
	@Autowired
	GoalSatusService goalSatusService;
	@Autowired
	GoalStatusRepository goalStatusRepository;
	@Autowired
	BlockRepository blockRepository;
	@Autowired
	FollowService followService;
	@Autowired
	GroupDiaryRepository groupDiaryRepository;
	@Autowired
	GroupRepository groupRepository;
	@Autowired
	UserAchivService userAchivService;
	@Autowired
	NaverMail naverMail;

	@ModelAttribute
	public void NicknameToModel(Model model, Principal principal) {
		if (principal != null) {
			String email = principal.getName();
			User user = userService.findByEmail(email);
			if (user != null) {
				model.addAttribute("nickname", user.getUsername());
				model.addAttribute("user", user);
				model.addAttribute("profileImage", user.getProfileImageUrl());
				List<YL3Group> groups = joinToGroupService.findGroupById(user.getId());
				model.addAttribute("groups", groups);

				// 작성한 일기 수 가져오기
				long diaryCount = diaryRepository.countByUser(user); // 일기 작성 수
				model.addAttribute("diaryCount", diaryCount); // 다이어리 수// 유저 프로필 랜덤으로


			} else {
				model.addAttribute("nickname", "Guest"); // 사용자 없음 -> Guest로 처리
				model.addAttribute("groups", Collections.emptySet());
			}
		} else {
			model.addAttribute("nickname", "Guest"); // 로그인되지 않으면 Guest로 처리
		}
	}

	// 처음 화면
	@GetMapping("/")
	public String main(Model model) {
		model.addAttribute("url", api.step1());
		return "user/login";
	}

	// 마이페이지
	@GetMapping("/mypage")
	public String myPage(
			@RequestParam(value = "selectedDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
			Model model, Principal principal) {
		model.addAttribute("isMyPage", true);
		String email = principal.getName();

		User user = userService.findByEmail(email);

		// 날짜 계산해서 오늘 할 목표 넘기기
		LocalDate selectedDate = (date != null) ? date : LocalDate.now();
		List<Goal> goals = goalService.findTodayGoalByUserId(user, selectedDate);

		Map<Long, GoalStatus> goalStatusMap = new HashMap<>();
		for (Goal goal : goals) {
			goalSatusService.findTodayGoalStatus(goal, selectedDate)
					.ifPresent(status -> goalStatusMap.put(goal.getId(), status));
		}
		model.addAttribute("goalStatusMap", goalStatusMap);

		model.addAttribute("selectedDate", selectedDate);
		model.addAttribute("goal", goals);

		// 해당 사용자가 쓴 글만 가져오기
		List<Diary> list = diaryService.findByUserId(user.getId());
		model.addAttribute("list", list);

		// 작성한 일기 수 가져오기
		long diaryCount = diaryRepository.countByUser(user); // 일기 작성 수
		model.addAttribute("diaryCount", diaryCount); // 다이어리 수

		// 팔로워와 팔로잉 리스트를 가져옵니다.
		// 'user' 객체를 사용하여 팔로워와 팔로잉을 조회합니다.
		List<Follow> followers = followRepository.findByFollowing(user); // 나를 팔로우한 사람들
		List<Follow> followings = followRepository.findByFollower(user); // 내가 팔로우한 사람들
		model.addAttribute("followers", followers); // 팔로워 리스트
		model.addAttribute("followings", followings); // 팔로잉 리스트

		// 팔로워 수와 팔로잉 수를 계산해서 모델에 추가
		long followerCount = followRepository.countByFollowing(user);
		long followingCount = followRepository.countByFollower(user);
		model.addAttribute("followerCount", followerCount); // 팔로워 수
		model.addAttribute("followingCount", followingCount); // 팔로잉 수

		return "user/mypage";
	}

	// 로그인
	@GetMapping("/user/login")
	public String login(Model model) {
		model.addAttribute("url", api.step1());
		return "user/login";
	}

	@PostMapping("/user/login")
	public String login_form(@RequestParam("email") String email, @RequestParam("password") String password,
			Model model) {
		// 이메일로 유저를 찾기
		Optional<User> opUser = userRepository.findByEmail(email);

		if (opUser.isPresent()) {
			User user = opUser.get();

			// 입력된 비밀번호와 저장된 암호화된 비밀번호 비교
			if (passwordEncoder.matches(password, user.getPassword())) {
				// 비밀번호가 맞다면 로그인 성공
				return "redirect:/mypage"; // 또는 메인 페이지로 리디렉션
			} else {
				model.addAttribute("msg", "비밀번호가 일치하지 않습니다.");
				return "user/login"; // 비밀번호 불일치시 로그인 페이지로
			}
		} else {
			model.addAttribute("msg", "이메일을 찾을 수 없습니다.");
			return "user/login"; // 이메일을 찾을 수 없을 경우 로그인 페이지로
		}
	}

	// 회원가입
	@GetMapping("/user/join")
	public String join(UserForm userForm) {
		return "user/join";
	}

	@PostMapping("/user/join")
	public String join(@Valid UserForm userForm, BindingResult bindingResult) {

		if (bindingResult.hasErrors()) {
			return "user/join";
		}

		if (!userForm.getPassword().equals(userForm.getPassword2())) {
			bindingResult.rejectValue("password2", "pawordInCorrect", "패스워드를 확인해주세요");
			return "user/join";
		}
		
		// 유저 프로필 랜덤으로
		List<String> profileImages = List.of("/images/user1.png", "/images/user2.png", "/images/user3.png",
				"/images/user4.png", "/images/user5.png");
		Random rand = new Random();
		String randomImage = profileImages.get(rand.nextInt(profileImages.size()));


		try {
			User user = new User();
			user.setUsername(userForm.getUsername());
			user.setEmail(userForm.getEmail());
			user.setPassword(userForm.getPassword());
			user.setProfileImageUrl(randomImage);
			userService.insertUser(user);
		} catch (DataIntegrityViolationException e) { // 무결성 - 중복키, 외래키제약, 데이터형식불일치
			e.printStackTrace();
			bindingResult.reject("failed", "등록된 유저입니다.");
			return "user/join";
		} catch (Exception e) {
			e.printStackTrace();
			bindingResult.reject("failed", e.getMessage());
			return "user/join";
		}
		return "user/login";
	}

	// 비밀번호 찾기
	@GetMapping("/user/find")
	public String find() {
		return "user/find";
	}

	@PostMapping("/user/find")
	public String find_form(@RequestParam("email") String email, Model model) {
		try {
			User user = userService.findByEmail(email);

			// 1. 비밀번호 재설정 토큰 생성
			String resetToken = UUID.randomUUID().toString();
			user.setResetToken(resetToken);
			userRepository.save(user);

			// 2. 이메일 전송
			String resetLink = "http://localhost:8080/user/reset?token=" + resetToken;
			sendPasswordResetEmail(email, resetLink);

			model.addAttribute("msg", "비밀번호 재설정 이메일을 보냈습니다.");
			return "user/find";
		} catch (RuntimeException e) {
			model.addAttribute("msg", "가입되지 않은 이메일입니다.");
			return "user/find";
		}
	}

	private void sendPasswordResetEmail(String email, String resetLink) {
		String subject = "비밀번호 재설정 이메일";
		String content = "아래 버튼을 클릭하여 비밀번호를 재설정해 주세요:<br><br>" + "<a href='" + resetLink + "' "
				+ "style='display:inline-block;padding:10px 20px;background-color:#007bff;"
				+ "color:white;text-decoration:none;border-radius:5px;'>비밀번호 재설정하기</a><br><br>"
				+ "이 링크는 1회용이며, 일정 시간 후 만료됩니다.";

		naverMail.sendMail(subject, content, email); // content는 HTML 형식
	}

	@GetMapping("/user/reset")
	public String resetPassword(@RequestParam("token") String token, Model model) {
		Optional<User> userOpt = userRepository.findByResetToken(token);

		if (userOpt.isPresent()) {
			model.addAttribute("token", token); // 토큰을 hidden field로 전달
			return "user/passchange"; // 비밀번호 변경 페이지로 이동
		} else {
			model.addAttribute("msg", "유효하지 않은 링크입니다.");
			return "user/find"; // 유효하지 않은 토큰일 경우 다시 이메일 입력 페이지로 돌아감
		}
	}

	@GetMapping("/user/passchange")
	public String passchange() {
		return "user/passchange";
	}

	@PostMapping("/user/passchange")
	public String passchange_form(@RequestParam("token") String token, // 토큰을 hidden field로 받음
			@RequestParam("password") String password, Model model) {

		Optional<User> opuser = userRepository.findByResetToken(token); // 토큰을 통해 사용자 찾기

		if (opuser.isPresent()) {
			User user = opuser.get();

			// 비밀번호 암호화
			String encodedPassword = passwordEncoder.encode(password);
			user.setPassword(encodedPassword);
			user.setResetToken(null); // 토큰 삭제
			userRepository.save(user);

			model.addAttribute("msg", "비밀번호가 성공적으로 변경되었습니다.");
			return "redirect:/user/login"; // 로그인 페이지로 리다이렉트
		} else {
			model.addAttribute("msg", "유효하지 않은 링크입니다.");
			return "user/find"; // 유효하지 않은 링크일 경우 다시 이메일 입력 페이지로 돌아감
		}
	}

	// 프로필 수정
	@GetMapping("/fragments/sidebar/nickname")
	public String userChange() {
		return "fragments/sideBar";
	}

	@PostMapping("/fragments/sidebar/nickname")
	public String userChange_form(@RequestParam String username, Principal principal,
			RedirectAttributes redirectAttributes) {

		String email = principal.getName();
		User user = userService.findByEmail(email);

		if (user != null) {

			if (userService.SameUsername(username)) {
				redirectAttributes.addFlashAttribute("msg", "이미 존재하는 닉네임입니다.");
				return "redirect:/mypage";
			}

			user.setUsername(username);
			userRepository.save(user);

			redirectAttributes.addFlashAttribute("msg", "닉네임이 변경되었습니다.");
			return "redirect:/mypage";
		} else {
			redirectAttributes.addFlashAttribute("msg", "사용자 정보를 찾을 수 없습니다.");
			return "redirect:/mypage";
		}
	}

	// 유저 탈퇴하기
	@GetMapping("/user/delete")
	public String userdelete() {
		return "fragments/sideBar";
	}

	@PostMapping("/user/delete")
	@Transactional
	public String userdelete_form(@RequestParam("password") String password, Principal principal,
			RedirectAttributes redirectAttributes) {

		String email = principal.getName();
		Optional<User> opUser = userRepository.findByEmail(email);

		if (opUser.isPresent()) {
			User user = opUser.get();

			// 비밀번호 확인
			if (passwordEncoder.matches(password, user.getPassword())) {

				// 1. 사용자가 blocker 또는 blocked로 존재하는 Block 레코드 삭제
				blockRepository.deleteByBlockerId(user.getId()); // blocker로 있는 레코드 삭제
				blockRepository.deleteByBlockedId(user.getId()); // blocked로 있는 레코드 삭제

				// 2. 유저가 속한 그룹에서 유저를 그룹장으로 설정되어 있는 경우 처리
				for (YL3Group group : user.getGroups()) {

					if (group.getGroup_leader().equals(user)) {
						if (!group.getUsers().isEmpty()) {
							// 새로운 그룹장 설정
							User newLeader = group.getUsers().stream().filter(u -> !u.equals(user)).findFirst()
									.orElse(null);
							if (newLeader != null) {
								group.setGroup_leader(newLeader);
								groupRepository.save(group);
							} else {
								groupService.deleteGroup(group); // 그룹에서 유저가 유일한 멤버일 경우 그룹 삭제
							}
						} else {
							groupService.deleteGroup(group); // 유저가 유일한 멤버일 경우 그룹 삭제
						}
					}

					group.getUsers().remove(user);
					groupRepository.save(group); // 그룹 정보 업데이트
				}

				// 유저가 쓴 다이어리 삭제하기
				// 유저가 쓴 일기를 가져오고, 그 일기를 그룹 - 다이어리 연결 끊고, 다이어리 삭제 후 탈퇴
				// 1. 유저가 쓴 일기 가져오기
				List<Diary> diares = diaryService.findByUserId(user.getId());
				// 2. 그 일기들 그룹 - 다이어리 연결 끊기
				for (Diary d : diares) {
					GroupDiary groupDiary = groupDiaryRepository.findByDiaryId(d.getId());
					if (groupDiary != null) {
						System.out.println("그룹 다이어리 아이디........" + groupDiary.getId());
						groupDiaryRepository.deleteGroupDiary(groupDiary.getId());
						groupDiaryRepository.flush();
					}
				}
				// 3. 다이어리 삭제하기
				for (Diary d : diares) {
					diaryService.delete(d);
				}

				// 3. 유저의 목표 삭제
				List<Goal> goals = goalService.findByUserId(user);
				for (Goal goal : goals) {
					// achiv 삭제
					if (userAchivService.selectById(goal).isPresent()) {
						userAchivService.deleteUserAchive(goal);
					}
					goalService.deleteGoal(goal, user.getId());
				}

				// 4. 유저 삭제
				userRepository.delete(user);
				SecurityContextHolder.clearContext();

				// 메시지 추가 후 리다이렉트
				redirectAttributes.addFlashAttribute("msg", "회원 탈퇴가 완료되었습니다.");
				return "redirect:/user/login";
			} else {
				redirectAttributes.addFlashAttribute("msg", "비밀번호가 일치하지 않습니다.");
				return "redirect:/mypage";
			}
		} else {
			redirectAttributes.addFlashAttribute("msg", "사용자 정보를 찾을 수 없습니다.");
			return "redirect:/mypage";
		}
	}

	// 팔로우 화면
	@GetMapping("/user/follow")
	public String showFollowPage(@RequestParam(value = "userId", required = false) Long userId, Model model,
			Principal principal, HttpServletRequest request) {

		model.addAttribute("isMyPage", true);

		if (principal == null) {
			return "redirect:/user/login"; // 로그인 안 한 경우
		}

		User currentUser = userService.findByEmail(principal.getName());
		Long currentUserId = currentUser.getId();
		model.addAttribute("currentUserId", currentUserId);

		if (userId == null || userId.equals(currentUserId)) {
			userId = currentUserId;
		}

		Optional<User> targetUserOpt = userRepository.findById(userId);
		if (targetUserOpt.isEmpty())
			return "error";

		User targetUser = targetUserOpt.get();

		// 해당 사용자가 작성한 다이어리 수 추가
		List<Diary> diaries = diaryService.findByEmail(targetUser.getEmail());
		long diaryCount = diaries.size();
		model.addAttribute("diaryCount", diaryCount);

		// 팔로우/팔로워 정보
		List<Follow> followers = followRepository.findByFollowing(targetUser);
		List<Follow> followings = followRepository.findByFollower(targetUser);
		model.addAttribute("followers", followers != null ? followers : new ArrayList<>());
		model.addAttribute("followings", followings != null ? followings : new ArrayList<>());

		// 수치 정보 추가
		long followerCount = followRepository.countByFollowing(targetUser);
		long followingCount = followRepository.countByFollower(targetUser);
		model.addAttribute("followerCount", followerCount);
		model.addAttribute("followingCount", followingCount);

		// 로그인 사용자의 팔로잉 목록
		Set<Long> followingIds = new HashSet<>();
		List<Follow> userFollowings = followRepository.findByFollower(currentUser);
		for (Follow f : userFollowings) {
			followingIds.add(f.getFollowing().getId());
		}
		model.addAttribute("followingIds", followingIds);

		// 차단한 사용자 목록
		List<User> blockedUserIds = userService.getBlockedUsers(currentUserId);
		Set<Long> blockedUserIdsSet = blockedUserIds.stream().map(User::getId).collect(Collectors.toSet());
		model.addAttribute("blockedUsers", blockedUserIdsSet);

		// CSRF
		CsrfToken csrfToken = (CsrfToken) request.getAttribute("_csrf");
		model.addAttribute("_csrf", csrfToken);

		model.addAttribute("targetUserId", targetUser.getId());
		return "user/follow";
	}

	// 유저 검색하기 ////////////0430
	@GetMapping("/search/users")
	@ResponseBody
	public List<UserProfileDto> searchUsers(@RequestParam("keyword") String keyword,
			@RequestParam("currentUserId") Long currentUserId) {

		// 내가 차단한 유저들
		List<User> blockedUsers = userService.getBlockedUsers(currentUserId);
		Set<Long> blockedUserIds = blockedUsers.stream().map(User::getId).collect(Collectors.toSet());

		// 나를 차단한 유저들
		List<User> usersWhoBlockedMe = userService.getUsersWhoBlocked(currentUserId);
		Set<Long> usersWhoBlockedMeIds = usersWhoBlockedMe.stream().map(User::getId).collect(Collectors.toSet());

		// 전체 제외 대상
		Set<Long> excludedIds = new HashSet<>();
		excludedIds.addAll(blockedUserIds);
		excludedIds.addAll(usersWhoBlockedMeIds);
		excludedIds.add(currentUserId); // 자기 자신도 제외

		// 검색 결과 가져오기
		List<User> allUsers = userRepository.findByUsernameContainingIgnoreCase(keyword);

		// 제외 대상 필터링
		List<User> filteredUsers = allUsers.stream().filter(user -> !excludedIds.contains(user.getId()))
				.collect(Collectors.toList());

		return filteredUsers.stream()
				.map(user -> new UserProfileDto(user.getId(), user.getUsername(), user.getProfileImageUrl()))
				.collect(Collectors.toList());

	}

	@GetMapping("/user/follow/counts")
	@ResponseBody
	public Map<String, Integer> getFollowCounts(
			@AuthenticationPrincipal org.springframework.security.core.userdetails.User userDetails) {
		String email = userDetails.getUsername();

		User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("사용자 없음"));

		int followers = followService.countFollowers(user.getId());
		int followings = followService.countFollowings(user.getId());

		Map<String, Integer> counts = new HashMap<>();
		counts.put("followers", followers);
		counts.put("followings", followings);
		return counts;
	}

}
