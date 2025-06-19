import React, { useCallback, useEffect, useState } from 'react';
import { Avatar, Button, Dropdown, Menu, Modal, Input } from 'antd';
import styled from 'styled-components';
import { MoreOutlined } from '@ant-design/icons';
import ComplainForm from '../complains/ComplainForm';
import TARGET_TYPE from '../../../shared/constants/TARGET_TYPE';
import FollowButton from './FollowButton';
import { useRouter } from 'next/router';

import { useDispatch, useSelector } from 'react-redux';
import { LOAD_BLOCK_REQUEST, USER_PASSWORD_CHANGE_REQUEST
  , ADD_BLOCK_REQUEST, REMOVE_BLOCK_REQUEST
  , LOG_OUT_REQUEST
  , USER_DELETE_REQUEST
  ,USER_PASSWORD_CHANGE_FAILURE } from '@/reducers/user';
import { LOAD_POSTS_REQUEST } from '@/reducers/post'
import Router from 'next/router';
import axios from 'axios';
import { LOAD_COMPLAIN_REQUEST } from '@/reducers/complain';

const ErrorMessage = styled.div`color:red;`;
const UnderlineInput = styled(Input)`
  border: none;
  border-bottom: 1px solid #d9d9d9;
  border-radius: 0;
  box-shadow: none;

  &:focus,
  &.ant-input-focused {
    border-bottom: 2px solid #1677ff;
    box-shadow: none;
  }
`;
const Wrapper = styled.div`
  width: 100%;
  background-color: #f0f2f5;
`;

const Banner = styled.div`
  height: 160px;
  background-color: skyblue;
  position: relative;
`;

const Container = styled.div`
  background-color: #fff;
  padding: 24px 16px 16px;
  border-radius: 12px 12px 0 0;
  margin: -60px auto 0;
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
  // max-width: 600px;
  position: relative;
`;

const AvatarBox = styled.div`
  position: absolute;
  top: -40px;
  left: 24px;
  border: 4px solid white;
  border-radius: 50%;
  background-color: white;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  margin-left: 96px; /* Avatar 오른쪽 공간 확보 */
`;

const InfoBox = styled.div`
  display: flex;
  flex-direction: column;
`;

const Nickname = styled.div`
  font-size: 20px;
  font-weight: bold;
`;

const Stats = styled.div`
  margin-top: 4px;
  color: #555;
`;


const DropdownBox = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
`;

const ButtonRow = styled.div`
  margin-top: 16px;
  display: flex;
  gap: 8px;
  justify-content: flex-end; /* 버튼을 오른쪽으로 정렬 */
`;

const Profile = (props) => {
  const dispatch = useDispatch();
  const { userOutDone, logOutDone, user,userPasswordChangeError, userPasswordChangeDone } = useSelector(state => state.user);
  const { logOutLoding, mainPosts, hasMorePosts, loadPostsLoading } = useSelector(state => state.post);
  const { addBlockDone, removeBlockDone } = useSelector((state) => state.user);
  const router = useRouter();
    const {myPage} = router.query;
  let filename = '';
  
  const matchedPost = props.mainPosts.find(
    prop => Number(prop.User?.id) === Number(myPage)
  ) 

    if(matchedPost &&  matchedPost.User?.UserProfileImages?.[0]){
       filename = matchedPost.User.UserProfileImages[0].src;
    }
  let postUserId = props.postUserId;
  const [postUser, setPostUser] = useState('');
  const [showMyPrize, setShowMyPrize] = useState(false);
  const { onShowMyPrize } = props


  // 차단 한 유저인지 확인
  const me = useSelector(state => state.user);
  console.log(me);

  console.log('me.user.Blocking:', me.user?.Blocking);
  console.log('postUserId:', postUserId);

  const blockingList = me.user?.Blocking || [];
  console.log('blockingList:', blockingList);

  const [isBlockedByMe, setIsBlockedByMe] = useState(null);
  const [password, setChangePassword] = useState(false);   // userInput  줄이기
  useEffect(() => {
    const blocked = blockingList.some((u) => Number(u.Blacklist?.BlockedId) === Number(postUserId));
    setIsBlockedByMe(blocked);
    console.log('🧪 차단 여부 판단 결과:', blocked);
  }, [blockingList, postUserId]);

  // 신고 당한 유저 블라인드 처리
  const { mainComplainCard } = useSelector((state) => state.complain);

  useEffect(() => {
    dispatch({
      type: LOAD_COMPLAIN_REQUEST,
    });
  }, [dispatch]);

  const isBlinded = mainComplainCard.some((report) => {
    return Number(report.targetId) === Number(postUserId) && report.isBlind && report.targetType === TARGET_TYPE.USER;
  });


  const { blockList } = useSelector((state) => state.user);
  const isBlocked = blockList.some((blockedUser) => Number(blockedUser.id) === Number(postUserId));
  useEffect(() => {
    if (addBlockDone || removeBlockDone) {
      dispatch({ type: LOAD_BLOCK_REQUEST });
    }
  }, [addBlockDone, removeBlockDone]);

  useEffect(() => {
    const postUserData = async () => {
      try {
        const postUserSelect = await axios.get(`http://localhost:3065/user/postUser?userId=${postUserId}`,
          { withCredentials: true }
        )
        console.log('postUserSelect.data',postUserSelect.data);
        setPostUser(postUserSelect.data);

      } catch (error) {
        console.error('유저 정보 불러오기 실패:', error);
      }
    };
    postUserData();
  }, [postUserId]);

  useEffect(() => {
    const lastId = mainPosts[mainPosts.length - 1]?.id;
    const number = [1, 2, 3];
    // number = 1,
    // number = 2 
    //다른 유저를 클릭했을 때는 되고
    //본인을 클릭했을 때 안됨
    //로그인 유저
    if (hasMorePosts && !loadPostsLoading) {
      if (postUserId) {
        //postuser
        //본인페이지 클릭
        if (user.id == props.postUserId) {
          dispatch({
            type: LOAD_POSTS_REQUEST,
            lastId,
            number: number[0],
            //userId: props.postUserId,
          })
        } else {
          dispatch({
            type: LOAD_POSTS_REQUEST,
            lastId,
            userId: postUserId,
            number: number[1],
          })
        }
      } else {//비로그인
        dispatch({
          type: LOAD_POSTS_REQUEST,
          lastId,
        })
      }
    }
  }, [postUserId]);
  //}, [mainPosts, hasMorePosts, loadPostsLoading, postUserId]);
  useEffect(() => {
    if (logOutDone) {
      Router.replace('/');
    }
  }, [logOutDone])
  useEffect(() => {
    if (userOutDone) {
      Router.replace('/');
    }
  })

  const [open, setOpen] = useState(false);
  const onLogout = useCallback(() => {
    dispatch({ type: LOG_OUT_REQUEST })
  });


  //탈퇴
  const [userDeleteConfirm,setUserDeleteConfirm] = useState(false);
  const onUserDeleteConfirm = () => {
    console.log('userDeleteConfirm=',userDeleteConfirm);
    setUserDeleteConfirm(prev => !prev);
    showModal('userDeleteConfirm');
  }

  const onUserDelete = useCallback(() => {
    dispatch({
      type: USER_DELETE_REQUEST,
    })
  });

  const [changePass, setChangePass] = useState('');
  const onChangePass = useCallback((e) => {
    // if(!changePass){
    //   setPasswordError(false);
    // }
    const newPass = e.target.value;
    console.log('setChangePass=',newPass);
    setChangePass(e.target.value);
  },[])
   const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);
   const onPassChangeConfirm = useCallback(() => {
    setIsChangePassModalOpen(prev => !prev);
    showModal('passChangeConfirm');
   })
   const [isUserDeleteModalOpen, setIsUserDeleteModalOpen] = useState(false);
  const showModal = (menu) => {
    console.log('클릭=',menu);
     menu === 'passChangeConfirm'? setIsChangePassModalOpen(true):setIsUserDeleteModalOpen(true);
  };
  const [passwordError, setPasswordError] = useState(false);
  const [samePass, setSamePass] = useState(false);
  ///////////////////////////////////////////////////////
//   useEffect(() => {
//   if (userPasswordChangeError) {
//     console.log('userPasswordChangeError 발생:', userPasswordChangeError);
//     setSamePass(true);
//   }
// }, [userPasswordChangeError]);

useEffect(() => {
  if (userPasswordChangeDone) {
    console.log('비밀번호 변경 성공');
    setChangePass('');
    setSamePass(false);
    setPasswordError(false);
    setIsChangePassModalOpen(false);
  }
}, [userPasswordChangeDone]);

useEffect(() => {
  if (userPasswordChangeError) {
    console.log('비밀번호 변경 실패');
    setSamePass(true);
  }
}, [userPasswordChangeError]);

useEffect(() => {

})
const [deleteModal, setDeleteModal] = useState(false)
const [deleteMessage,setDeleteMessage] = useState('');
useEffect(()=>{
  setDeleteMessage(str=>str);
},[deleteMessage])
// useEffect(()=>{
//   if(!deleteMessage){
//     setDeleteModal(false);
//   }else{
//     setDeleteModal(true);
//   }
// },[deleteModal])
  const handleOk = useCallback( async (str) => {
    const passRegex = /^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[0-9a-zA-Z!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,12}$/;
    const formData = new FormData();
    setPasswordError(false);
      if(str === 'changePass'){
        console.log('changePass=',changePass);
        formData.append('changePass',changePass);
        console.log('changePass 실행',);
        if(!passRegex.test(changePass)){
          console.log('비밀번호 에러');
          setPasswordError(true);
          dispatch({ type: USER_PASSWORD_CHANGE_FAILURE }) //초기화
          return; 
        }

        dispatch({
          type: USER_PASSWORD_CHANGE_REQUEST,
          data: changePass,
        })

        setChangePass('');
        setPasswordError(false);
        // if(!samePass){
        //   setIsChangePassModalOpen(false);
        //   //setSamePass(true);
        // }
        // else{
        //   setIsChangePassModalOpen(true);
        //   return;
        // }
        //alert('비밀번호 변경이 완료되었습니다.');
        return;
      }
      if(str === 'deleteUser'){
        console.log('deleteUser입장');
        console.log('deleteUser',changePass);
        //formData.append('deleteUser',changePass);
        await axios.post('http://localhost:3065/user/userDelete'
                  ,{confirmPass:changePass} 
                  ,{ withCredentials: true })
                      .then(function (response){
                          console.log('탈퇴확인',response.data.message)
                          //setDeleteMessage(response.data.message)
                          alert(response.data.message);
                          Router.replace('/');
                        })
                        .catch(function(error){
                          setDeleteModal(true);
                          setDeleteMessage(error.response.data.message)
                          console.log('탈퇴에러',error.response.data.message);
                      })

        return;
      }
    //setIsUserDeleteModalOpen(false);
    setChangePass('');
    setSamePass(false);
    //setUserDeleteConfirm(prev => !prev)
  },[changePass]);

  const handleCancel = useCallback(() => {
    console.log('캔슬');
    setIsChangePassModalOpen(false);
    setIsUserDeleteModalOpen(false);
    setPasswordError(false);
    setChangePass('');
    setSamePass(false);
    setDeleteMessage('');
    setDeleteModal(false);
    dispatch({ type: USER_PASSWORD_CHANGE_FAILURE })
    //setUserDeleteConfirm(prev => !prev)
  },[changePass]);

  const isMyProfile = user && (user.id == postUserId);

  const menu = (
    <Menu>
      {isMyProfile ? (
        <>
          {/* <Menu.Item key="edit">프로필 수정</Menu.Item> */}
          <Menu.Item key="change-password" onClick={onPassChangeConfirm}>비밀번호 변경</Menu.Item>
          {isChangePassModalOpen && (<Modal title="비밀번호 변경" open={isChangePassModalOpen} onOk={()=>handleOk('changePass')} onCancel={handleCancel}>
            <UnderlineInput type='password' name='changePass' value={changePass} onChange={onChangePass} placeholder="새 비밀번호입력(최소 8~12자리 특수문자포함하여 작성)" />
            {passwordError&& <ErrorMessage>비밀번호를 확인해주세요.(최소 8~12자리 특수문자포함)</ErrorMessage>}
            {samePass&&<ErrorMessage>{userPasswordChangeError?.message}</ErrorMessage>}
          </Modal>)}
          <Menu.Item key="logout" onClick={onLogout}>
            {logOutLoding ? '로그아웃 중...' : '로그아웃'}
          </Menu.Item>
          <Menu.Item key="withdraw" onClick={onUserDeleteConfirm} danger>
            탈퇴하기
          </Menu.Item>
           {isUserDeleteModalOpen && (<Modal title="탈퇴하기" open={isUserDeleteModalOpen} onOk={()=>handleOk('deleteUser')} onCancel={handleCancel}>
            <UnderlineInput type='password' name='changePass' value={changePass} onChange={onChangePass} placeholder="현재 비밀번호를 입력해주세요." />
            {deleteModal&& <ErrorMessage>비밀번호를 확인해주세요.(최소 8~12자리 특수문자포함)</ErrorMessage>}
          </Modal>)}
        </>
      ) : (
        <>
          {isBlocked ? (
            <Menu.Item key="unblock" onClick={() => dispatch({ type: 'REMOVE_BLOCK_REQUEST', data: postUserId })}>
              차단 해제
            </Menu.Item>
          ) : (
            <Menu.Item key="block" onClick={() => dispatch({ type: 'ADD_BLOCK_REQUEST', data: postUserId })}>
              차단하기
            </Menu.Item>
          )}
          <Menu.Item key="report" onClick={() => setOpen(true)} danger>
            신고하기
          </Menu.Item>
          <ComplainForm
            open={open}
            onClose={() => setOpen(false)}
            TARGET_TYPE={TARGET_TYPE.USER}
            targetId={postUserId}
            targetUserNickname={postUser?.nickname}
            targetUser={postUser}
          />
        </>
      )
      }
    </Menu >
  );
  if (postUser?.isBlockedMe) {
    return (
      <Wrapper>
        <Container>
          <Nickname style={{ textAlign: 'center', fontSize: '18px', color: '#999' }}>
            해당 유저의 프로필을 볼 수 없습니다. (차단됨)
          </Nickname>
        </Container>
      </Wrapper>
    );
  }
  return (

    <Wrapper>
      <Banner />
      <Container>
        <AvatarBox>
          <Avatar size={80} src={`http://localhost:3065/userImages/${filename}`}>
            {isBlinded ? 'X' : (postUser?.nickname || '닉네임 없음')}
          </Avatar>

        </AvatarBox>

        <DropdownBox>
          <Dropdown overlay={menu} trigger={['click']}>
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        </DropdownBox> 

        <TopRow>
          <InfoBox>
            <Nickname>{isBlinded ? '신고 당한 유저입니다.' : (postUser?.nickname || '닉네임 없음')}</Nickname>
            <Stats>
              {postUser ? postUser?.Followings.length : 0} 팔로잉  &nbsp;&nbsp;
              {postUser ? postUser?.Followers.length : 0} 팔로워 &nbsp;&nbsp;
              {/* {mainPosts?.length} 게시물 */}
              {mainPosts ? mainPosts?.filter(prop => { 
                 return Number(prop.UserId) === Number(myPage)
                }).length:0} 게시물
            </Stats>
          </InfoBox>
        </TopRow>
        {isMyProfile ? (
          <ButtonRow>
            <Button type="primary" onClick={onShowMyPrize} >내 쿠폰함</Button> 
            {/* <Button>내 장소</Button> */}
            {/* <Button>챌린지 현황</Button> */}
            {/* <Button>프로필 수정</Button> */}
          </ButtonRow>
        ) : (
          <ButtonRow>
            {/* <FollowButton post={props.postUserId} /> */}
            {!isBlockedByMe && !isMyProfile && <FollowButton postUser={postUser}
              setPostUser={setPostUser}
              currentUserId={user?.id} />}
            <Button>장소</Button>
          </ButtonRow>
        )}
      </Container>
    </Wrapper>
  );
};

export default Profile;
