import { AudioMgr } from "./framework/manager/AudioMgr";
import { UIMgr } from "./framework/manager/UIMgr";
import { PhysicsHelper } from "./framework/utils/PhysicsHelper";
import { AudioId, EventName, GameConfig, UIID } from "./game/config/Config";
import { PlayerMgr } from "./game/manager/PlayerMgr";


const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {
    @property(cc.Node)
    root: cc.Node = null;
  
    onLoad(){
        cc.log("Main=========>onLoad",Date.now())
        PhysicsHelper.openCollision(false);
        PhysicsHelper.openPhysics(false);



        // 监听小程序的进入前台事件
        // cc.game.on(cc.game.EVENT_SHOW, function () {
        //     console.log("小程序进入前台");
        //     localStorage.setItem("lastOnlineTime",""+ 0)
        // });

        // 监听小程序的进入后台事件
        //cc.game.on(cc.game.EVENT_HIDE, function () {
            //let lastOnlineTime = TimeUtils.GetTimeBySecond(); // 获取当前在线时间戳
            //console.log("小程序进入后台",lastOnlineTime);
            //localStorage.setItem("lastOnlineTime",""+lastOnlineTime)
        //});
    }

    start() {
        //cc.log("进入time====>",Date.now())
        let time = Date.now()
        //初始uiMgr
        UIMgr.getInstance().Init(this.root)
        //点击动画
        UIMgr.getInstance().openUI(UIID.UITouch)
        //顶部界面
        UIMgr.getInstance().openUI(UIID.UITop)
        //网络加载界面
        UIMgr.getInstance().openUI(UIID.LoadingCicle)
        //屏蔽触摸层
        UIMgr.getInstance().openUI(UIID.UIMask)
        //设置按钮默认点击音效
        AudioMgr.getInstance().setButtonNomalAudio(AudioId.btnclick)
        
        //检测离线时间
        //PlayerMgr.getInstance().getOnlineTime()
        //开启计时器
        this.schedule(function(){
            PlayerMgr.getInstance().updateData()
        }, 1);
  
        UIMgr.getInstance().openUI(UIID.UIHome)
        //连接websocket
        // NetManager.getInstance().connect({url: GameConfig.socketUrl},0,()=>{
        //     cc.log("WebSocket连接成功,进入界面")
        //     //如果有登陆口令直接登陆
        //     let command = PlayerMgr.getInstance().getGameData().getCommand()
        //     if(command != ""){
        //         let data = {
        //             "mark":GAME_MSG_TYPE.login,
        //             phone:"",
        //             command: command,
        //         }
        //         cc.log("登录data======>",data)
        //         let callbackObject:CallbackObject = {target:this,callback:(cmd: number, resqData: any)=>{
        //             cc.log("登录resq======>",resqData)
        //             if(!resqData.status){
        //                 UIMgr.getInstance().showTips(resqData.tip)
        //                 PlayerMgr.getInstance().getGameData().clearAllData()
        //                 UIMgr.getInstance().openUI(UIID.LoginUI)
        //                 return
        //             }

        //             PlayerMgr.getInstance().getUserData().setUserData(resqData) 
        //             if(resqData.gender == -1){
        //                 UIMgr.getInstance().openUI(UIID.SexSelect)
        //             }else{
        //                 UIMgr.getInstance().openUI(UIID.UIHome)
        //             }
        //         }}
        //         NetManager.getInstance().request(data,callbackObject)
        //     }else{
        //         //进入登陆界面
        //         UIMgr.getInstance().openUI(UIID.LoginUI)
        //     }
        // })


    }


}
