import BaseUI from "../../framework/base/BaseUI";
import UIToggle from "../../framework/commonts/UIToggle";
import BallController from "./BallController";


const { ccclass, property } = cc._decorator;

enum PropType{
    /**球 */
    Ball = 1,
    /*交换 */
    Swap = 2,
    /*锤子 */
    Hammer = 3,
    /**闪电 */
    Lightning = 4
}

/**主界面 */
@ccclass
export default class UIHome extends BaseUI {
    @property(cc.Node)
    ball: cc.Node = null;
    @property(cc.Node)
    root: cc.Node = null;
    @property(cc.PhysicsBoxCollider)
    ground: cc.PhysicsBoxCollider = null;
    @property(cc.PhysicsBoxCollider)
    top: cc.PhysicsBoxCollider = null;
    @property(cc.PhysicsBoxCollider)
    wallleft: cc.PhysicsBoxCollider = null;
    @property(cc.PhysicsBoxCollider)
    wallright: cc.PhysicsBoxCollider = null;
    @property(cc.ToggleContainer)
    toggleContainer: cc.ToggleContainer = null;

    private curBall: cc.Node = null;
    private isMoveing: boolean = false;
    public isMixing = false;  // 标志位是否正在合成
    private tag:number = 0
    private allBallList:cc.Node[] = [];
    private curPropType:PropType = null

    onLoad(){
        console.log("UIHome:onLoad")
        // 监听触摸事件
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    onToggleHide(){
        console.log("UIHome:onToggleHide")
    }

    onToggleShow(){
        console.log("UIHome:onToggleShow")

    }

    onDestroy(){
        super.onDestroy()
    }

    start(){
        console.log("UIHome:start")
        this.scheduleOnce(()=>{
            this.wallleft.enabled = false
            this.wallright.enabled = false
            this.ground.size.width = cc.winSize.width
            this.top.size.width = cc.winSize.width
            this.wallleft.size.height = cc.winSize.height
            this.wallleft.offset.y = cc.winSize.height / 2
            this.wallright.size.height = cc.winSize.height
            this.wallright.offset.y = cc.winSize.height / 2
            this.wallleft.enabled = true
            this.wallright.enabled = true
        })

        let index = 0
        this.toggleContainer.toggleItems.forEach((toggle:cc.Toggle)=>{
            index += 1
            toggle.node.attr({index:index})
        })
    }

    onAddBtn(){
        let ball = cc.instantiate(this.ball)
        this.root.addChild(ball)
        ball.getComponent(BallController).initBall(this)

        this.curBall = ball
        this.allBallList.push(ball)
     }

    onTouchStart(){
        this.isMoveing = false
    }

    onTouchMove(event:cc.Event.EventTouch){
        cc.log("onTouchMove")
        if(!this.curBall){
            return
        }

        // 获取触摸点的位置
        let touchLoc = event.getLocation();
        let deltaX = event.getDeltaX();
        if(deltaX > 1 || deltaX < -1){
            this.isMoveing= true
        }
        //console.log("touchLoc",deltaX)

        // 获取屏幕宽度，限制小球在屏幕内移动
        let screenWidth = cc.winSize.width;
        let ballRadius = this.curBall.width / 2;
    
        this.curBall.x += deltaX;
        this.curBall.x = cc.misc.clampf(this.curBall.x, -screenWidth/2 + ballRadius, screenWidth/2 - ballRadius);
    }

    onTouchEnd(event:cc.Event.EventTouch){
        if(!this.curBall){
            return
        }

        // 直接点击就在触摸点的位置落下
        if(!this.isMoveing){
            let screenWidth = cc.winSize.width;
            let ballRadius = this.curBall.width / 2;
            let pos = this.node.convertToNodeSpaceAR(event.getLocation())
            this.curBall.x = pos.x;
            this.curBall.x = cc.misc.clampf(this.curBall.x, -screenWidth/2 + ballRadius, screenWidth/2 - ballRadius);
        }
        this.dropBall()

        this.scheduleOnce(()=>{
            this.onAddBtn()
        },1)
    }

    onTouchCancel(){
        if(!this.curBall){
            return
        }
        this.dropBall()
    }
    
    createNewBall(position,index){
        let ball = cc.instantiate(this.ball)
        this.root.addChild(ball)
        this.allBallList.push(ball)
        ball.getComponent(BallController).createNewBall(this,position,index)
    }

    onCheckEvent(toggle:cc.Toggle){
        cc.log("onCheckEvent",toggle.node["index"])
        let index = toggle.node["index"]
        if(index == PropType.Ball){

        }else if(index == PropType.Hammer){
            this.onUseHammer()
        }
        this.curPropType = index
    }

    dropBall(){
        if(this.curPropType == PropType.Hammer){
        }else{
        }
        this.curBall.getComponent(BallController).dropBall()
        this.isMoveing = false
        this.curBall = null
    }
    
    onUseHammer(){
        cc.log("onUseHammer")
        for(let i = 0;i < this.allBallList.length;i++){
            let ball = this.allBallList[i]
            if(ball !== this.curBall){
                ball.getComponent(BallController).applyForcey()
            }
        }
    }

    // 删除小球
    removeBall(removeball:cc.Node){
        for(let i =  this.allBallList.length-1;i >= 0;i--){
            let ball = this.allBallList[i]
            if(ball == removeball){
                cc.log("removeBall")
                removeball.removeFromParent(true)
                this.allBallList.splice(i,1)
            }
        }
    }

}
