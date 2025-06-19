const express = require('express');
const router = express.Router();
const { Category } = require('../models');

// 카테고리 불러오기
router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'content', 'isAnimal'],
      order: [['content', 'ASC']]
    });
    res.status(200).json(categories);
  } catch (err) { console.error(err); next(err); }
})

// 카테고리 생성
router.post('/', async (req, res, next) => {
  const { content, isAnimal } = req.body;

  // 필수 값 체크
  if (!content) {
    return res.status(400).json({ message: '카테고리 이름을 입력하세요.' });
  }
  try {
    // 새로운 카테고리 생성
    const newCategory = await Category.create({
      content,
      isAnimal: isAnimal || false, // isAnimal이 없으면 기본값은 false로 설정
    });

    // 성공적으로 카테고리 추가
    return res.status(201).json({
      message: '카테고리 추가 성공',
      category: newCategory
    });
  } catch (err) {
    console.log('🚨 categoryRouter : ', err);
  }
});

// 카테고리 일부 필드 수정 (PATCH)
router.patch('/:id', async (req, res, next) => {
  const { id } = req.params;
  const { content, isAnimal } = req.body;

  try {
    // 해당 ID의 카테고리 찾기
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: '해당 카테고리를 찾을 수 없습니다.' });
    }

    // 변경된 필드만 업데이트
    const updatedData = {};
    if (content !== undefined) updatedData.content = content;
    if (isAnimal !== undefined) updatedData.isAnimal = isAnimal;

    await category.update(updatedData);

    return res.status(200).json({ category });
  } catch (err) {
    console.error('🚨 카테고리 수정 오류:', err);
    next(err);
  }
});


module.exports = router;