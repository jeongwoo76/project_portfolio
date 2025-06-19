import { Avatar, List,Card, message } from 'antd';
import VirtualList from 'rc-virtual-list';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import FollowButton from './FollowButton';
import { useRouter } from 'next/router';
import axios from 'axios';

const FollowList = ({follower}) => {
  const router = useRouter();
  const {user} = useSelector(state=>state.user)
  const {myFollow} = router.query;
    const [postUser, setPostUser] = useState('');
  let postUserId = myFollow;
  console.log('FollowList',myFollow);
  console.log('router쿼리',router.query);
  const fakeDataUrl =
  'https://randomuser.me/api/?results=20&inc=name,gender,email,nat,picture&noinfo';
const ContainerHeight = 400;
  const [data, setData] = useState([]);
  useEffect(() => {
    console.log('✅ postUser가 변경됨:', postUser);
  }, [postUser]);
  const appendData = () => {
    fetch(fakeDataUrl)
      .then((res) => res.json())
      .then((body) => {
        setData(data.concat(body.results));
        message.success(`${body.results.length} more items loaded!`);
      });
  };
  //const {followerList} = useSelector(state => state.user);
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
  console.log('postUserpostUserpostUser', postUser);
  console.log('followerfollower', follower);

   useEffect(() => {
     appendData();
   }, []);
  const onScroll = (e) => {
    if (e.currentTarget.scrollHeight - e.currentTarget.scrollTop === ContainerHeight) {
      appendData();
    }
  };
  return (
            <Card>
              <Card.Meta 
                avatar={<Avatar>{follower.username}</Avatar>}
                title={<a href="https://ant.design"></a>}
                description={''}
              />
              {/* <FollowButton postUser={follower} setPostUser={setPostUser} currentUserId={user?.id}/> */}
            </Card> 
            
  );
};
export default FollowList;