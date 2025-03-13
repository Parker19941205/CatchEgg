import { ADConfig, PlatformCommon } from "../manager/PlatformManager";


export class AndroidManager implements PlatformCommon {
    showBlockAd(args?: any, args2?: any) {
        throw new Error("Method not implemented.");
    }
    hideBlockAd(args?: any, args2?: any) {
        throw new Error("Method not implemented.");
    }
    youmengTrack(key?: string, groupID?: string, groupValue?: string) {
        throw new Error("Method not implemented.");
    }
    getUserInfo(args?: any, callback?: Function) {
        throw new Error("Method not implemented.");
    }
    inviteFriend(args?: any, callback?: Function) {
        throw new Error("Method not implemented.");
    }
    getEnterOptionsInfo(args?: any, callback?: Function) {
        throw new Error("Method not implemented.");
    }
    getPrivacyAuthorize(args?: any, callback?: Function) {
        throw new Error("Method not implemented.");
    }
    getUserInfoLacation(args?: any, callback?: Function) {
        throw new Error("Method not implemented.");
    }
    isOpenLocation(openCallback?: Function, notOpenCallback?: Function) {
        throw new Error("Method not implemented.");
    }
    eventTrack(key?: string, value?: string) {
        throw new Error("Method not implemented.");
    }
    hasShare: boolean = false;

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
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SdkManager", "login", "()V");
    }
    pay(args?: any, callback?: Function) {
    }
    share(args?: any, callback?: Function) {
        if (callback) {
            callback();
        }
    }
    showBanner(args?: any, callback?: Function) {
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SdkManager", "showBanner", "()V");
    }
    hideBanner(args?: any, callback?: Function) {
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SdkManager", "hideBanner", "()V");
    }
    showInsertAd(args?: any, callback?: Function) {
    // cc.log(args+"-----------------------------------");
      jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SdkManager", "showInsertAd", "(Ljava/lang/String;)V",args);
    }
    callback:Function;
    showVideoAd(args?: any, callback?: Function,error?:Function,stub?: string) {
        //callback()
       this.callback=callback;
       jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SdkManager", "showVideoAd", "(Ljava/lang/String;Ljava/lang/String;)V","AndroidManager.videoCallback",args);
    //    if(callback){
    //        callback()
    //    }

    }

    videoCallback(){
        if(this.callback){
            this.callback();
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
    shark(args?: any, callback?: Function) {
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SdkManager", "shake", "(I)V",args);
     }
    /**分享 */
    openShare(args?: any, callback?: Function) { }

     onRecordCallBack:Function;
    recordVideo(args?: any, callback?: Function){
       // this.onRecordCallBack = callback;
     //   jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SdkManager", "capture", "(Ljava/lang/String;)V","AndroidManager.recordCallback");
    }

    recordCallback(){
        if(this.onRecordCallBack){
            this.onRecordCallBack();
        }
    }
    stopRecorderManager(args?: any, callback?: Function) {
        if(callback){
            callback
        }
    }
    shareVideo(args?: any, callback?: Function){
    }



    setLanguage(args?: any, callback?: Function){
      return jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SdkManager", "setLanguage", "()Ljava/lang/String;");
    
    }
    showPushApp(args?: any,style?:any, callback?: Function){
        if(callback){
            callback();
        }
    }

    exit(args?:any,callback?:Function){
       // console.log("----------------------------------exit")
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SdkManager", "exit", "()V");
    }

    goToSuperXiuXian(args?: any,callback?: Function){
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SdkManager", "goToSuperXiuXian","()V");
    }
}