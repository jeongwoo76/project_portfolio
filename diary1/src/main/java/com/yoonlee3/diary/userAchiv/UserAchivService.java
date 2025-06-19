package com.yoonlee3.diary.userAchiv;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yoonlee3.diary.goal.Goal;
import com.yoonlee3.diary.goal.GoalService;
import com.yoonlee3.diary.goalStatus.GoalSatusService;
import com.yoonlee3.diary.user.User;
import com.yoonlee3.diary.user.UserService;

@Service
public class UserAchivService {

	@Autowired
	UserAchivRepository userAchivRepository;
	@Autowired
	GoalSatusService goalSatusService;
	@Autowired
	UserService userService;
	@Autowired
	GoalService goalService;

	public Optional<UserAchiv> selectById(Goal goal) {
		return userAchivRepository.findById(goal.getId());
	}

	/*
	 * public UserAchiv insertUserAchiv(Goal goal) {
	 * 
	 * LocalDate start = goal.getStartDate(); LocalDate end = goal.getDueDate();
	 * 
	 * // 전체 기간 계산 (+1 안 하면 마지막 날 빠짐) long totalDays =
	 * ChronoUnit.DAYS.between(start, end) + 1;
	 * 
	 * // 성공한 날 수 조회 int countTrue = goalSatusService.countStatus(goal);
	 * 
	 * // 달성률 계산 double userAchivCalc = totalDays > 0 ? countTrue / (double)
	 * totalDays : 0;
	 * 
	 * // 엔티티 생성 UserAchiv userAchiv = new UserAchiv(); userAchiv.setGoal(goal);
	 * userAchiv.setCompletionRate(userAchivCalc);
	 * 
	 * return userAchivRepository.save(userAchiv); }
	 */
	public List<UserAchiv> findByUserId(User user) {

		List<Goal> goals = goalService.findByUserId(user);

		List<UserAchiv> userAchivList = new ArrayList<>();

		for (Goal goal : goals) {
			UserAchiv userAchiv = userAchivRepository.findByGoalId(goal.getId());
			if (userAchiv != null) {
				userAchivList.add(userAchiv);
			}
		}
		return userAchivList;
	}

	@Transactional
	public void insertOrUpdateUserAchiv(Goal goal) {
		LocalDate start = goal.getStartDate();
		LocalDate end = goal.getDueDate();

		long totalDays = ChronoUnit.DAYS.between(start, end) + 1;
		System.out.println("totalDays............" + totalDays);
		int countTrue = goalSatusService.countStatusDay(goal, start, end);
		System.out.println("counTrue......." + countTrue);
		double userAchivCalc = totalDays > 0 ? countTrue / (double) totalDays : 0;
		System.out.println("userAchivCalc.............." + userAchivCalc);

		UserAchiv existing = userAchivRepository.findByGoalId(goal.getId());

		if (existing != null) {
			// 업데이트
			existing.setCompletionRate(userAchivCalc);
			userAchivRepository.save(existing);
		} else {
			// 새로 삽입
			UserAchiv newAchiv = new UserAchiv();
			newAchiv.setGoal(goal);
			newAchiv.setCompletionRate(userAchivCalc);
			userAchivRepository.save(newAchiv);
		}
	}

	public void deleteUserAchive(Goal goal) {
		userAchivRepository.deleteById(goal.getId());
	}

}
