import { BaseData } from "../../framework/base/BaseData";
import { GameConfig } from "../config/Config";
import { PlatformManager } from "../manager/PlatformManager";
import { PlayerMgr } from "../manager/PlayerMgr";

/** 事件配置结构体 */
export interface TrackEventConf {
    /**事件id */
    eventKey: string;
    /**参数值 */
    eventValue: string;
    /**仅统计一次 */
    onlyOne: boolean;
    /**说明 */
    info?: string;
    /**是否有前置事件条件 */
    condition?: string;
}
export enum TrackId {
    newuser_loading,
    newuser_entermain,
}

/**ui配置类 */
export let EventCF: { [key: number]: TrackEventConf } = {
    [TrackId.newuser_loading]: { eventKey: "newuser", eventValue: "开始加载", onlyOne: true, info: "开始加载" },
    [TrackId.newuser_entermain]: { eventKey: "newuser", eventValue: "进入主界面", onlyOne: true, info: "" },
}

class Data {
    /**默认userA */
    abName = "userA"
    vesionName:string="1.0.0"
}
export class TrackData extends BaseData {
    data: Data;
    gameKey: string = GameConfig.AppCacheName + "TrackData";
    private eventCF: { [key: number]: TrackEventConf } = {};
    public createData(): Data {
        this.data = new Data();
        return this.data;
    }
    initData(isCreatre: boolean) {
        this.eventCF = EventCF
    }
    /**
     * 数据统计
     * @param id TrackId
     * @param extens 是否有扩展 比如每一关的value都不同 eg:lv_start_x 
     */
    public youmengTrack(id: TrackId, extens?: any) {
        let cfg = this.eventCF[id]
        let needSend: boolean = true
        let value = cfg.eventValue
        if (extens) {
            value = value + extens;
        }
        if (cfg.condition) {
            if (!this.data[cfg.condition]) {
                //前置条件没有满足
                return;
            }
        }
        //判断是否有前置条件
        if (cfg.onlyOne) {
            if (this.data[value]) {
                needSend = false;
            }
            cc.log("是否新用户===========>",PlayerMgr.getInstance().isNewUser)
            if(!PlayerMgr.getInstance().isNewUser){
                needSend = false;
            }
        }
        cc.log("needSend===========>",needSend)
        if (needSend) {
            if (cfg.onlyOne) {
                this.data[value] = 1
                this.saveData();
            }
            //cc.log("统计====>",cfg.eventKey,value)
            PlatformManager.getInstance().youmengTrack(cfg.eventKey,value)
        }
    }
}