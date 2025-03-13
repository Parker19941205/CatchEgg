import BaseUI from "../../../framework/base/BaseUI";

const { ccclass, property } = cc._decorator;
/**点击特效界面 */
@ccclass
export default class UITouch extends BaseUI {
    @property(cc.Node)
    touchNode: cc.Node = null;
    private touchNodes: cc.Node[] = []
    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            let node: cc.Node;
            if (this.touchNodes.length > 0) {
                node = this.touchNodes.pop()
                node.active = true;
                node.getComponent(cc.Animation).play();
            } else {
                node = cc.instantiate(this.touchNode)
                node.active = true;
                node.parent = this.node;
            }
            let pos = this.node.convertToNodeSpaceAR(event.getLocation())
            node.setPosition(pos)

            let duration = node.getComponent(cc.Animation).defaultClip.duration
            this.scheduleOnce(() => {
                node.active = false;
                this.touchNodes.push(node)
            }, duration)
        })
        this.node["_touchListener"].setSwallowTouches(false);
    }

}
  