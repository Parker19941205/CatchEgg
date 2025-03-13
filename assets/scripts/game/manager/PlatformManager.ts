import { AudioMgr } from "../../framework/manager/AudioMgr";
import { UIMgr } from "../../framework/manager/UIMgr";
import { AudioId } from "../config/Config";
import { AndroidManager } from "../platform/AndroidManager";
import { ByteDanceManager } from "../platform/ByteDanceManager";
import { EditorManager } from "../platform/EditorManager";
import { WXManager } from "../platform/WXManager";
export class ADConfig {
    appId?: string;
    videoId?: Map<string, string>;
    insertId?: Map<Number, string>;
    bannerId?: Map<Number, string>;
}
/**渠道平台 */
export enum Platform {
    /**字节跳动 */
    BYTEDANCE = 1,
    /**微信 */
    WECHAT_GAME = 2,
    /**vivo */
    Vivo = 4,
    /**baidu */
    Baidu = 5,
    Oppo = 6,
    QQ = 7,
    ANDROID = 10,
    GOOGLE = 11,
    EDITOR = 0,
}

export interface PlatformCommon {
    /*是否有广告**/
    hasAd: boolean
    /**是否有banner */
    hasBanner: boolean
    /**是否有插屏 */
    hasInsertAd: boolean
    /**是否有视频 */
    hasVideoAd: boolean;
    /**是否有分享 */
    hasShare: boolean;
    sdkConfig: ADConfig;

    /**初始化 必须判断callback是否存在 然后调用返回*/
    initSdk(args?: any, callback?: Function);
    /**登录 必须判断callback是否存在 然后调用返回*/
    login(args?: any, callback?: Function)
    /**支付 必须判断callback是否存在 然后调用返回*/
    pay(args?: any, callback?: Function)
    /**分享 必须判断callback是否存在 然后调用返回*/
    share(args?: any, callback?: Function)
    /**显示banner 必须判断callback是否存在 然后调用返回*/
    showBanner(args?: any, callback?: Function)
    /**关闭banner 必须判断callback是否存在 然后调用返回*/
    hideBanner(args?: any, callback?: Function)
    /**显示插屏 必须判断callback是否存在 然后调用返回*/
    showInsertAd(args?: any, callback?: Function)
    /**播放视频广告 必须判断callback是否存在 然后调用返回*/
    showVideoAd(args?: any, callback?: Function, error?: Function, stub?: string)
    /**获取每个平台最大的倒计时时间 */
    getInvertTime(): number;

    /**点击home 必须判断callback是否存在 然后调用返回*/
    homeToBackgroud(args?: any, callback?: Function)
    /**回到界面 必须判断callback是否存在 然后调用返回*/
    backgroudToHome(args?: any, callback?: Function)
    /**开启通知弹窗 */
    openNotify()
    /**注册一个通知 */
    registerNotify(key: string, second: number, content: string)
    deleteNotify(key: string)
    /**其他方法 必须判断callback是否存在 然后调用返回*/
    otherFun(args?: any, callback?: Function)
    /**摇一摇 必须判断callback是否存在 然后调用返回*/
    shark(args?: any, callback?: Function)

    recordVideo(args?: any, callback?: Function);
    shareVideo(args?: any, callback?: Function);
    stopRecorderManager(args?: any, callback?: Function);
    setLanguage(args?: any, callback?: Function): string;
    exit(args?: any, callback?: Function);
    goToSuperXiuXian(args?: any, callback?: Function);
    showBlockAd(args?:any,args2?:any)
    hideBlockAd(args?:any,args2?:any)
    youmengTrack(key?: string,groupID?:string,groupValue?:string)
    getUserInfo(args?: any, callback?: Function)
    inviteFriend(args?: any, callback?: Function)
    getEnterOptionsInfo(args?: any, callback?: Function)
    getPrivacyAuthorize(args?: any, callback?: Function)
    getUserInfoLacation(args?: any, callback?: Function)
    isOpenLocation(openCallback?: Function, notOpenCallback?: Function)
    eventTrack(key?: string,value?:string)
}

export class PlatformManager {
    /** 打包的时候需要替换 当前平台 */
    public static currentPlatform = Platform.BYTEDANCE;
    public static canShowRedPaper = false;
    public static canshowInstanceRedPaper = false;
    public static fishType="";
    private static _instance: PlatformManager;
    public static HomeRightblockAdPos:cc.Vec2; //主界面积木i广告位置
    public static statusHeight;
    private currentPaltform: PlatformCommon;
    public static canPopSubscribe = false;
    public static hasAddCaiQian = false;
    public static isShowBanner = false;
    public static isShowBlock = false;
    public TalkingdataEvent: number[] = []


    public static getInstance(): PlatformManager {
        if (this._instance == null) {
            this._instance = new PlatformManager();
        }
        return this._instance;
    }

    // 是否支持Talkingdata统计
    public iSupportTalkingdata(): boolean {
        for (let i = 0; i < this.TalkingdataEvent.length; i++) {
            if (PlatformManager.currentPlatform == this.TalkingdataEvent[i]) {
                return true;
            }
        }
        return false;
    }

    public init() {
        switch (cc.sys.platform) {
            case cc.sys.ANDROID:
                this.currentPaltform = new AndroidManager()
                PlatformManager.currentPlatform = Platform.ANDROID;
                break;
            case cc.sys.WECHAT_GAME:
                this.currentPaltform = new WXManager()
                PlatformManager.currentPlatform = Platform.WECHAT_GAME;
                break
            case cc.sys.BYTEDANCE_GAME:
                this.currentPaltform = new ByteDanceManager();
                PlatformManager.currentPlatform = Platform.BYTEDANCE;
                break;
            default:
                this.currentPaltform = new EditorManager()
                //PlatformManager.currentPlatform = Platform.EDITOR;
                break
        }
        console.log("当前平台是" + this.parsePlatformName(),cc.sys.platform);
        this.initSdk();

    }
    /**
     *     KUAIKAN = 1,
    /**微信 */
    //WEICHAT = 2,
    /**字节跳动 */
    //BYTEDANCE = 3,
    /**vivo */
    // Vivo = 4,
    /**baidu */
    // Baidu = 5,
    // Oppo = 6,
    // QQ = 7,
    // Sisanjiujiu = 8,
    // WECHAT_GAME = 9,
    // ANDROID = 10,
    // GOOGLE = 11,
    // EDITOR = 0,
    //*/
    public parsePlatformName(): string {
        switch (PlatformManager.currentPlatform) {
            case Platform.Baidu:
                return "baidu"
            case Platform.ANDROID:
                return "android"
            case Platform.BYTEDANCE:
                return "byteDance"
            case Platform.Vivo:
                return "vivo"
            case Platform.Oppo:
                return "Oppo"
            case Platform.WECHAT_GAME:
                return "wechat"
            case Platform.EDITOR:
                return "editor"
            case Platform.QQ:
                return "QQ"
        }
        return "editor";
    }

    public static isWeiXin():boolean {
        if (typeof wx !== "undefined"){
            return true
        }
        return false
    }

    public static isByteDance():boolean {
        if (typeof tt !== "undefined"){
            return true
        }
        return false
    }

    hasShare(): boolean {
        return this.currentPaltform.hasShare;
    }
    hasAd(): boolean {
        return this.currentPaltform.hasAd;
    }
    hasBanner(): boolean {
        if (this.hasAd) {
            return this.currentPaltform.hasBanner;
        }

        return false;
    }
    hasInsertAd(): boolean {
        if (this.hasAd) {
            return this.currentPaltform.hasInsertAd;
        }
        return false;
    }
    hasVideoAd(): boolean {
        if (this.hasAd) {
            return this.currentPaltform.hasVideoAd;
        }
        return false;
    }
    initConfig() {

    }

    initSdk(args?: any, callback?: Function) {
        this.currentPaltform.initSdk()
    }
    login(args?: any, callback?: Function) {
        this.currentPaltform.login(args, callback)
    }
    pay(args?: any, callback?: Function) {
        this.currentPaltform.pay(args, callback)
    }
    /**args:{msg} */
    share(args?: any, callback?: Function) {
        this.currentPaltform.share(args, callback)
    }
    showBanner(args?: any, callback?: Function) {
        this.currentPaltform.showBanner(args, callback)
    }
    hideBanner(args?: any, callback?: Function) {
        this.currentPaltform.hideBanner(args, callback)
    }
    showInsertAd(args?: any, callback?: Function) {
        this.currentPaltform.showInsertAd(args, callback)
    }

    showVideoAd(callback?: Function,name?:string) {
        let isSucceed: boolean = true;
        console.log("----------showVideoAd----------");

        PlatformManager.getInstance().youmengTrack("ad_click",name)
        this.currentPaltform.showVideoAd("",() => {
            //cc.director.resume()
            AudioMgr.getInstance().playMusic(AudioId.bgm,true)
            if (callback) {
                console.log("----------视频播放成功回调----------");
                callback();
            }
            PlatformManager.getInstance().youmengTrack("ad_success",name)
        }, (msg: string) => {
            console.log("----------视频播放失败回调----------");
            //播放广告中途关闭
            // if (msg == "") {
            //     cc.director.resume()
            //     //广告请求不了
            // } else if (msg == "1" || msg == "120002") {
            //     isSucceed = false;
            //     cc.director.resume()
            //     UIMgr.getInstance().showTips("暂无广告");
            // } else {
            //     UIMgr.getInstance().showTips(msg);
            // }
            AudioMgr.getInstance().playMusic(AudioId.bgm,true)
        })
    }

    otherFun(args?: any, callback?: Function) {
        this.currentPaltform.otherFun(args, callback)
    }
    getInvertTime(): number {
        return this.currentPaltform.getInvertTime();
    }
    /**点击home */
    homeToBackgroud(args?: any, callback?: Function) {

    }
    /**回到界面 */
    backgroudToHome(args?: any, callback?: Function) {

    }
    openNotify() {
        this.currentPaltform.openNotify();
    }

    registerNotify(key: string, second: number, content: string) {
        this.currentPaltform.registerNotify(key, second, content)
    }
    deleteNotify(key: string) {
        this.currentPaltform.deleteNotify(key)
    }
    shark(args?: any, callback?: Function) {
        this.currentPaltform.shark(args, callback)
    }
    recordVideo(args?: any, callback?: Function) {
        this.currentPaltform.recordVideo(args, callback)
    }
    stopRecorderManager(args?: any, callback?: Function) {
        this.currentPaltform.stopRecorderManager(args, callback)
    }
    shareVideo(args?: any, callback?: Function) {
        this.currentPaltform.shareVideo(args, (isOk:boolean,msg: string) => {
            if(isOk){ //成功
                if (callback) {
                    callback();
                }
            }else{ // 失败
            }

            if (msg != null && msg != undefined) {
                UIMgr.getInstance().showTips(msg);
            } 
        })
    }

    setLanguage(args?: any, callback?: Function) {
        return this.currentPaltform.setLanguage();
    }

    exit(args?: any, callback?: Function) {
        this.currentPaltform.exit()
    }
    
    showBlockAd(args?:any,args2?:any){
      
        this.currentPaltform.showBlockAd(args, args2)
    }
    hideBlockAd(args?:any,args2?:any){
        this.currentPaltform.hideBlockAd(args, args2)
    }
    youmengTrack(key?: string, value?: string) {
        this.currentPaltform.youmengTrack(key,value)
    }
    getUserInfo(args?: any, callback?: Function) {
        this.currentPaltform.getUserInfo(args, callback)
    }
    inviteFriend(args?: any, callback?: Function) {
        this.currentPaltform.inviteFriend(args, callback)
    }

    getEnterOptionsInfo(args?: any, callback?: Function) {
        return this.currentPaltform.getEnterOptionsInfo(args, callback)
    }
    getPrivacyAuthorize(){
        this.currentPaltform.getPrivacyAuthorize()
    }
    getUserInfoLacation(){
        this.currentPaltform.getUserInfoLacation()
    }

    isOpenLocation(openCallback?: Function, notOpenCallback?: Function) {
        this.currentPaltform.isOpenLocation(openCallback,notOpenCallback)
    }

    eventTrack(key?: string, value?: string) {
        this.currentPaltform.eventTrack(key,value)
    }

}