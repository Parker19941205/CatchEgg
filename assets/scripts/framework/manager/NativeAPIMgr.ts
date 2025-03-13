import { EventName } from "../../game/config/Config";
import { EventMgr } from "./EventMgr";
import { UIMgr } from "./UIMgr";

export class NativeAPIMgr{
  private static _inst:NativeAPIMgr;
  
  public static get inst():NativeAPIMgr{
    cc.log('NativeAPIMgr.inst')
    if(!this._inst){
      this._inst = new NativeAPIMgr();
    }
    return this._inst;
  }

  public static callByNative(value){
      cc.log("callByNative",value)
      //to do
      EventMgr.getInstance().emit(EventName.RefreshScanResult)
  }
}

//将 NativeAPIMgr 注册为全局类，否则无法在 Java 中被调用
window["NativeAPIMgr"] = NativeAPIMgr;