const express = require('express');
const router = express.Router();
const { Calendar } = require('../models');  // models/index.js에서 불러오기

//일정 전체 제목만 조회 (id, title만 반환)
router.get('/calendars', async (req, res) => {
  console.log('[API] GET /calendars 호출됨');

  try {
    console.log('[API] Calendar 모델을 통한 findAll 실행 중...');
    const calendars = await Calendar.findAll({
      attributes: ['id', 'title'],
      order: [['createdAt', 'DESC']],
    });

    console.log(`[API] Calendar 데이터 ${calendars.length}개 조회됨`);
    res.status(200).json(calendars);
  } catch (error) {
    console.error('[ERROR] 캘린더 API 오류:', error);
    res.status(500).json({ message: '서버 내부 오류 발생', detail: error.message });
  }
});

router.get('/', async (req, res, next) => {
  try {
    const calendars = await Calendar.findAll();
    res.json(calendars);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  console.log('................. /calendar');
  console.log(req.body);
  try {
    const { title, content, startDate, endDate } = req.body;
    console.log('........요청 바디:', req.body);
    const newCalendar = await Calendar.create({
      title,
      content,
      startDate,
      endDate,
    });
    console.log('생성 성공:', newCalendar.toJSON());
    res.status(201).json(newCalendar);
  } catch (error) {
    console.error('일정 생성 실패:', error);
    res.status(500).json({ message: '일정 생성 실패', error });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Calendar.findByPk(id);
    if (!schedule) {
      return res.status(404).json({ error: '일정이 존재하지 않습니다.' });
    }
    res.json(schedule);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { title, content, startDate, endDate } = req.body;
    const calendar = await Calendar.findByPk(req.params.id);
    if (!calendar) {
      return res.status(404).json({ message: '일정을 찾을 수 없습니다.' });
    }
    await calendar.update({ title, content, startDate, endDate });
    res.json(calendar);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const calendar = await Calendar.findByPk(req.params.id);
    if (!calendar) {
      return res.status(404).json({ message: '일정을 찾을 수 없습니다.' });
    }
    await calendar.destroy();
    res.status(204).end();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//user challenge regi/update
// router.post(':id', async (req, res) => {
//   try {
//     const calendar = await Calendar.findByPk(req.params.id);
//     if (!calendar) return res.status(404).send('Calendar not found');

//     const today = new Date().toISOString().split('T')[0];
//     const lastUpdate = new Date(calendar.updatedAt).toISOString().split('T')[0];

//     if (today === lastUpdate) {
//       return res.status(400).json({ message: '챌린지는 하루에 한 번만 달성 체크할 수 있습니다.' });
//     }

//     calendar.currentdays += 1;
//     await calendar.save();
//     return res.status(200).json({ message: '금일 챌린지 참여 완료', currentdays: calendar.currentdays });

//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server Error');
//   }
// });

module.exports = router;
