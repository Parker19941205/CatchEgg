import { BaseData } from "../../framework/base/BaseData";
import { EventMgr } from "../../framework/manager/EventMgr";
import { TimeUtils } from "../../framework/utils/TimeUtils";
import { EventName, GameConfig } from "../config/Config";
import { PlayerMgr } from "../manager/PlayerMgr";
import { EventCF, TrackId } from "./TrackData";


export enum SignTypeEnum {
    /**普通签到 */
    Normal,
    /**视频签到 */
    Video
}

export interface SignDayData {
    /**签到天数 */
    day:number,
     /**签到类型 */
    // signType:SignTypeEnum
    /**虚弱层数 */
    layer:number
}

class Data {
    /**最后一次签到的时间 */
    lastSignTime: number = -1;
    /**已经签到的天数 */
    alredyIdx: SignDayData[]
    firstLoginTime: number = -1;
    firstLoginDayTime: number = -1
}

export class SignData extends BaseData {
    protected ecrypt: boolean = false;
    data: Data;
    gameKey: string = "FIGHT_USER_SIGN";
    /**当前签第几天 */
    curentDay: number = 1;
    public createData(): Data {
        this.data = new Data();
        this.data.firstLoginTime = TimeUtils.GetTimeBySecond();
        this.data.firstLoginDayTime = TimeUtils.dayStart();
        this.data.alredyIdx = []
        
        this.curentDay = 1;
        this.saveData();
        return this.data
    }
    initData(isNew: boolean) {
        //判断当前登录的是第几天
        if (!isNew) {
            let day = TimeUtils.overDay(this.data.firstLoginDayTime)
            if (day <= 0) {
                day = 0;
            }
            this.curentDay = day + 1;
            cc.log("当前可以签到天",this.curentDay)
        }
    }
    /**获取当前可以签到第几天的 */
    public getCurentDay(): number {
        return this.curentDay;
    }
    /**获取已经签到的 */
    public getAlredySign(): SignDayData[] {
        return this.data.alredyIdx;
    }
    /**是否已经签到了 */
    public checkIsSigned(id: number): SignDayData {
        for (let i = 0; i < this.data.alredyIdx.length; i++) {
            let data = this.data.alredyIdx[i]
            if (id == data.day) {
                return data;
            }
        }
        return null;
    }
    /**判断是否需要补签 前提没有签到的 */
    public checkReissue(id: number): boolean {
        if (id < this.curentDay) {
            return true;
        }
        return false;
    }
    /**是否可以签到 */
    public checkCanSign(id: number): boolean {
        return id == this.curentDay;
    }
    /**开始签到 */
    public startSign(day: number,layer: number) {
        let signed = this.checkIsSigned(day)
        if(!signed){
            let data = {day:day,layer:layer}
            this.data.alredyIdx.push(data)
            this.data.lastSignTime = TimeUtils.GetTimeBySecond();
        }else{
            signed.layer += layer
        }

        this.saveData();
        EventMgr.getInstance().emit(EventName.RefreshBaseInfo)
        EventMgr.getInstance().emit(EventName.RefreshSignRed)
        

        let alllayer = this.getSignLayer()
        EventCF[TrackId.sign_in].eventValue =  this.data.alredyIdx.length + "-" + alllayer
        PlayerMgr.getInstance().getTrackData().youmengTrack(TrackId.sign_in)
    }


    /**获取所有签到层数 */
    public getSignLayer() {
        let layer = 0
        for (let i = 0; i < this.data.alredyIdx.length; i++) {
            layer = layer + this.data.alredyIdx[i].layer
        }
        return layer
    }


    /**判断今天是否可以签到 */
    public checkTodyCanSign(): boolean {
        // if (this.data.alredyIdx.length >= 7) {
        //     return false;
        // }
        let cansign: boolean = false;
        // //判断是否有补签
        // for (let i = 1; i < this.curentDay; i++) {
        //     let signed = this.checkIsSigned(i)
        //     if (!signed) {
        //         cc.log("有补签=========>")
        //         return true;
        //     }
        // }
        //cc.log("lastSignTime====>",this.data.lastSignTime)
        //判断今天是否已经签到了
        if (this.data.lastSignTime > 10 && TimeUtils.compareIsToday(this.data.lastSignTime)) {
            //签到的是否是今天
            for (let i = 0; i < this.data.alredyIdx.length; i++) {
                if (this.curentDay == this.data.alredyIdx[i].day) {
                    return false;
                }
            }
            return true;
        }
        cansign = this.checkCanSign(this.curentDay)
        //cc.log("cansign====>",cansign)
        return cansign;
    }
    /**当前是否在显示红点 */
    private redshowing: boolean = false;
    private canSign: boolean = false;

    /**判断是否可以签到 */
    public getCanSigned(): boolean {
        return this.canSign;
    }

    /**判断今天是否视频签到 */
    public checkTodayIsVideo(): boolean {
        let data = this.checkIsSigned(this.curentDay)
        return data && data.layer > 1
    }
}