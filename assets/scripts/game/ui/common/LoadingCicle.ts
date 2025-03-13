import BaseUI from "../../../framework/base/BaseUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadingCicle extends BaseUI {

    @property(cc.SpriteAtlas)
    loadingAtlas: cc.SpriteAtlas = null;
    @property(cc.Sprite)
    sp: cc.Sprite = null;
    @property(cc.Label)
    text: cc.Label = null;


    animation: cc.Animation;

    protected onLoad() {
        this.animation = this.sp.node.getComponent(cc.Animation);
        this.creatorAnimation("loadingCicle_sp");
        this.node.active = false
    }

    protected creatorAnimation(name) {
        let spArray = [];
        for (let i = 1; i < 5; i++) {
            spArray.push(this.loadingAtlas.getSpriteFrame("loading0_" + i));
        }
        let clip = cc.AnimationClip.createWithSpriteFrames(spArray, spArray.length);
        clip.wrapMode = cc.WrapMode.Loop;
        clip.name = name;
        this.animation.addClip(clip);
    }

    public show(text: string = "网络异常,正在重新连接") {
        this.node.active = true
        this.text.string = text;
        this.animation.play("loadingCicle_sp");
    }

    public hide() {
        this.node.active = false
        if (this.animation)
            this.animation.stop("loadingCicle_sp");
    }
    




}
