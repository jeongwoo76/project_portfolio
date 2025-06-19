const useRandomBox = async (myPrizeId) => {
  try {
    const myPrize = await MyPrize.findOne({
      where: { id: myPrizeId, usedAt: null },  // 아직 사용되지 않은 랜덤박스만
      include: [{ model: Prize, as: 'prize' }]
    });

    if (!myPrize) {
      console.log(`잘못된 또는 이미 사용한 랜덤박스입니다.`);
      return;
    }

    const prize = myPrize.prize;
    if (!prize || prize.type !== 'randombox') {
      console.log(`이 상품은 랜덤박스가 아닙니다.`);
      return;
    }

    // 랜덤박스를 열어서 쿠폰 발급 여부 결정
    const chance = Math.random() * 100;
    let coupon = null;
    
    if (chance <= prize.probability) {
      // 확률에 맞으면 쿠폰 발급
      coupon = await Coupon.create({
        UserId: myPrize.UserId,
        PrizeId: prize.id,  // 랜덤박스와 연관된 상품
        issuedReason: '랜덤박스 사용',
        dueAt: prize.dueAt,
      });
      console.log('🎉 쿠폰이 발급되었습니다!');
    } else {
      console.log('😢 아쉽지만 쿠폰을 받지 못했습니다.');
    }

    // 랜덤박스를 사용 처리 (MyPrize에 기록)
    myPrize.usedAt = new Date();  // 사용된 시점 갱신
    await myPrize.save();

    return coupon;  // 발급된 쿠폰 반환 (없다면 null)
  } catch (error) {
    console.error('❌ 랜덤박스 사용 중 오류 발생:', error);
  }
};

// 예시 사용: MyPrize ID 1번 사용
useRandomBox(1);
