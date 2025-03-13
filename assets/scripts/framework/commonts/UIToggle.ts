// import EntityLogic from "../../../script/framework/entity/EntityLogic";

const { ccclass, property,menu,disallowMultiple} = cc._decorator;

@ccclass("VisibleNode")
export class VisibleNode {
    @property({ displayName: "名称" })
    public name = ""

    @property({ type: cc.SpriteFrame, displayName: "精灵帧" })
    public frame: cc.SpriteFrame = null;
}

@ccclass
@disallowMultiple()
@menu('自定义组件/UIToggle')
export default class UIToggle extends cc.Component {

    @property([cc.SpriteFrame])
    Frams: cc.SpriteFrame[] = [];

    @property([cc.Node])
    attach: cc.Node[] = [];

    @property([cc.Component.EventHandler])
    clickEvents: cc.Component.EventHandler[] = [];

    @property({ type: [VisibleNode], displayName: "图片选择器" })
    nodes: VisibleNode[] = []

    private index: number = 0;

    onLoad() {
        if (this.clickEvents.length > 0) {
            this.registerTouch();
        }
    }
    registerTouch() {
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouch, this);
    }

    getNum() {
        return this.Frams.length;
    }

    _onTouch(event) {
        if (this.clickEvents.length == 0)
            return;

        this.index++;
        event.toggle = this;
        this.setToggle(this.index);

        cc.Component.EventHandler.emitEvents(this.clickEvents, event);
    }
    setToggle(index: number): void {
        this.index = index % this.Frams.length;
        this.node.getComponent(cc.Sprite).spriteFrame = this.Frams[this.index];
        if (this.attach.length > this.index) {
            for (var i = 0; i < this.attach.length; i++) {
                this.attach[i].active = this.index == i;
            }
        }
    }
    getIndex(): number {
        return this.index;
    }

    setName(name: string): void {
       for(var i=0;i<this.nodes.length;i++){
            if(name == this.nodes[i].name){
                this.node.getComponent(cc.Sprite).spriteFrame = this.nodes[i].frame
                break
            }
       }
    }
}
