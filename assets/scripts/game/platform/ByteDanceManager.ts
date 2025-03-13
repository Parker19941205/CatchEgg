import { AudioMgr } from "../../framework/manager/AudioMgr";
import { UIMgr } from "../../framework/manager/UIMgr";
import { AudioId, GameConfig, UIID } from "../config/Config";
import { HttpManager } from "../manager/HttpManager";
import { ADConfig, PlatformCommon, PlatformManager } from "../manager/PlatformManager";
import { PlayerMgr } from "../manager/PlayerMgr";
import { TTAuth } from "./TTAuth";

/**字节跳动 */
export class ByteDanceManager implements PlatformCommon {
    getUserInfo(args?: any, callback?: Function) {
    }
    showBlockAd(args?: any, args2?: any) {
       // throw new Error("Method not implemented.");
    }
    hideBlockAd(args?: any, args2?: any) {
        //throw new Error("Method not implemented.");
    }
    youmengTrack(key?: string, value?: string) {
        console.log("统计发送事件:",key,value)
        tt.reportAnalytics(key, {
            value: value,
        });          
    }


    /*是否有广告**/
    hasAd: boolean = true;
    /**是否有banner */
    hasBanner: boolean = true;
    /**是否有插屏 */
    hasInsertAd: boolean = true;
    /**是否有视频 */
    hasVideoAd: boolean = true;
    hasShare: boolean = false;
    sdkConfig: ADConfig;
    private BannerAd = null;
    private stub: String = ""
    private BannerAdHight: number = 0
    private BannerAdWight: number = 0
    private interstitialAd = null;
    public count: number = 0;
    private videoAd = null
    private recorder = null
    private stopCallback:Function = null
    private isRecorderStop:boolean = false


    private VideoMap: Map<number, any> = new Map();
    
    initSdk(args?: any, callback?: Function) {
        //视频广告
        this.videoAd = tt.createRewardedVideoAd({ adUnitId: "1yuk64id2vj2id7b4f"})
      
    }

    login(args?: any, callback?: Function) {
        tt.login({
          force: false,
          success(res) {
            console.log(`login 调用成功${res.code} ${res.anonymousCode}`);
            if (callback) {
                callback(res.code,res.anonymousCode)
            }
          },
          fail(res) {
            console.log(`login 调用失败`);
          },
        });
        
    }
    pay(args?: any, callback?: Function) {
        if (callback) {
            callback()
        }
    }

    share(args?: any, callback?: Function) {
        tt.shareAppMessage({
            title: "我收集完了！就等你了！",
            desc:"",
            imageUrl: "https://p3-developer-sign.bytemaimg.com/tos-cn-i-ke512zj2cu/778c84fce9184172a650fee5ccfd3a65~tplv-ke512zj2cu-jpg.jpeg?lk3s=e9111aaa&x-expires=1724405843&x-signature=EbvwxLT%2FvmSLaOeASVz3URscfAo%3D",
            imageUrlId:"21jhkkako8d834gbfh",
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

    showBanner(stub?: string) {
    }

    hideBanner(args?: any, callback?: Function) {
    }


    showInsertAd(args?: any, callback?: Function) {
       // console.log("播放插屏appName==============>",tt.getSystemInfoSync().appName) 
        const isToutiaio = tt.getSystemInfoSync().appName === "Douyin";
        // 插屏广告仅今日头条安卓客户端支持
        if (isToutiaio) {
            if (this.interstitialAd) {
                this.interstitialAd.destroy();
                this.interstitialAd = null;
            }
            this.interstitialAd = tt.createInterstitialAd({
                adUnitId: "shba8lf0456f45fagp"
            });
            this.interstitialAd.load().then(()=>{
                this.interstitialAd.show().then(()=>{
                    console.log("-- TT 展示插屏广告成功！");
                }).
                catch(err=>{
                    console.error("-- TT 展示插屏广告失败！err =", err);
                });
            }).
            catch(err=>{
                console.error("-- TT 加载插屏广告失败,err =", err);
            });
        }

        
    }


    showVideoAd(args?: any, callback?: Function,error?:Function) { 
        
        var platform = tt.getSystemInfoSync().platform
        AudioMgr.getInstance().stopMusic(AudioId.bgm)

        // 显示广告
        console.log("广告videoAd=====>",this.videoAd);
        this.videoAd.show().then(() => {   
            console.log("广告显示成功===>",platform);
            if(platform == "android"){
          
            }
        }).catch((err) => {
            cc.log("广告组件出现问题", err);
            // 可以手动加载一次
            this.videoAd.load().then(() => {
                cc.log("手动加载成功");
                // 加载成功后需要再显示广告
                if(platform == "android"){
                   
                }
              
                return this.videoAd.show();
            });
        });


        let closeFunc = (res)=>{
            if (res && res.isEnded) {
                if (callback) {
                    callback()
                }
              // console.log("正常播放结束，可以下发游戏奖励");
            } else {
                    error("")
                //console.log("播放中途退出，不下发游戏奖励");
            }
            this.videoAd.offClose(closeFunc)
            this.videoAd.load()
        }

        this.videoAd.onClose(closeFunc)

        this.videoAd.onError((errCode,errMsg)=>{
            console.log("广告显示失败===>",errCode,errMsg);
            switch(errCode){
                case "120002":
                    error("120002")
                    break
                default :
                    error("1")
                    break
            }
        })
    }

    homeToBackgroud(args?: any, callback?: Function) {
        if (callback) {
            callback()
        }
    }
    backgroudToHome(args?: any, callback?: Function) {
        if (callback) {
            callback()
        }
    }
    openNotify() {
    }
    registerNotify(key: string, second: number, content: string) {
    }
    deleteNotify(key: string) {
    }
    otherFun(args?: any, callback?: Function) {
        if (callback) {
            callback()
        }
    }
    shark(args?: any, callback?: Function) {
        if(args == 1){
            tt.vibrateLong(
                {
                    success: function(res) {
                        //console.log("------------震动回调成功----------");
                    },
                    fail: function(res) {
                        //console.log("---------------震动回调失败--------------");
                    },
                    complete: function(res) {
                        //console.log("---------------震动完成--------------");
                    }
                }
            )
        }else if(args == 2){
            tt.vibrateShort(
                {
                    success: function(res) {
                       // console.log("------------震动回调成功----------");
                    },
                    fail: function(res) {
                       // console.log("---------------震动回调失败--------------");
                    },
                    complete: function(res) {
                       // console.log("---------------震动完成--------------");
                    }
                }
            )
        }
        // if (callback) {
        //     callback()
        // }
    }


    recordVideo(args?: any, callback?: Function) {
        console.log("进入录屏接口=============")
        this.isRecorderStop = false
        tt.getSystemInfo({
            success(res) {
              const screenWidth = res.screenWidth;
              const screenHeight = res.screenHeight;
              let recorder = tt.getGameRecorderManager();
              var maskInfo = recorder.getMark();
              var x = (screenWidth - maskInfo.markWidth) / 2;
              var y = (screenHeight - maskInfo.markHeight) / 2;
          
              recorder.onStart((res) => {
                console.log("录屏开始");
                // do somethine;
                PlayerMgr.getInstance().recorderStart = true
              });

              //添加水印并且居中处理
              recorder.start({
                duration: 300,
                isMarkOpen: false,
                locLeft: x,
                locTop: y,
              });

            //   recorder.onStop((res) => {
            //         console.log("录屏停止====================",res.videoPath)
            //         cc.sys.localStorage.setItem('RecorderPath', res.videoPath);
            //         if(this.stopCallback){
            //             this.stopCallback()
            //             this.stopCallback = null
            //         }
            //   });
              
            //   recorder.onStart((res) => {
            //     console.log("开始监听====================")

            //   });
              
            //   recorder.start();
            },
        });
    }


    stopRecorderManager(args?: any, callback?: Function) {
        const recorder = tt.getGameRecorderManager();
        console.log("停止录屏接口=======>",recorder,this.isRecorderStop)
        if(recorder == null){
            return
        }

        if(this.isRecorderStop){
            if(callback){
                callback()
                callback = null
            }
            return
        }

        recorder.onStop((res) => {
            console.log("设置录屏地址====================",res.videoPath,callback)
            cc.sys.localStorage.setItem('RecorderPath', res.videoPath);
            if(callback){
                callback()
                callback = null
            }
            this.isRecorderStop = true
        });
        recorder.stop();
    }


    shareVideo(args?: any,callback?: Function){
      //  cc.log("视频分享====================")
        let videopath = cc.sys.localStorage.getItem('RecorderPath');
     
        console.log("获取videopath====================",videopath)
        //console.log("videopath.length====================",videopath.length)
        if(videopath == null || videopath.length == 0 || videopath == undefined){
            callback(false,"还没有分享的内容")
           return
        }

        // 视频分享
        tt.shareAppMessage({
            channel: "video",
            query: "",
            title: "我收集完了！就等你了！",
            desc: "我收集完了！就等你了！",
            extra: {
            videoPath: videopath, // 可用录屏得到的本地文件路径
            videoTopics: ["我收集完了！就等你了！"],
            },
            success() {
                callback(true,"分享成功")
            },
            fail(e) {
                console.log("分享失败====================",e)
                if(e.errNo == 21105){
                    callback(false,"分享失败，录屏时间太短")
                }else{
                    callback(false,"分享失败")
                }
            },
        });
    
        
    }

    getInvertTime(): number {
        return 0;
    }
    setLanguage(args?: any, callback?: Function){
        return null;
    }
    showPushApp(args?: any, callback?: Function){
        
    }
    exit(args?:any,style?:any,callback?:Function){
        
    }
    goToSuperXiuXian(args?:any,style?:any,callback?:Function){

    }
    
    inviteFriend(args?: any, callback?: Function) {
        let queryStr = "roomId=" + args
        tt.shareAppMessage({
            title: "房间号:" + args + ",快来加入一起对战吧",
            desc: "双人对战",
            imageUrl: "https://mmocgame.qpic.cn/wechatgame/HxhynQ4PFQnnb1LGypl4Cibgxxykh0N9KG786JbyQ9fztPJlCIuo0f4IGVx7wAJB6/0",
            query: queryStr,
            success() {
                console.log("分享成功");
            },
            fail(e) {
                console.log("分享失败");
            },
        });
    }

    getEnterOptionsInfo(args?: any, callback?: Function) {
        // 当其他玩家从分享卡片上点击进入时，获取query参数
        if (typeof tt === 'undefined') {
            return null;
        }

        let object = tt.getLaunchOptionsSync(); //getLaunchOptionsSync
        let inviteID = object.query['roomId'];
        console.log("获取分享数据",inviteID);

        if (typeof inviteID === 'undefined') {
            return null;
        }

        return inviteID
    }

     /**获取用户隐私权限 */
     getPrivacyAuthorize(){
        TTAuth.needAuthorization()
        .then(() => {
            console.log('需要隐私弹窗');
            TTAuth.requirePrivacyAuthorize()
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
        TTAuth.getUserProfile()
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
        TTAuth.isOpenLocation()
        .then((ok:boolean) => {
            openCallback()
        })
        .catch(() => {
            TTAuth.getLocation()
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
        tt.reportAnalytics(key, {
            "uid": PlayerMgr.getInstance().getUserData().data.uid,
        })
    }
}