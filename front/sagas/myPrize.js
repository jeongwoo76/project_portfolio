import { all, call, fork, put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';

import {
  LOAD_MY_PRIZES_REQUEST, LOAD_MY_PRIZES_SUCCESS, LOAD_MY_PRIZES_FAILURE,
  USE_MY_PRIZE_REQUEST, USE_MY_PRIZE_SUCCESS, USE_MY_PRIZE_FAILURE,
} from '../reducers/myPrize';

// --- API ---
function loadMyPrizesAPI() {
  return axios.get('/api/random-box');
}

function* loadMyPrizes() {
  try {
    const result = yield call(loadMyPrizesAPI);
    console.log("🎯 쿠폰리스트 응답 데이터:", result.data);

    yield put({
      type: LOAD_MY_PRIZES_SUCCESS,
      data: result.data.data || [],  // 방어적 처리
    });
  } catch (err) {
    console.error('쿠폰 리스트 로딩 실패:', err);  // 에러 확인
    yield put({
      type: LOAD_MY_PRIZES_FAILURE,
      error: err.response?.data?.message || '서버 오류가 발생했습니다.',
    });
  }
}

function useMyPrizeAPI(id) {
  return axios.post(`/api/random-box/use/${id}`, null);
}

function* useMyPrize(action) {
  try {
    const result = yield call(useMyPrizeAPI, action.data);
    console.log("🎯 Use My Prize API 응답:", result.data);  // 응답 데이터 출력
    const coupon = result.data.coupon || {};
    yield put({
      type: USE_MY_PRIZE_SUCCESS,
      data: {
        id: action.data, // 사용한 쿠폰 ID
        usedAt: coupon.usedAt,
        isRead: true,
      },
    });
    yield put({ type: LOAD_MY_PRIZES_REQUEST }); // 사용 후 다시 로딩
  } catch (err) {
    yield put({
      type: USE_MY_PRIZE_FAILURE,
      error: err.response?.data?.message || err.message || '쿠폰 사용 중 오류가 발생했습니다.',
    });
  }
}

// --- Watchers ---
function* watchLoadMyPrizes() {
  yield takeLatest(LOAD_MY_PRIZES_REQUEST, loadMyPrizes);
}

function* watchUseMyPrize() {
  yield takeLatest(USE_MY_PRIZE_REQUEST, useMyPrize);
}

// --- Root Saga ---
export default function* myPrizeSaga() {
  yield all([
    fork(watchLoadMyPrizes),
    fork(watchUseMyPrize),
  ]);
}
