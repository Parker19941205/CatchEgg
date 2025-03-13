
import { AudioMgr } from "../../framework/manager/AudioMgr";
import { UIMgr } from "../../framework/manager/UIMgr";
import { AudioId, GameConfig, UIID } from "../config/Config";
import { HttpManager } from "../manager/HttpManager";
import { ADConfig, PlatformCommon } from "../manager/PlatformManager";
import { PlayerMgr } from "../manager/PlayerMgr";
import { WXAuth } from "./WXAuth";
//import { createUserInfoButton } from "./auth";


export class WXManager implements PlatformCommon {
    hasShare: boolean;
    sdkConfig: ADConfig;
    getInvertTime(): number {
        throw new Error("Method not implemented.");
    }
    recordVideo(args?: any, callback?: Function) {
    }
    setLanguage(args?: any, callback?: Function): string {
        throw new Error("Method not implemented.");
    }
    exit(args?: any, callback?: Function) {
        throw new Error("Method not implemented.");
    }
    goToSuperXiuXian(args?: any, callback?: Function) {
    }
    showBlockAd(args?: any, callback?: Function) {
    }
    hideBlockAd(args?: any, callback?: Function) {
    }
    shareVideo(args?: any, callback?: Function) {
        UIMgr.getInstance().openUI(UIID.UITips,"暂时不能分享")
    }
    stopRecorderManager(args?: any, callback?: Function) {
    }
    /*是否有广告**/
    hasAd: boolean = false;
    /**是否有banner */
    hasBanner: boolean = false;
    /**是否有插屏 */
    hasInsertAd: boolean = false;
    /**是否有视频 */
    hasVideoAd: boolean = false;
    private BannerAdHight:number = 0;
    private BannerAdWidth:number = 0;
    private BannerAd;
    private VideoMap: Map<number, any> = new Map();
    private sdkVersion:string = "";
    private interstitialAd = null
    private nativeAd = null;
    private nativeAd2 = null;
    private nativeAd3 = null;

     compareVersion(v1, v2):number {
        v1 = v1.split('.')
        v2 = v2.split('.')
        const len = Math.max(v1.length, v2.length)
      
        while (v1.length < len) {
          v1.push('0')
        }
        while (v2.length < len) {
          v2.push('0')
        }
      
        for (let i = 0; i < len; i++) {
          const num1 = parseInt(v1[i])
          const num2 = parseInt(v2[i])
      
          if (num1 > num2) {
            return 1
          } else if (num1 < num2) {
            return -1
          }
        }
      
        return 0
      }

    initSdk(args?: any, callback?: Function) {
        let res =  wx.getSystemInfoSync();
        this.sdkVersion = res.SDKVersion;
        let screenWidth = res.screenWidth;
        let screenHeight = res.screenHeight;

        //分享菜单
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
        })
          
        /**==============视频====================== */
        if(this.compareVersion(this.sdkVersion, "2.0.4")>=0){
            let VideoAd = wx.createRewardedVideoAd({ adUnitId: "adunit-46e7a4c2286964ff"})
            this.VideoMap.set(1, VideoAd);                 
            let errorfunc = (res)=>{
                console.log("激励视频errorfunc===========>",res)
            }
            VideoAd.onError(errorfunc)
        }

    }
    
    login(args?: any, callback?: Function) {
        wx.login({
            success (res) {
                if (res.code) {
                    // 这里写你的登录逻辑，比如请求后端接口获取用户信息等
                    console.log('登录成功！' + res.code)
                    if(callback){
                        callback(res.code,"")
                    }
                } else {
                    console.log('登录失败！' + res.errMsg)
                }
            }
        })
    }

    getUserInfo(args?: any, callback?: Function) {
        // 可以通过 wx.getSetting 先查询一下用户是否授权了 "scope.writePhotosAlbum" 这个 scope
        wx.getSetting({
            success(res) {
                if (!res.authSetting['scope.getUserInfo']) {
                    console.log('获取授权')
                    wx.authorize({
                    scope: 'scope.getUserInfo',
                    success () {
                        // 用户已经同意获取用户信息，后续调用接口不会弹窗询问
                    }
                    })

                    // 必须是在用户已经授权的情况下调用
                    wx.getUserInfo({
                        success: function(res) {
                        var userInfo = res.userInfo
                        var nickName = userInfo.nickName
                        var avatarUrl = userInfo.avatarUrl
                        var gender = userInfo.gender //性别 0：未知、1：男、2：女
                        var province = userInfo.province
                        var city = userInfo.city
                        var country = userInfo.country
                        }
                    })
                }
            }
        })
    }
    
    pay(args?: any, callback?: Function) {
        if(callback){
            callback();
        }   
    }
    share(args?: any, callback?: Function) {
        wx.shareAppMessage({
            title: "我收集完了！就等你了！",
            desc:"",
            imageUrl: "https://mmocgame.qpic.cn/wechatgame/hNqaRp9BGb1cicUW72tjUPiaNBCu1G0xtia6Q0L5p2B0d4OdKba6zA05FYFHVmnAyZic/0",
            imageUrlId:"9VUAuCLtSa2mfwmSvG4F1Q==",
            query: "inviteID=",
            success() {
                if(callback){
                    callback(true)
                }
            },
            fail(e) {   
                if(callback){
                    callback(false)
                }
            },
        });
        
        setTimeout(()=>{
            if(callback){
                callback(true);
            }
        },3500)  
    }

    inviteFriend(args?: any, callback?: Function) {
        let queryStr = "inviteID=" + args
        // let num = 0
        // Object.keys(params).forEach(key => {
        //     num ++
        //     let sub = "&"
        //     if(num == Object.keys(params).length){
        //         sub = ""
        //     }
        //     queryStr += key + '=' + params[key] + sub;
        // })
        //cc.log("queryStr====>",queryStr)

        wx.shareAppMessage({
            title: "快来加入一起对战吧！",
            desc:"双人对战",
            imageUrl: "https://mmocgame.qpic.cn/wechatgame/HxhynQ4PFQnnb1LGypl4Cibgxxykh0N9KG786JbyQ9fztPJlCIuo0f4IGVx7wAJB6/0",
            imageUrlId:"FRPH6ycuS6e2cqxCRWTH+Q==",
            query: queryStr,
            success() {
                if(callback){
                callback(true)
                }
            },
            fail(e) {
            
                if(callback)
                callback(false);
            },
        });
    }

    showBanner(args?: any, callback?: Function) {
    }
    
    hideBanner(args?: any, callback?: Function) {
    }

    showInsertAd(args?: any, callback?: Function) {
    }

    showVideoAd(args?: any, callback?: Function, error?: Function) {
        //UIMgr.getInstance().openUI(UIID.UITips,"暂时不能看广告")
        //return
         
        let videoAd = this.VideoMap.get(1);
        if (videoAd == null) {
            videoAd = this.VideoMap.get(1)
        }

        AudioMgr.getInstance().stopMusic(AudioId.bgm)

        //videoAd.show()
        // 显示广告
        videoAd.show().then(() => {
            //console.log("广告显示成功");
        }).catch((err) => {
            // console.log("广告组件出现问题", err);
            // // 可以手动加载一次
            // videoAd.load().then(() => {
            //     console.log("手动加载成功");
            //     // 加载成功后需要再显示广告
            //     return videoAd.show();
            // });
            switch (err.rrCode) {
                case 1000:
                    UIMgr.getInstance().openUI(UIID.UITips,"暂时没有广告，请稍后再试")
                    break;
                case 1001:

                    break;
                case 1002:

                    break;
                case 1003:
                    UIMgr.getInstance().openUI(UIID.UITips,"内部错误")
                    break;
                case 1004:
                    UIMgr.getInstance().openUI(UIID.UITips,"无适合的广告")
                    break;
            }
        });



        var that = this
        let closefunc = (res) => {
            //  console.log('视频广告关闭回调')
            if (res && res.isEnded) {
                if (callback) {
                    callback(true)
                }
            } else {
                //console.log("播放中途退出，不下发游戏奖励");
                error()
            }
            videoAd.offClose(closefunc)
            videoAd.load()
            //cc.game.resume()
        }

        videoAd.onClose(closefunc)
    }
    otherFun(args?: any, callback?: Function) {
        if(callback){
            callback();
        }
    }
    /**点击home */
    homeToBackgroud(args?: any, callback?: Function) {
        if(callback){
            callback();
        }

    }
    /**回到界面 */
    backgroudToHome(args?: any, callback?: Function) {
        if(callback){
            callback();
        }
    }
    shark(args?: any, callback?: Function) {
        if(callback){
            callback();
        }
    }
    openNotify() { }
    registerNotify(key: string, second: any, content: string) { }
    deleteNotify(key: string) { }
    /**分享 */
    openShare(args?: any, callback?: Function) { }

    /**友盟统计*/
    youmengTrack(key?: string, abName?: string, value?: string){
       
        // var uma = require('./umtrack-wx-game/lib/index.js');;
        // uma.init({
        //     appKey: '60bdb5d0799cce47f937cf5f', //由友盟分配的APP_KEY
        //     autoGetOpenid: true, // 是否需要通过友盟后台获取openid或匿名openid，如若需要，请到友盟后台设置appId及secret
        //     debug: false, //是否打开调试模式
        //     uploadUserInfo: true // 自动上传用户信息，设为false取消上传，默认为false
        // })

        //console.log("groupID=========>",groupID)
        //console.log("groupValue=========>",groupValue)
        //wx.uma.trackEvent(key, {'detail':value});
    }

    getEnterOptionsInfo(args?: any, callback?: Function) {
        // 当其他玩家从分享卡片上点击进入时，获取query参数
        if (typeof wx === 'undefined') {
            return null;
        }

        let object = wx.getEnterOptionsSync();
        let inviteID = object.query['inviteID'];
        console.log("获取分享数据",inviteID);

        if (typeof inviteID === 'undefined') {
            return null;
        }

        return inviteID
    }

    /**获取用户隐私权限 */
    getPrivacyAuthorize(){
        WXAuth.needAuthorization()
        .then(() => {
            console.log('需要隐私弹窗');
            WXAuth.requirePrivacyAuthorize()
            .then(() => {
                console.log('用户同意');
            })
            .catch(() => {
                console.log('用户不同意');
            });
        })
        .catch(() => {
            console.log('已授权不需要隐私弹窗');
        });
    }

     /**获取用户信息 */
     getUserInfoLacation(){
        WXAuth.getUserProfile()
        .then((userInfo:any) => {
            console.log('权限data',userInfo)
            if(userInfo.isUpdate){
                let userData = PlayerMgr.getInstance().getUserData()
                let reqData = {
                    uid: userData.data.uid,
                    nickname: userInfo.nickName,
                    avatarUrl:userInfo.avatarUrl,
                    longitude: 0,
                    latitude: 0,
                }

                this.updateInfo(reqData)
            }
        })
    }

    updateInfo(reqData){
        HttpManager.getInstance().httpPost(GameConfig.httpUrl  + "user/update_info",reqData,(isOk:boolean,resqData: any) => {
            console.log("更新用户信息========>",isOk,resqData)
            if(!isOk){
                return
            }

            let userData = PlayerMgr.getInstance().getUserData()
            userData.updateUserInfo(resqData.nickname,resqData.avatarUrl)
        })
    }

    
    /**获取用户定位*/
    isOpenLocation(openCallback?: Function, notOpenCallback?: Function){
        WXAuth.isOpenLocation()
        .then((ok:boolean) => {
            openCallback()
        })
        .catch(() => {
            WXAuth.getLocation()
            .then((locationInfo:any) => {
                notOpenCallback(locationInfo)
            })
            .catch(() => {
                openCallback()
            })
        });
    }

    /**统计*/
    eventTrack(key?: string, value?: string){
        console.log("统计",key,value)
        wx.reportEvent(key, {
            "uid": PlayerMgr.getInstance().getUserData().data.uid,
        })
    }



}