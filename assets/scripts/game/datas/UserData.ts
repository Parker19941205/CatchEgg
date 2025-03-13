import { BaseData } from "../../framework/base/BaseData"
import { EventMgr } from "../../framework/manager/EventMgr";
import { UIMgr } from "../../framework/manager/UIMgr";
import { TimeUtils } from "../../framework/utils/TimeUtils";
import { EventName, GameConfig } from "../config/Config"
import { CopperType } from "../config/GameEnum";

class Data {
    /**玩家uid */
    uid: string = "";
    /**昵称 */
    nickname: string = "";
    /**手机号 */
    phone:string = "";
    /**头像 */
    avatar:string = "";
    /**性别 0为女；1为男；-1未选性别*/
    gender: number = -1;
    /**个性签名 */
    signature: string = "";
    /**地址 */
    address: string = "";
    /**玩家身份 0为玩家；1为商家 */
    identity: number = 0;
    /**微信号 */
    wx: string = "";
    /**能量值 */
    energy: number = 0;
    /**登录口令 */
    command: string = "";
    /**好友列表 */
    friends: Array<any> = [];
}

export class UserData extends BaseData {
    data: Data;
    gameKey: string = GameConfig.AppCacheName + "USER_DATA"
    curChatId: string = "";

    /**没有数据时候 执行 */
    public createData(): Data {
        this.data = new Data();
        cc.log("加载用户数据===========>",this.data)
        return this.data;
    };
  

    initData() {
    }

    setUserData(data){
        this.data.uid = data.uid;
        this.data.nickname = data.nickname;
        this.data.phone = data.phone;
        this.data.avatar = data.avatar
        this.data.gender = data.gender
        this.data.signature = data.signature
        this.data.address = data.address
        this.data.identity = data.identity
        this.data.wx = data.wx
        this.data.energy = data.energy
        this.data.command = data.command
    }

    updateGender(gender:number){
        this.data.gender = gender;
    }

    updateAvatar(avatar:string){
        this.data.avatar = avatar;
    }

    /**
     * 更新能量值
     * @param num 正数增加，负数减少
     * */
    changeEnergy(num:number){
        if(num > 0){
            this.data.energy += num;
            UIMgr.getInstance().showTips("获得能量+"+num)
            EventMgr.getInstance().emit(EventName.FlyCurrency, num)
        }else{
            this.data.energy -= Math.abs(num);
            UIMgr.getInstance().showTips("消耗能量-"+Math.abs(num))
            EventMgr.getInstance().emit(EventName.RefreshEenergy,num)
        }
    }

    /**
     * 切换身份
     * @param
     * */
    changeIdentity(identity:number){
        this.data.identity = identity
        EventMgr.getInstance().emit(EventName.RefreshUserInfo)
    }

    setFriendData(data:Array<any>){
        this.data.friends = data
    }

    setCurChatId(uid:string){
        this.curChatId = uid
    }

    getCurChatId(){
        return this.curChatId
    }
}
