const express = require('express');
const router = express.Router();

const { Prize, Category } = require('../models');
const { isLoggedIn, isAdmin } = require('./middlewares'); // 관리자 인증 미들웨어 가정

// 1. 상품 생성 (관리자만)
router.post('/', isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    const { content, quantity, probability, dueAt, CategoryId } = req.body;
    const prize = await Prize.create({
      content,
      quantity,
      probability,
      dueAt,
      CategoryId
    });
    
    // 카테고리 포함해서 다시 조회
    const fullPrize = await Prize.findByPk(prize.id, {
        include: [{ model: Category, as: 'category' }],
    });

    res.status(201).json(fullPrize);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 2. 상품 리스트 조회 (관리자만)
router.get('/', isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    const prizes = await Prize.findAll({
      include: [{ model: Category, as: 'category' }],
      order: [['createdAt', 'DESC']]
    });
    res.json(prizes);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 3. 상품 상세 조회 (관리자만)
router.get('/:prizeId', isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    const prize = await Prize.findOne({
      where: { id: req.params.prizeId },
      include: [{ model: Category, as: 'category' }]
    });
    if (!prize) return res.status(404).send('상품이 존재하지 않습니다.');
    res.json(prize);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 4. 상품 수정 (관리자만)
router.patch('/:prizeId', isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    const { content, quantity, probability, dueAt, CategoryId } = req.body;
    const prize = await Prize.findOne({ where: { id: req.params.prizeId } });
    if (!prize) return res.status(404).send('상품이 존재하지 않습니다.');

    await prize.update({ content, quantity, probability, dueAt, CategoryId });


  // 수정 후 다시 조회해서 category 포함
    const updatedPrize = await Prize.findByPk(prize.id, {
      include: [{ model: Category, as: 'category' }],
    });

    res.json(updatedPrize);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 5. 상품 삭제 (관리자만)
router.delete('/:prizeId', isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    const result = await Prize.destroy({ where: { id: req.params.prizeId } });
    if (!result) return res.status(404).send('상품이 존재하지 않습니다.');

    res.status(200).json({ message: '상품이 삭제되었습니다.' });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
