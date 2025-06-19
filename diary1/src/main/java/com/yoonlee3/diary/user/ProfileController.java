package com.yoonlee3.diary.user;

import java.security.Principal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import com.yoonlee3.diary.follow.BlockService;
import com.yoonlee3.diary.follow.FollowService;

@Controller
@RequestMapping("/profile")
public class ProfileController {

    private final FollowService followService;
    private final UserRepository userRepository;
    private final BlockService blockService;

    @Autowired
    public ProfileController(FollowService followService, UserRepository userRepository, BlockService blockService) {
        this.followService = followService;
        this.userRepository = userRepository;
        this.blockService = blockService;
    }

    @GetMapping("/{userId}")
    public String getUserProfile(@PathVariable Long userId, Principal principal, Model model) {
        // 프로필 사용자 찾기
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // principal이 null인지 확인
        User viewer = null;
        if (principal != null) {
            viewer = userRepository.findByUsername(principal.getName());
        }

        // 로그인된 사용자가 있고, targetUser와 차단 관계가 있으면 차단 여부 확인
        boolean isBlocked = false;
        if (viewer != null) {
            // 차단 여부 확인
            isBlocked = blockService.isBlocked(viewer, targetUser);
        }
        
        // 프로필 정보 가져오기
        UserProfileDto userProfile = followService.getUserProfile(viewer, targetUser);

        // 모델에 사용자 프로필 정보 추가
        model.addAttribute("userProfile", userProfile);
        model.addAttribute("viewer", viewer);  // 팔로우 여부 확인

        return "profile";  // Thymeleaf 템플릿 이름 반환
    }
    
}
