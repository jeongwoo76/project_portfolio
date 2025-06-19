import { all, call, fork, put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';

import {
  ADD_PRIZE_REQUEST, ADD_PRIZE_SUCCESS, ADD_PRIZE_FAILURE,
  LOAD_PRIZES_REQUEST, LOAD_PRIZES_SUCCESS, LOAD_PRIZES_FAILURE,
  MODIFY_PRIZE_REQUEST, MODIFY_PRIZE_SUCCESS, MODIFY_PRIZE_FAILURE,
  REMOVE_PRIZE_REQUEST, REMOVE_PRIZE_SUCCESS, REMOVE_PRIZE_FAILURE,
  OPEN_RANDOM_BOX_REQUEST, OPEN_RANDOM_BOX_SUCCESS, OPEN_RANDOM_BOX_FAILURE,
  LOAD_RANDOM_BOX_LIST_REQUEST, LOAD_RANDOM_BOX_LIST_SUCCESS, LOAD_RANDOM_BOX_LIST_FAILURE,
  LOAD_ISSUED_RANDOM_BOXES_REQUEST,LOAD_ISSUED_RANDOM_BOXES_SUCCESS,LOAD_ISSUED_RANDOM_BOXES_FAILURE,
} from '../reducers/prize';

function addPrizeAPI(data) {
  return axios.post('/admin/prizes', data);
}


function* addPrize(action) {
  try {
    const result = yield call(addPrizeAPI, action.data);
    yield put({ type: ADD_PRIZE_SUCCESS, data: result.data });
  } catch (err) {
    yield put({ type: ADD_PRIZE_FAILURE, error: err.response?.data || err.message });
  }
}

function loadPrizesAPI() {
  return axios.get('/admin/prizes');
}

function* loadPrizes() {
  try {
    const result = yield call(loadPrizesAPI);
    yield put({ type: LOAD_PRIZES_SUCCESS, data: result.data });
  } catch (err) {
    yield put({ type: LOAD_PRIZES_FAILURE, error: err.response?.data || err.message });
  }
}

function modifyPrizeAPI(data) {
  const { id, ...rest } = data;
  return axios.patch(`/admin/prizes/${data.id}`, data);
}

function* modifyPrize(action) {
  try {
    const result = yield call(modifyPrizeAPI, action.data);
    yield put({ type: MODIFY_PRIZE_SUCCESS, data: result.data });
  } catch (err) {
    console.error('modifyPrize error:', err);
    yield put({ type: MODIFY_PRIZE_FAILURE, error: err.response?.data || err.message });
  }
}

function removePrizeAPI(id) {
  return axios.delete(`/admin/prizes/${id}`);
}

function* removePrize(action) {
  try {
    yield call(removePrizeAPI, action.data);
    yield put({ type: REMOVE_PRIZE_SUCCESS, data: action.data });
  } catch (err) {
    yield put({ type: REMOVE_PRIZE_FAILURE, error: err.response?.data || err.message });
  }
}


// 발급된 랜덤박스 목록을 조회하는 API
function loadRandomBoxListAPI() {
  return axios.get('/random-boxes/issued');  // 현재 발급된 모든 랜덤박스 조회
}

function* loadRandomBoxList() {
  try {
    const result = yield call(loadRandomBoxListAPI);
    console.log("🎯 랜덤박스 리스트 응답 데이터:", result.data);

    yield put({
      type: LOAD_RANDOM_BOX_LIST_SUCCESS,
      data: result.data.data || [],  // 방어적 처리
    });
  } catch (err) {
    yield put({
      type: LOAD_RANDOM_BOX_LIST_FAILURE,
      error: err.response?.data?.message || '서버 오류가 발생했습니다.',
    });
  }
}

function openRandomBoxAPI(issuedId) {
  return axios.post(`/random-boxes/issued/use/${issuedId}`);
}

function* openRandomBox(action) {
  try {
    const result = yield call(openRandomBoxAPI, action.data); // action.data가 prizeId여야 함
    console.log("🎯 Open Random Box API 응답:", result.data);
    yield put({ type: OPEN_RANDOM_BOX_SUCCESS, data: result.data });
  } catch (err) {
    yield put({ type: OPEN_RANDOM_BOX_FAILURE, error: err.response?.data || err.message });
  }
}


// 발급된 랜덤박스 중 사용 가능한 것만 조회하는 API
function loadIssuedRandomBoxesAPI() {
  return axios.get('/random-boxes/issued/list');  // 사용 가능한 랜덤박스만 조회
}

function* loadIssuedRandomBoxes() {
  try {
    const result = yield call(loadIssuedRandomBoxesAPI);
    yield put({
      type: LOAD_ISSUED_RANDOM_BOXES_SUCCESS,
      data: result.data.data || [],  // API 응답 형태에 맞게 조절
    });
  } catch (err) {
    yield put({
      type: LOAD_ISSUED_RANDOM_BOXES_FAILURE,
      error: err.response?.data?.message || err.message,
    });
  }
}



function* watchAddPrize() {
  yield takeLatest(ADD_PRIZE_REQUEST, addPrize);
}

function* watchLoadPrizes() {
  yield takeLatest(LOAD_PRIZES_REQUEST, loadPrizes);
}

function* watchModifyPrize() {
  yield takeLatest(MODIFY_PRIZE_REQUEST, modifyPrize);
}

function* watchRemovePrize() {
  yield takeLatest(REMOVE_PRIZE_REQUEST, removePrize);
}

function* watchOpenRandomBox() {
  yield takeLatest(OPEN_RANDOM_BOX_REQUEST, openRandomBox);
}

function* watchLoadRandomBoxList() {
  yield takeLatest(LOAD_RANDOM_BOX_LIST_REQUEST, loadRandomBoxList);
}


function* watchLoadIssuedRandomBoxes() {
  yield takeLatest(LOAD_ISSUED_RANDOM_BOXES_REQUEST, loadIssuedRandomBoxes);
}


export default function* prizeSaga() {
  yield all([
    fork(watchAddPrize),
    fork(watchLoadPrizes),
    fork(watchModifyPrize),
    fork(watchRemovePrize),
    fork(watchOpenRandomBox),
    fork(watchLoadRandomBoxList),
    fork(watchLoadIssuedRandomBoxes),
  ]);
}
