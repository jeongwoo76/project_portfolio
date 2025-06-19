import React, { useState, useEffect } from "react";
import { Button, Tabs, Avatar, List, Spin, Popover, message } from "antd";
import { PictureOutlined, MoreOutlined } from "@ant-design/icons";
import axios from "axios";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import {
  LOAD_ANIFOLLOWERS_REQUEST,
  LOAD_ANIFOLLOWINGS_REQUEST,
  LOAD_RECOMMENDED_ANIMALS_REQUEST,
  ANIFOLLOW_REQUEST,
  ANIUNFOLLOW_REQUEST,
  REMOVE_ANIFOLLOW_REQUEST,
  RESET_ANIFOLLOW_STATE,
} from "@/reducers/animal";

const { TabPane } = Tabs;

const AniFollow = ({ownerId}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = router.query;
  const imageBaseUrl = 'http://localhost:3065/uploads/animalProfile';

  const { user } = useSelector((state) => state.user);
  const isOwner = user && Number(user.id) === Number(ownerId);

  const {
    followers = [],
    followings = [],
    recommendedAnimals = [],
    loadRecommendedAnimalsLoading,
    loadAnifollowersLoading,
    loadAnifollowingsLoading,
    anifollowDone,
    aniunfollowDone,
    anifollowError,
    aniunfollowError,
  } = useSelector((state) => state.animal);

  const [myAnimalName, setMyAnimalName] = useState('');

  

  // 친구 요청 / 끊기
  const handleFollowToggle = (targetAnimalId, isFollowing) => {
    if (!id) return;

    dispatch({
      type: isFollowing ? ANIUNFOLLOW_REQUEST : ANIFOLLOW_REQUEST,
      data: {
        targetAnimalId: Number(targetAnimalId),
        myAnimalId: Number(id),
      },
    });
  };

  const handleRemoveFollower = (targetAnimalId) => {
    if (!id) return;

    dispatch({
      type: REMOVE_ANIFOLLOW_REQUEST,
      data: {
        animalId: Number(id),
        targetAnimalId: Number(targetAnimalId),
      },
    });
  };

  useEffect(() => {
    if (anifollowDone) {
      message.success('친구 요청을 보냈습니다!');
      dispatch({type: RESET_ANIFOLLOW_STATE});
    }
  }, [anifollowDone]);

  useEffect(() => {
    if (aniunfollowDone) {
      message.success('친구를 끊었습니다.');
      dispatch({type: RESET_ANIFOLLOW_STATE});
    }
  }, [aniunfollowDone]);
  useEffect(() => {
    if (anifollowError) {
      message.error(`친구 요청 실패: ${anifollowError}`);
      dispatch({type: RESET_ANIFOLLOW_STATE});
    }
  }, [anifollowError]);

  useEffect(() => {
    if (aniunfollowError) {
      message.error(`친구 끊기 실패: ${aniunfollowError}`);
      dispatch({type: RESET_ANIFOLLOW_STATE});
    }
  }, [aniunfollowError]);

  // 동물 정보 + 팔로잉/팔로워/추천 동물 불러오기
  useEffect(() => {
    if (!id) return;

    [LOAD_ANIFOLLOWINGS_REQUEST, LOAD_ANIFOLLOWERS_REQUEST, LOAD_RECOMMENDED_ANIMALS_REQUEST].forEach((type) =>
      dispatch({ type, data: id })
    );

    axios.get(`/animal/${id}`)
      .then((res) => {
        setMyAnimalName(res.data.animal?.aniName || '');
      })
      .catch((err) => {
        console.error('🐶 내 동물 정보 가져오기 실패:', err);
      });
  }, [id]);

  const renderList = (data, isLoading, emptyMessage, showActions = true, type = '') => {
    if (isLoading) return <Spin />;
    if (!data || data.length === 0) {
      return <div style={{ textAlign: "center", color: "#999", padding: 20 }}>{emptyMessage}</div>;
    }

    return (
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item) => {
          const description =
            type === 'followers' || type === 'followings'
              ? `${myAnimalName}의 친구입니다.`
              : item.Category?.content
                ? `저는 ${item.Category.content}입니다.`
                : '';

          return (
            <List.Item
              actions={[
                isOwner && (
                  <Button
                    key="friend"
                    type={item.isFollowing ? "default" : "primary"}
                    danger={item.isFollowing}
                    onClick={() => handleFollowToggle(item.id, item.isFollowing)}
                  >
                    {item.isFollowing ? "친구" : "친구 맺기"}
                  </Button>
                ),
                isOwner && showActions && (
                  <Popover
                    key="more"
                    content={
                      <div>
                        <Button type="text" onClick={() => handleRemoveFollower(item.id)}>친구끊기</Button>
                        <br />
                        {/* <Button type="text" danger onClick={() => console.log("차단하기", item.id)}>차단하기</Button> */}
                      </div>
                    }
                    trigger="click"
                  >
                    <MoreOutlined style={{ fontSize: 18, cursor: "pointer" }} />
                  </Popover>
                ),
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div onClick={() => router.push(`/animal/${item.id}`)} style={{ cursor: 'pointer' }}>
                    {item.aniProfile ? (
                      <Avatar src={`${imageBaseUrl}/${item.aniProfile}`} />
                    ) : (
                      <Avatar icon={<PictureOutlined />} />
                    )}
                  </div>
                }
                title={
                  <div
                    style={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/animal/${item.id}`)}
                  >
                    <div>{item.aniName || '이름 없음'}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{description}</div>
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />
    );
  };

  return (
    <div style={{ backgroundColor: "#fff", padding: 24, borderRadius: 8 }}>
      <Tabs defaultActiveKey="followers" centered>
        <TabPane tab="팔로잉" key="followings">
          {renderList(followings, loadAnifollowingsLoading, "친구 맺은 동물이 없습니다.", false, 'followings')}
        </TabPane>
        <TabPane tab="팔로워" key="followers">
          {renderList(followers, loadAnifollowersLoading, "나를 친구 맺기로 한 동물이 없습니다.", true, 'followers')}
        </TabPane>
      </Tabs>
      {isOwner && (
      <div style={{ marginTop: 24 }}>
        <h3>{myAnimalName ? `${myAnimalName}님을 위한 친구 추천` : '친구 추천'}</h3>
        {renderList(recommendedAnimals, loadRecommendedAnimalsLoading, "추천할 친구가 없습니다.", false)}
      </div>
      )}
    </div>
  );
};

export default AniFollow;
