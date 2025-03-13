import { LogMgr } from "../../framework/manager/LogMgr";
import { CacheUtils } from "../../framework/utils/CacheUtils";
import { GameConfig } from "../../game/config/Config";



/**用户数据的基类 */
export abstract class BaseData {
    protected abstract data: any;
    protected abstract gameKey: string
    protected pwd: string = "NTPLAY"
    public constructor() {

    }
    /**获取存储的数据 */
    public getData(): any {
        if (this.data == null) {
            let json: string = null;
            if (GameConfig.ecrypt) {
                json = CacheUtils.getDataDecrypt(this.gameKey, this.pwd);
            } else {
                json = CacheUtils.getData(this.gameKey);
            }
            if (json) {
                this.data = JSON.parse(json)
                this.initData(false);
            } else {
                this.data = this.createData();
                this.initData(true);
            }
        }
        return this.data;
    }
    /**创建新的用户数据 由子类实现 */
    public abstract createData();
    /**开始初始数据 */
    public initData(isCreate: boolean) { }
    /**保存数据 */
    protected saveData() {
        let json = JSON.stringify(this.data);
        if (GameConfig.ecrypt) {
            CacheUtils.saveDataEncrypt(this.gameKey, json, this.pwd);
        } else {
            CacheUtils.saveData(this.gameKey, json);
        }
    }
}