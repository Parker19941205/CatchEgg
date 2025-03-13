import BaseUI from "../../../framework/base/BaseUI";
import { EventName } from "../../config/Config";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMask extends BaseUI {

    protected onLoad() {
        this.node.active = false
        this.addEvent(EventName.RefreshMaskShow, this.showMask)
    }

    public showMask(show: boolean = false) {
        this.node.active = show
    }
    

}
