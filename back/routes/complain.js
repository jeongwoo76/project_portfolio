const express = require('express');
const router = express.Router();
const { Post, User, Comment, Complain, Image, RandomBox } = require('../models');
const { Op } = require('sequelize');
const TARGET_TYPE = require('../../shared/constants/TARGET_TYPE');

// 신고하기
router.post('/', async (req, res, next) => {
    try {
        const complain = await Complain.create({
            targetType: req.body.targetType,
            targetId: req.body.targetId,
            reason: req.body.reason,
            ReporterId: req.body.reporterId,
        });

        res.status(201).json(complain); // 원하는 형식으로 가공 가능
    } catch (err) {
        console.error('🚨 ComplainRouter 에러: ', err);
        res.status(500).send('신고 대상 검색 실패');
    }
});

// 신고 내용 블라인드 처리
router.patch('/blind', async (req, res, next) => {
    try {
        await Complain.update({ isBlind: true }, { where: { targetId: req.body.targetId } });
        res.status(200).json({ message: '블라인드 처리 완료' });
    } catch (err) {
        console.error('🚨 블라인드 처리 실패:', err);
        res.status(500).send('실패');
    }
});


module.exports = router;