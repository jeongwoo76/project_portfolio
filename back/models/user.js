module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    nickname: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phonenumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    deleteAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    // paranoid: true, // 소프트 삭제 활성화
    //timestamps: true, // createdAt, updatedAt, deletedAt 자동 생성
    charset: 'utf8',
    collate: 'utf8_general_ci'
  });
  User.associate = (db) => {
    //일 대 다 
    //Notification
    db.User.hasMany(db.Notification, { foreignKey: 'SenderId', as: 'SentNotifications', });
    db.User.hasMany(db.Notification, { foreignKey: 'ReceiverId', as: 'ReceivedNotifications', });
    db.User.hasMany(db.NotificationSetting, {
      foreignKey: 'UserId',
      as: 'NotificationSettings',
      onDelete: 'CASCADE',
    });
    //UserProfileImage
    db.User.hasMany(db.UserProfileImage)
    // Complain
    db.User.hasMany(db.Complain, { foreignKey: 'ReporterId' });
    //Animal
    db.User.hasMany(db.Animal);
    //Post
    db.User.hasMany(db.Post, {
      onDelete: 'CASCADE',
      hooks: true,
    });
    //Chatting
    db.User.hasMany(db.Chatting);
    //Comment
    db.User.hasMany(db.Comment);


    /// 다 대 다 
    db.User.belongsToMany(db.Post, { through: 'Like', as: 'Liked' });
    db.User.belongsToMany(db.User, { through: 'Follow', as: 'Followers', foreignKey: 'FollowingId' });
    //  Follow 테이블에서 팔로우하는사람 (FollowingId) 을 기준으로 관계설정 - 팔로우하는 사람 ID
    db.User.belongsToMany(db.User, { through: 'Follow', as: 'Followings', foreignKey: 'FollowerId' });
    //                                                      user.getFollowings()
    //MyPrize
    db.User.belongsToMany(db.Prize, { through: db.MyPrize, foreignKey: 'UserId' });
    //UserGroup
    db.User.belongsToMany(db.Group, { through: 'GroupMember', as: 'groupmembers', foreignKey: 'UserId' }); // 중간테이블 별칭 추가
    //MyPlace
    db.User.belongsToMany(db.Place, { through: 'MyPlace', as: 'Places' });
    //ChattingMemebers
    db.User.belongsToMany(db.ChattingRoom, { through: db.ChattingMember, foreignKey: 'UserId' });
    //BlackList
    db.User.belongsToMany(db.User, {
      through: 'Blacklist',
      as: 'Blocking',        // 내가 차단한 사람들
      foreignKey: 'BlockingId',  // 내가 blocker다
    });
    db.User.belongsToMany(db.User, {
      through: 'Blacklist',
      as: 'Blocked',         // 나를 차단한 사람들
      foreignKey: 'BlockedId',   // 내가 block 당한 쪽
    });

  };
  return User;
};