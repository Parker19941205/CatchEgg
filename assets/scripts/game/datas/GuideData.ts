import { BaseData } from "../../framework/base/BaseData";
import { GameConfig } from "../../game/config/Config";



class Data {
    currentId: number = 1;
}
export class GuideData extends BaseData {
    protected ecrypt: boolean = false;
    data: Data;
    gameKey: string = GameConfig.AppCacheName + "GUIDE";
    /**必须比结束的id多1 */
    endId: number = 15;
    public createData(): Data {
        this.data = new Data();
        return this.data;
    }
    public getCurrentId(): number {
        return this.data.currentId;
    }
    /**
     * 增加引导id 
     * @param isRecode 是否需要记录 默认记录到数据库
     */
    public addCurrentId(isRecode: boolean = true) {
        cc.log("addCurrentId", this.data.currentId)
        this.data.currentId += 1;
        if (isRecode) {
            this.saveData();
        }
    }

    /**新手引导是否已经完成 */
    public getGuideEnd(): boolean {
        if (this.data.currentId >= this.endId) {
            return true;
        }
        return false;
    }

    /**结束新手引导 */
    public endGuide(){
        console.log("新手引导结束");
        this.data.currentId = this.endId
        this.saveData();
    }

    /**初始化引导 */
    public startGuide(){
        this.data.currentId = 1
        this.saveData();
    }
}