const express = require('express');
const router = express.Router();
const { Prize, MyPrize, IssuedRandomBox, Sequelize, Category, Animal } = require('../models');
const { Op } = Sequelize;
const { isLoggedIn } = require('./middlewares');

// --- 1) 유저가 받은 미사용 랜덤박스 목록 조회 ---
router.get('/issued', isLoggedIn, async (req, res) => {
  try {
    const issuedBoxes = await IssuedRandomBox.findAll({
      where: { UserId: req.user.id, usedAt: null },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'content']
      }]
    });

    return res.status(200).json({
      success: true,
      data: issuedBoxes.map(box => ({
        issuedId: box.id,
        categoryId: box.CategoryId,
        category: {
          id: box.category?.id || null,
          content: box.category?.content || null,
        },
        issuedAt: box.issuedAt,
      }))
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: '서버 오류' });
  }
});


// --- 2) 랜덤박스 사용 처리 ---
router.post('/issued/use/:issuedId', isLoggedIn, async (req, res) => {
  const userId = req.user.id;
  const issuedId = req.params.issuedId;

  try {
    const issuedBox = await IssuedRandomBox.findByPk(issuedId, {
      include: [{ model: Category, as: 'category' }]
    });

    console.log(issuedBox.issuedReason); // 👉 여기서 "좋아요 1위", "좋아요 2위" 등 접근 가능

    if (!issuedBox) {
      console.log(`❌ 존재하지 않는 박스: ${issuedId}`);
      return res.status(404).json({ success: false, message: '랜덤박스가 존재하지 않습니다.' });
    }

    if (issuedBox.UserId !== userId) {
      console.log(`🚫 잘못된 접근: 유저 ${userId}가 본인의 박스가 아님`);
      return res.status(403).json({ success: false, message: '본인의 랜덤박스만 사용할 수 있습니다.' });
    }

    if (issuedBox.usedAt) {
      console.log(`⚠️ 이미 사용된 박스: usedAt=${issuedBox.usedAt}`);
      return res.status(400).json({ success: false, message: '이미 사용된 랜덤박스입니다.' });
    }


    const realPrizes = await Prize.findAll({
      where: {
        CategoryId: issuedBox.CategoryId,
        quantity: { [Op.gt]: 0 },
        dueAt: { [Op.gt]: new Date() }
      }
    });

    if (!realPrizes.length) {
      return res.status(200).json({ success: false, message: '당첨 가능한 상품이 없습니다.' });
    }

    const totalProb = realPrizes.reduce((sum, p) => sum + p.probability, 0);
    const rand = Math.random() * totalProb;

    let sum = 0;
    let selectedPrize = null;
    for (const p of realPrizes) {
      sum += p.probability;
      if (rand <= sum) {
        selectedPrize = p;
        break;
      }
    }

    let coupon = null;
    if (selectedPrize) {
     
      // 수량 감소 및 저장
      selectedPrize.quantity -= 1;
      await selectedPrize.save();

      // 쿠폰 발급
      const myPrize = await MyPrize.create({
        UserId: userId,
        PrizeId: selectedPrize.id,
        issuedReason: issuedBox.issuedReason,  
        dueAt: selectedPrize.dueAt,
        isRead: false,
        barcode: `CPN-${Date.now()}-${Math.floor(Math.random() * 10000)}`  // 예시 바코드 생성
      });
      console.log("발급된 쿠폰 바코드:", myPrize.barcode);

      coupon = {
        content: selectedPrize.content,
        issuedAt: myPrize.createdAt,
        usedAt: myPrize.usedAt,
        barcode: myPrize.barcode, 
      };
    }

    // 랜덤박스 사용 처리
    issuedBox.usedAt = new Date();
    await issuedBox.save();

    return res.status(200).json({
      success: true,
      message: selectedPrize ? '🎉 축하합니다! 쿠폰이 발급되었습니다.' : '😢 아쉽게도 당첨되지 않았습니다.',
      coupon
    });
  } catch (err) {
    console.error('랜덤박스 사용 오류:', err.message, err);
    return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});


// --- 3) 유저가 받은 사용 가능한 랜덤박스 목록 조회 ---
router.get('/issued/list', isLoggedIn, async (req, res) => {
  try {
    const issuedBoxes = await IssuedRandomBox.findAll({
      where: { 
        UserId: req.user.id, 
        usedAt: null  // 미사용 박스만 필터링
      },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'content']
      }]
    });

    return res.status(200).json({
      success: true,
      data: issuedBoxes.map(box => ({
        issuedId: box.id,
        categoryId: box.CategoryId,
        category: box.Category.content,
        issuedAt: box.issuedAt
      }))
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: '서버 오류' });
  }
});

module.exports = router;
