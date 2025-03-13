import { BaseEventName, LoadingProcess } from "../../framework/configs/Appcfg";
import { EventMgr } from "../../framework/manager/EventMgr";
import { GAME_MSG_TYPE } from "../../framework/network/MsgEnum";
import { NetData } from "../../framework/network/NetInterface";
import { NetManager } from "../../framework/network/NetManager";
import { TimeUtils } from "../../framework/utils/TimeUtils";
import { EventName } from "../config/Config";
import { GameData } from "../datas/GameData";
import { GuideData } from "../datas/GuideData";
import { TrackData } from "../datas/TrackData";
import { UserData } from "../datas/UserData";



enum WalletChangeType{
    /*** 分享视频*/
    share_video,
    /*** 签到*/
    sign_in,
    /*** 邮件*/
    mail,
    /*** 游戏结束*/
    game,
    /*** 兑换码*/
    redeem_code,
    /*** 钻石转金币*/
    conversion,
    /*** 查询*/
    query,
    /*** 抽奖*/
    draw,
    /*** 看广告*/
    ad,
    /*** 商城购买 */
    shop
}


export class PlayerMgr{

    private static instance: PlayerMgr;
    private constructor() { }
    public static getInstance(): PlayerMgr {
        if (this.instance == null) {
            this.instance = new PlayerMgr();
            this.instance.initData();
        }
        return this.instance;
    }
    private isLoaded: boolean = false;
    public isHurtAdd:boolean = false
    public isIncomeAdd:boolean = false
    public offlineTime:number = null
    public recorderTime = 0;  //录屏时间
    public recorderStart:boolean = false;  //录屏开始
    private trackData:TrackData;
    public isNewUser:boolean = false;  //是否新用户
    private guideData: GuideData;
    private gameData: GameData;
    private userData: UserData;
    public roomID:string = "";  //房间ID
    private walletDelayMsg = []
    public isGameing:boolean = false;  //是否正在游戏中

    private initData() {
        cc.log("PlayerMgr:init=======>")
        NetManager.getInstance().register(GAME_MSG_TYPE.expendEnery, this.onHandEneryChange, this)
    }

    preload() {
        if (this.isLoaded) {
            return;
        }
        this.isLoaded = true;
        
        this.gameData = new GameData();
        this.gameData.getData();
        this.userData = new UserData();
        this.userData.getData();
        this.trackData = new TrackData();
        this.trackData.getData();
        this.guideData = new GuideData();
        this.guideData.getData();

        EventMgr.getInstance().emit(BaseEventName.Loading, LoadingProcess.PlayerCfg)
    }
  
    getTrackData(): TrackData {
        return this.trackData;
    }
    
    getGuideData(): GuideData {
        return this.guideData;
    }

    getGameData(): GameData {
        return this.gameData;
    }

    getUserData(): UserData {
        return this.userData;
    }

    getUserInfo() {
        return this.userData.data;
    }

    // 每秒更新
    updateData(){
        let gameRunTime =  cc.director.getTotalTime();
        let timeScend =  Math.floor(gameRunTime/1000)
        //cc.log("游戏运行时间==========>",timeScend)

        if(timeScend % (10*60) == 0){
            //每10分钟更新一次
            if(!this.isGameing){
                cc.log("每10分钟更新一次")
                //EventMgr.getInstance().emit(EventName.RefreshPetInfo)
            }
        }

        //设置当前在线时间
        //let onlineTime = TimeUtils.GetTimeBySecond()
        //localStorage.setItem("lastOnlineTime",""+onlineTime)

    }

    /**离线时间 */
    getOnlineTime(){
        let currentOnlineTime = TimeUtils.GetTimeBySecond() // 获取当前在线时间戳
        let lastOnlineTime = Number(localStorage.getItem("lastOnlineTime"))
        if(!lastOnlineTime){
            lastOnlineTime = TimeUtils.GetTimeBySecond()
        }

        let time = Math.min(3*60*60,Math.floor(currentOnlineTime-lastOnlineTime))
        cc.log("离线时间===>",time)
        this.offlineTime = time
    }

    /**获取离线时间 */
    getOffOnlineTime(){
        return this.offlineTime
    }

    onHandEneryChange(cmd: number, msg: NetData){
        cc.log("收到资产变化消息==========>",msg)
        if(!msg || !msg.expendEnergy || msg.expendEnergy == 0 || !msg.status){
            return
        }

        cc.log("扣除立刻刷新资产==============>")
        this.dealWalletMsg(msg)

        // if(
        //     msg.from == WalletChangeType.mail ||
        //     msg.from == WalletChangeType.redeem_code ||
        //     msg.from == WalletChangeType.game
        // ){
        //     //延迟刷新资产
        //     cc.log("延迟刷新资产==============>")
        //     this.walletDelayMsg.push(msg) 
        // }else{
        //     //扣除立刻刷新资产
        //     cc.log("扣除立刻刷新资产==============>")
        //     this.dealWalletMsg(msg)
        // }
    }

    updateWalletChange(){
        let msg = this.walletDelayMsg.pop()
        this.dealWalletMsg(msg)
    }

   dealWalletMsg(msg){
        if(msg.expendEnergy > 0){
            PlayerMgr.getInstance().getUserData().changeEnergy(-msg.expendEnergy)
        }else{
            PlayerMgr.getInstance().getUserData().changeEnergy(Math.abs(msg.expendEnergy))
        }
    }

    getUID(): string {
        return this.userData.data.uid;
    }

}
