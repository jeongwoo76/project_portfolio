import React, {useEffect} from 'react';
import { useDispatch } from 'react-redux';
import { loadAniProfiles } from '@/reducers/animal';
import AppLayout from '@/components/AppLayout';
import AnimalProfileCard from '@/components/animal/AnimalProfileCard'; // 등록된 리스트
import AniFollow from '@/components/animal/AniFollow';

const AniProfile = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    // dispatch({
    //   type: 'LOAD_ANIPROFILE_SUCCESS',
    //   data: [
    //     {
    //       aniName: '코코',
    //       aniAge: '3',
    //       category: '강아지',
    //       aniProfile: '1',
    //     },
    //     {
    //       aniName: '나비',
    //       aniAge: '2',
    //       category: '고양이',
    //       aniProfile: '2',
    //     },
    //   ],
    // });
  }, []);
  return (
    <AppLayout>
      <h2>동물 프로필 목록</h2>
      <AnimalProfileCard /> {/* Redux의 animals 배열 사용 */}
      <AniFollow/>
    </AppLayout>
  );
};

export default AniProfile;
