import { BaseEventName, LoadingProcess } from "../../framework/configs/Appcfg";
import { EventMgr } from "../../framework/manager/EventMgr";
import { LogMgr } from "../../framework/manager/LogMgr";
import { ResourceMgr } from "../../framework/manager/ResourceMgr";
import { Utils } from "../../framework/utils/Utils";
import { EventName } from "../config/Config";
import { GameData, LevelDataCfg } from "../config/GameTsCfg";



export class DataMgr {
    private static instance: DataMgr;
    private constructor() { }
    public static getInstance(): DataMgr {
        if (this.instance == null) {
            this.instance = new DataMgr();
        }
        return this.instance;
    }


    private data: LevelDataCfg[];
    /**加载 */
    public preload() {
        // ResourceMgr.getInstance().loadFromRes("configs/LevelDataCfg", (res: cc.JsonAsset) => {
        //     this.data = res.json as LevelDataCfg[];
        //     res.decRef();
        //     EventMgr.getInstance().emit(BaseEventName.Loading, LoadingProcess.ExcelCfg)
        //     LogMgr.getInstance().debug("游戏配置表数据========>",this.data)

        // })
        EventMgr.getInstance().emit(BaseEventName.Loading, LoadingProcess.ExcelCfg)
    }

    
    public getAllLevelDataCfg(): LevelDataCfg[] {
        return this.data;
    }

    public getLevelDataCfg(level:number, map_type:string): LevelDataCfg {
        let cfg = this.getAllLevelDataCfg()
        for(var i=0;i<cfg.length;i++){
            if(cfg[i].level == level && cfg[i].map_type == map_type){
                return cfg[i]
            }
        }
        return null
    }
}