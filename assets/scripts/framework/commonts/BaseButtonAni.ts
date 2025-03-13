import { AudioMgr } from "../manager/AudioMgr";
import { TimeUtils } from "../utils/TimeUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export class BaseButtonAni extends cc.Component {

    @property({
        tooltip: CC_DEV && '动画名称',
    })
    private aniName:string = "";    

    @property({
        tooltip: CC_DEV && '是否播放load动画',
    })
    private noLoad:boolean = false;   

    @property({
        tooltip: CC_DEV && '是否禁止点击',
    })
    private noClick:boolean = false; 

    @property({
        tooltip: CC_DEV && '动画延迟播放时间',
    })
    private delayTime:number = 0.5; 

    @property({
        tooltip: CC_DEV && '按钮延迟时间',
    })
    private invertTime:number = 1; 

    @property({
        type: cc.Component.EventHandler,
        tooltip: CC_DEV && '点击事件',
    })
    public clickEvent: cc.Component.EventHandler = new cc.Component.EventHandler();


    private animationState: dragonBones.AnimationState;
    private clickTime :number = 0
    private touched: boolean = false;
    private touchmil: number = 0;

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
 
        if(!this.noLoad){
            this.scheduleOnce(()=>{
                let aniNode: dragonBones.ArmatureDisplay = this.node.getComponent(dragonBones.ArmatureDisplay);
                aniNode.playAnimation(this.aniName != "" ? this.aniName : "newAnimation2",1)
            },this.delayTime)
        }
    }
        
    onDestroy() {
        this.touched = false;
    }
    onDisable() {
        this.touched = false;
    }
    onEnable() {
        this.touched = false;
    }

    update(dt) {
        //触摸计时
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

    onTouchStart(event){
        if(this.noClick) return

        if (this.touched) {
            this.node.pauseSystemEvents(true)
            return;
        }

        AudioMgr.getInstance().playAudioButtonClicked();
        this.touched = true;
        this.touchmil = 0;
        this.clickTime = TimeUtils.GetTimeBySecond()
        let aniNode: dragonBones.ArmatureDisplay = this.node.getComponent(dragonBones.ArmatureDisplay);
        this.animationState = aniNode.playAnimation("newAnimation",1)

        cc.tween(this.node).delay(0.17).call(()=>{
            this.animationState.stop()
            //this.animationState.timeScale = -1; // 设置动画倒放
        }).start()
    }

    onTouchMove(event){
        if(this.noClick) return
    }

    onTouchEnd(event){
        if(this.noClick) return
        this.resetAni()
    }

    onTouchCancel(event){
        if(this.noClick) return
        this.resetAni()
    }

    resetAni(){
        if(!this.animationState) return
        this.animationState.play()
        let currentTime = this.animationState.currentTime

        this.node.stopAllActions()
        cc.tween(this.node).delay(currentTime).call(()=>{
            if (this.clickEvent) {
                cc.Component.EventHandler.emitEvents([this.clickEvent]);
            }
        }).start()

   
    }


}


