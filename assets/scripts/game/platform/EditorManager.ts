import { ADConfig, PlatformCommon } from "../manager/PlatformManager";


export class EditorManager implements PlatformCommon {
    eventTrack(key?: string, value?: string) {
    }
    isOpenLocation(openCallback?: Function, notOpenCallback?: Function) {
        openCallback()
    }
    getUserInfoLacation(args?: any, callback?: Function) {
    }
    getPrivacyAuthorize(args?: any, callback?: Function) {
    }
    getEnterOptionsInfo(args?: any, callback?: Function) {
    }
    inviteFriend(args?: any, callback?: Function) {
    }
    getUserInfo(args?: any, callback?: Function) {
    }
    youmengTrack(key?: string, value?: string) {
        console.log("友盟统计发送事件:"+key,value)
    }
    goToSuperXiuXian(args?: any, callback?: Function) {
       // throw new Error("Method not implemented.");
    }
    showBlockAd(args?: any, args2?: any) {
       // throw new Error("Method not implemented.");
    }
    hideBlockAd(args?: any, args2?: any) {
      //  throw new Error("Method not implemented.");
    }
    hasShare: boolean;

    /*是否有广告**/
    hasAd: boolean = true;
    /**是否有banner */
    hasBanner: boolean = true;
    /**是否有插屏 */
    hasInsertAd: boolean = true;
    /**是否有视频 */
    hasVideoAd: boolean = true;

    sdkConfig: ADConfig;

    initSdk(args?: any, callback?: Function) {
    }
    login(args?: any, callback?: Function) {
        //cc.log("href=====>",window.location.search)
        let uid = window.location.search == "" ? "0" : window.location.search.replace("?", "")
        if (callback) {
            callback("",uid);   //0新号
        }
    }
    pay(args?: any, callback?: Function) {
    }
    share(args?: any, callback?: Function) {
        if (callback) {
            callback();
        }
    }
    showBanner(args?: any, callback?: Function) {
    }
    hideBanner(args?: any, callback?: Function) {
        let bannerNode = cc.find("Canvas/BannerUI")
        if (bannerNode) {
            bannerNode.destroy();
        }
    }
    showInsertAd(args?: any, callback?: Function) {
        // cc.log(args+"-----------------------------------");
        if(callback){
            callback()
        }
        //his.addNode(args, "这是个测试的插屏广告", callback)
    }
    showVideoAd(args?: any,callback?: Function,error?:Function) {
        //this.youmengTrack("videosuccessful")
        if(callback){
            callback()
        }
    }
    otherFun(args?: any, callback?: Function) {
    }
    /**点击home*/
    homeToBackgroud(args?: any, callback?: Function) {

    }
    /**回到界面*/
    backgroudToHome(args?: any, callback?: Function) {

    }
    getInvertTime(): number {
        return 5;
    }
    openNotify() { }
    registerNotify(key: string, second: number, content: string) { }
    deleteNotify(key: string) { }
    shark(args?: any, callback?: Function) { }
    /**分享 */
    openShare(args?: any, callback?: Function) { }

    recordVideo(args?: any, callback?: Function) {
    }
    stopRecorderManager(args?: any, callback?: Function) { }
    shareVideo(args?: any, callback?: Function) {
        if(callback){
            callback(true,"分享成功")
        }
    }
    setLanguage(args?: any, callback?: Function){
        return null;
    }

    exit(args?:any,style?:any,callback?:Function){
        
    }
}