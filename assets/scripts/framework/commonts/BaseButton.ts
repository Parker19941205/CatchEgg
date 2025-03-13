import { AudioMgr } from '../manager/AudioMgr';
const { ccclass, property } = cc._decorator;

@ccclass
export class BaseButton extends cc.Button {
    @property
    invertTime: number = 1;
    private touched: boolean = false;
    private touchmil: number = 0;
    _onTouchBegan(event) {
        if (!this.interactable || !this.enabledInHierarchy) return;
        if (this.touched) {
            this.node.pauseSystemEvents(true)
            this["_resetState"]();
            return;
        }
        AudioMgr.getInstance().playAudioButtonClicked();
        this.touched = true;
        this.touchmil = 0;
        super["_onTouchBegan"](event)
    }
    _onTouchEnded(event) {
        super["_onTouchEnded"](event)
    }
    update(dt) {
        //触摸计时
        super.update(dt)
        if (this.touched) {
            //防止这个数加的很大
            this.touchmil = this.touchmil + dt;
            if (this.touchmil > this.invertTime) {
                this.touchmil = 0
                this.touched = false;
                this.node.resumeSystemEvents(true)
            }
        }
    }
    onDestroy() {
        this.touched = false;
    }
    onDisable() {
        super.onDisable()
        this.touched = false;
    }
    onEnable() {
        super.onEnable()
        this.touched = false;
    }

        
    
}


