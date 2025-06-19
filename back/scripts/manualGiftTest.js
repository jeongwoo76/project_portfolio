const { User, Animal, Prize, Category } = require('../models');

const userId = 1;  

const manualGiftTest = async (userId) => {
  try {
    console.log('스크립트 시작');  // 로깅

    const user = await User.findByPk(userId);
    if (!user) {
      console.log(`유저 ${userId}가 존재하지 않습니다.`);
      return null;
    }

    console.log('유저 조회 완료:', user);  // 유저 정보 로깅

    // 유저가 소유한 동물 가져오기
    const animals = await Animal.findAll({
      where: { UserId: user.id },
      attributes: ['id', 'CategoryId']
    });

    if (!animals.length) {
      console.log(`유저 ${userId}에게 동물이 없습니다.`);
      return null;
    }

    console.log('동물 정보 조회 완료:', animals);  // 동물 정보 로깅

    // 랜덤으로 동물 선택
    const selectedAnimal = animals[Math.floor(Math.random() * animals.length)];
    const categoryId = selectedAnimal.CategoryId;

    console.log('선택된 동물:', selectedAnimal);  // 선택된 동물 로깅

    // 카테고리에 해당하는 랜덤박스 상품을 Prize 테이블에서 필터링
    const prizeItems = await Prize.findAll({
      where: { CategoryId: categoryId, type: 'randombox' }, // 필터링: 'randombox' 타입 상품
    });

    if (!prizeItems.length) {
      console.log('해당 카테고리의 랜덤박스용 상품이 없습니다.');
      return null;
    }

    console.log('랜덤박스 상품 조회 완료:', prizeItems);  // 랜덤박스 상품 로깅

    // 이후 랜덤박스 사용 시, 쿠폰을 발급하는 로직에서 상품을 랜덤으로 선택하면 됨.
    console.log(`✅ 유저 ${user.username} (ID: ${userId}) 에게 카테고리 ${categoryId}의 랜덤박스를 발급.`);

    return {
      userId: user.id,
      categoryId,
      type: 'randombox',
    };
  } catch (error) {
    console.error('❌ 랜덤박스 사용 중 오류 발생:', error);
    return null;
  }
};

// manualGiftTest 함수 호출
manualGiftTest(userId).then((result) => {
  if (result) {
    console.log('랜덤박스 발급 완료:', result);
  } else {
    console.log('랜덤박스 발급 실패');
  }
});
