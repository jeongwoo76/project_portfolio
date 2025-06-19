import React, { useCallback } from "react"; //부품객체
import { Button } from 'antd'; // 디자인
import PropTypes from "prop-types"; //넘겨받은 파라미터 테스트
import { useSelector, useDispatch } from "react-redux"; //중앙저장소 부품
import { FOLLOW_REQUEST, UNFOLLOW_REQUEST, UNFOLLOW_SUCCESS } from "@/reducers/user"; //액션타입


const FollowButton = ({ postUser, setPostUser, currentUserId }) => {
  /////////////////////////////////////code
  const dispatch = useDispatch();
  const { user, followLoading, unFollowLoading } = useSelector(state => state.user);
  //팔로잉하는 사람들 목록중에 아이디가 있니? - 팔로잉여부
  const isFollowing = user?.Followings.some((v) => v.id == postUser.id);
//const isFollowing = !!postUser?.Followers?.find(f => f.id === currentUserId);
  console.log("postUser 객체 구조:", postUser);
  console.log("currentUserIdcurrentUserId", currentUserId);

  const onClickFollow = useCallback(() => {

    if (isFollowing) { // 팔로잉 - 내친구 - 언팔로우
      dispatch({
        type: UNFOLLOW_REQUEST,
        data: postUser.id
      })
      // 상태 업데이트
      console.log(setPostUser);
      setPostUser((prev) => ({
        ...prev,
        Followers: prev.Followers.filter((f) => f.id !== currentUserId),
      }));
    } else { // 팔로우
      dispatch({
        type: FOLLOW_REQUEST,
        data: postUser.id,
        notiData: {
          SenderId: user.id,
          ReceiverId: postUser?.id,
        }
      })
      // 상태 업데이트
      setPostUser((prev) => ({
        ...prev,
        Followers: [...prev.Followers, { id: currentUserId }],
      }));
    }
  }, [isFollowing, postUser.id]);
  /////////////////////////////////////view
  return (
    <Button loading={followLoading || unFollowLoading} onClick={onClickFollow}>
      {isFollowing ? '언팔로우' : '팔로우'}
    </Button>
  );
}

FollowButton.propTypes = {
  postUser: PropTypes.object.isRequired,
  setPostUser: PropTypes.func.isRequired,
  currentUserId: PropTypes.number.isRequired,
};
export default FollowButton;