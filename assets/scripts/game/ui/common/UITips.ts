import BaseUI from "../../../framework/base/BaseUI";

const { ccclass, property } = cc._decorator;
/**土司界面 */
@ccclass
export default class TipUI extends BaseUI {
    @property({ type: cc.Node, tooltip: "layout节点" })
    tipsNode: cc.Node = null;
    @property({ type: cc.Label, tooltip: "文字" })
    tips: cc.Label = null;

    private tweenAction: cc.Tween<cc.Node>
    onLoad() {
        this.tweenAction = cc.tween(this.tipsNode)
            .to(0.2, { scaleY: 1 })
            .delay(1)
            .by(2, { position: new cc.Vec3(0, 100) })
            .call(() => {
                this.closeUI();
            })
    }
    init(str: string) {
        this.tweenAction.stop();
        this.tipsNode.setPosition(0, 0)
        this.tipsNode.scaleY = 0;
        this.tips.string = str;
        this.tweenAction.start();
    }
}