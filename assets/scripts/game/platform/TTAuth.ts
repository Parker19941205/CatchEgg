enum AuthKey {
    userInfo = 'userInfo',
    userFuzzyLocation = 'userFuzzyLocation',
    werun = 'werun',
    writePhotosAlbum = 'writePhotosAlbum',
    WxFriendInteraction = 'WxFriendInteraction',
    gameClubData = 'gameClubData',
}

// 缓存判断是否已授权，只在本次运行时有效
const scope: Record<AuthKey, boolean> = {
    userInfo: false,
    userFuzzyLocation: false,
    werun: false,
    writePhotosAlbum: false,
    WxFriendInteraction: false,
    gameClubData: false,
};

// 展示提示文案
const scopeMsg: Record<AuthKey, string> = {
    userInfo: '需要先授权用户信息',
    userFuzzyLocation: '需要先授权模糊地理位置',
    werun: '需要先授权微信运动步数',
    writePhotosAlbum: '需要先授权保存相册',
    WxFriendInteraction: '需要先授权微信朋友关系',
    gameClubData: '需要先授权游戏圈数据',
};

export class TTAuth {
   

    // 缓存查询授权
    public static cachedPromiseScope: Record<AuthKey, Promise<string> | null> = {
        userInfo: null,
        userFuzzyLocation: null,
        werun: null,
        writePhotosAlbum: null,
        WxFriendInteraction: null,
        gameClubData: null,
    };
        
      /**
       * 主动拉起授权
       */
      public static requirePrivacyAuthorize() {
        return new Promise((resolve, reject) => {
            console.log('主动拉起授权');
            if (!tt.requirePrivacyAuthorize) {
                console.log('版本太低');
                reject();
                return;
            }
            // if (Date.now() - lastPrivacyTime < gapTime) {
            //   // in gap
            //   console.log('调用太频繁');
            //   reject();
            //   return;
            // }
            // lastPrivacyTime = Date.now();
            tt.requirePrivacyAuthorize({
                success: () => {
                    console.log('requirePrivacyAuthorize success');
                    // 用户同意授权
                    resolve(true);
                },
                fail: (res) => {
                    console.log('requirePrivacyAuthorize fail:', res);
                    // 用户拒绝授权
                    reject();
                },
            });
        });
      }
      
    /**
     * 查询是否需要隐私授权弹窗
     */
    public static needAuthorization() {
        return new Promise((resolve, reject) => {
            if (!tt.getPrivacySetting) {
                reject('');
            }
            tt.getPrivacySetting({
                success: (res) => {
                console.log('getPrivacySetting success:', res,res.needAuthorization);
                // 用户同意授权
                if (res.needAuthorization) {
                    resolve('');
                } else {
                    reject();
                }
                },
                fail: (res) => {
                    console.log('getPrivacySetting fail:', res);
                    reject();
                },
            });
        });
    }
      
    
    /**
     * 向用户发起授权请求
     */
    public static authorize(
        key: AuthKey,
        getScope: boolean | undefined,
        needShowModal: boolean,
        resolve: (res: string) => void,
        reject: () => void,
    ) {
        if (key === 'userInfo') {
        console.warn('除了用户信息以外，其他的授权可以通过authorize获取');
        reject();
        return;
        }
        tt.authorize({ scope: `scope.${key}` })
        .then((res) => {
            console.log('用户已授权', res);
            // 已授权
            resolve('');
        })
        .catch((res) => {
            console.log('用户未授权', res);
            // 未授权
            if (res.errMsg.indexOf('not authorized in gap') > -1) {
            //showToast();
            }
            // 如果是之前弹过授权且用户拒绝，尝试弹窗提醒用户打开
            if (
            res.errMsg.indexOf('auth deny') > -1 &&
            needShowModal &&
            getScope === false
            ) {
            // 用户拒绝
            tt.showModal({
                content: scopeMsg[key],
                confirmText: '去授权',
                success: (res) => {
                if (res.confirm) {
                    tt.openSetting({
                    success: (res) => {
                        const authKey =
                        `scope.${key}` as keyof WechatMinigame.AuthSetting;
                        if (res.authSetting[authKey] === true) {
                        // 已授权
                        resolve('');
                        return;
                        }
                        reject();
                    },
                    fail: reject,
                    });
                    return;
                }
                reject();
                },
                fail: reject,
            });
            return;
            }
            reject();
        });
    }
      
      /**
     * 查询某个scope是否已授权
     * @param {String} key
     * @param {Boolean} needShowModal
     * @param {Boolean} showPrivacy
     * @returns
     */
    public static getAuth(
        key: AuthKey,
        needShowModal = true,
        showPrivacy = true,
    ): Promise<string> {
        if (this.cachedPromiseScope[key]) {
            return this.cachedPromiseScope[key] as Promise<string>;
        }
        this.cachedPromiseScope[key] = new Promise((resolve, reject) => {
            tt.getSetting({
                success(res) {
                    const authKey = `scope.${key}` as keyof WechatMinigame.AuthSetting;
                    const getScope = res.authSetting[authKey];
                    if (getScope === true) {
                        console.log('已授权');
                        resolve('');
                        return;
                    }
                    TTAuth.needAuthorization()
                    .then(() => {
                        console.log('需要隐私弹窗',showPrivacy);
                        if (showPrivacy) {
                            console.log('需要隐私弹窗111');
                            TTAuth.requirePrivacyAuthorize()
                            .then(() => {
                                console.log('用户同意弹窗');
                                TTAuth.authorize(key, getScope, needShowModal, resolve, reject);
                            })
                            .catch(() => {
                                console.log('用户不同意弹窗');
                                reject();
                            });
                        } else {
                            reject();
                        }
                    })
                    .catch(() => {
                        console.log('不需要隐私弹窗');
                        TTAuth.authorize(key, getScope, needShowModal, resolve, reject);
                    });
                },
                fail(res) {
                    console.warn('getSetting fail:', res);
                    reject();
                },
            });
        })
        .then(() => {
            scope[key] = true;
            return Promise.resolve('');
        })
        .catch(() => {
            scope[key] = false;
            return Promise.reject();
        })
        // .finally(() => {
        //     this.cachedPromiseScope[key] = null;
        // });
    
        return this.cachedPromiseScope[key] as Promise<string>;
    }
    
    /**
     * 获取是否已授权个人信息，如果没有授权则拉起授权弹窗
     * 请务必在点击事件后调用改函数
     */
    public static getAuthUserInfo(needShowModal = true, showPrivacy = true) {
        return this.getAuth(AuthKey.userInfo, needShowModal, showPrivacy);
    }
    
    /**
     * 创建获取个人信息按钮
     */
    public static createUserInfoButton(
        key: string,
        callback: (res: WechatMinigame.OnTapListenerResult) => void,
    ) {
        //const { x, y, width, height } = data;
        // 如果已存在创建的按钮，则说明用户还没授权，直接提示
        // if (userInfoButtonList[key]) {
        //   showUserInfoButton(key);
        //   return;
        // }
        this.getAuthUserInfo()
            .then(() => {
                tt.getUserInfo({
                    success: (res) => {
                    callback(res);
                    },
                });
            })
            .catch(() => {
            console.log("用户未授权22222");
        });
    }


    /**
     * 获取个人信息
     */
    public static getUserProfile() {
        return new Promise((resolve, reject) => {
            // 推荐使用tt.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
            // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
            tt.getSetting({
                success (res){
                    console.log("授权个人信息========>",res.authSetting)
                    if (res.authSetting['scope.userInfo']) {
                        console.log("已授权")
                        let data = {
                            isUpdate:false,
                        }
                        resolve(data);
                    } else {
                        console.log("未授权")
                        tt.getUserInfo({
                            desc: '用于完善个人资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
                            success: (res) => {
                                console.log("getUserProfile:success====>",res)
                                let nickName = res.userInfo.nickName
                                let avatarUrl = res.userInfo.avatarUrl
                                //PlayerMgr.getInstance().getUserData().updateUserInfo(nickName,avatarUrl)
                                let data = {
                                    isUpdate:true,
                                    nickName:nickName,
                                    avatarUrl:avatarUrl
                                }
                                resolve(data);
                            },
                            fail:(res) => {
                                console.log("getUserProfile:fail====>",res)
                                let data = {
                                    isUpdate:false,
                                }
                                resolve(data);
                            }
                        })
                    }
                }
            })
        });
    }

    
    /**
     * 获取定位信息
     */
    public static getLocation() {
        return new Promise((resolve, reject) => {
            tt.getSetting({
                success (res){
                    console.log("授权定位信息========>",res.authSetting)
                    if (res.authSetting['scope.userLocation']) {
                        console.log("已授权")
                        reject();
                    } else {
                        console.log("未授权")
                        if(tt.getLocation){
                            tt.getLocation({
                                type: 'wgs84',
                                success (res) {
                                    console.log("getLocation:success====>",res)
                                    let latitude = res.latitude
                                    let longitude = res.longitude
                                    //PlayerMgr.getInstance().getUserData().updatePosition(latitude,longitude)
                                    let data = {
                                        latitude:latitude,
                                        longitude:longitude
                                    }
                                    resolve(data);
                                },
                                fail:(res) => {
                                    console.log("getLocation:fail====>",res)
                                    reject();
                                }
                            })
                        }else{
                            console.log("当前抖音版本过低:getLocation接口不存在====>")
                            reject();
                        }
                    }
                }
            })
        });
    }


    /**
     * 是否授权定位
     */
    public static isOpenLocation() {
        return new Promise((resolve, reject) => {
            tt.getSetting({
                success (res){
                    if (res.authSetting['scope.userLocation']) {
                        console.log("已授权")
                        resolve(true);
                    } else {
                        console.log("未授权")
                        reject()
                    }
                }
            })
        });
    }
}




