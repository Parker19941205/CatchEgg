import BaseUI from "../../framework/base/BaseUI";
import UIToggle from "../../framework/commonts/UIToggle";
import EggController from "./EggController";


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
    egg: cc.Node = null;
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
    @property(cc.Node)
    crackLine: cc.Node = null;

    private curEgg: cc.Node = null;
    private isMoveing: boolean = false;
    private tag:number = 0
    private startPos:cc.Vec2 = null
    private endPos:cc.Vec2 = null
    private crackPos:cc.Vec2 = null
    public isEggInCrack:boolean = false;
    private crackAngle:number = 0; //裂缝角度
    private isScondCrack: boolean = false; // 是否第二次裂缝
    private isEggOut: boolean = false; // 鸡蛋是否从裂缝出来
    private entryRelativeAngle: number = 0; // 鸡蛋进入裂缝时与裂缝水平方向的夹角
    private crackLineNum: number = 0; // 裂缝数量
    private crackLineNodes: cc.Node[] = [];

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


        // let angle = this.calculateEntryRelativeAngle(cc.v2(200, -100))
        // cc.log("angle===>",angle)
    }

    // 计算鸡蛋进入裂缝时与裂缝水平方向的夹角
    calculateEntryRelativeAngle(): number {
        let eggVelocity = this.curEgg["force"] // 鸡蛋的速度方向
        let crackAngle = this.crackLineNodes[0].angle // 第一道裂缝的角度

        // 计算鸡蛋的运动角度（从水平方向算起）
        const eggAngle = cc.misc.radiansToDegrees(Math.atan2(eggVelocity.y, eggVelocity.x));
        cc.log("鸡蛋运动的角度===>",eggAngle)
        cc.log("第一道裂缝的角度===>",crackAngle)

        // 将负角度转换为正角度
        //const positiveEggAngle = (eggAngle + 360) % 360;
        // 计算相对夹角
        const relativeAngle = eggAngle + crackAngle;

        // 规范化角度到 [0, 180] 范围内
        //return Math.abs(relativeAngle) % 180;
        // 规范化角度到 [-180, 180] 范围内
        return ((relativeAngle + 180) % 360) - 180;
    }

    onAddBtn(){
        this.isEggInCrack = false
        this.isScondCrack = false
        let egg = cc.instantiate(this.egg)
        this.root.addChild(egg)
        this.curEgg = egg
        egg.getComponent(EggController).initBall(this)
     }

    onTouchStart(event:cc.Event.EventTouch){
        let pos = event.getLocation();
        this.startPos = pos;
    }

    onTouchMove(event:cc.Event.EventTouch){
        cc.log("onTouchMove")
    }

    onTouchEnd(event:cc.Event.EventTouch){
        this.endPos = event.getLocation();
        this.showLine()
    }

    onTouchCancel(){
    }
    
    // 显示裂缝
    showLine(){
        let midX = (this.startPos.x + this.endPos.x) / 2;
        let midY = (this.startPos.y + this.endPos.y) / 2;
        let localPos = this.root.convertToNodeSpaceAR(cc.v2(midX, midY));

        let crackLine = cc.instantiate(this.crackLine)
        this.root.addChild(crackLine)
        this.crackLine = crackLine
        this.crackLine.setPosition(localPos);
        this.crackLine.active = true
        //this.crackPos = localPos; // 记录裂缝位置
        this.crackLineNodes.push(crackLine);

        let angle = this.calculateRotation(this.startPos, this.endPos);
        let distance = this.calculateDistance(this.startPos, this.endPos);
        this.crackAngle = angle; // 记录裂缝角度

        cc.log("angle",angle)
        cc.log("distance",distance)
        crackLine.angle = angle;

        //let width = Math.min(distance,this.crackLine.width)
        let width = cc.misc.clampf(distance, 200, this.crackLine.width);
        //width = 200
        let targetScale = width / this.crackLine.width;
        crackLine.scaleX = targetScale
        crackLine.scaleY = 0
        this.crackLineNum += 1;

        cc.tween(crackLine).to(0.5, { scaleY: targetScale}).call(() => {           
        }).start();
    }

    // 计算旋转角度（调整方向）
    calculateRotation(start: cc.Vec2, end: cc.Vec2): number {
        const deltaX = end.x - start.x;
        const deltaY = end.y - start.y;
        //cc.log("deltaX",deltaX,"deltaY",deltaY)
        const radians = Math.atan2(deltaY, deltaX);
        cc.log("radians",radians)
        return cc.misc.radiansToDegrees(radians);
    }

    // 计算两点之间的距离
    calculateDistance(start: cc.Vec2, end: cc.Vec2): number {
        const deltaX = end.x - start.x;
        const deltaY = end.y - start.y;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY); // 欧几里得距离公式
    }

    // 鸡蛋进入裂缝时的逻辑
    onEggEnterCrack() {
        this.isEggInCrack = true;
        cc.log("鸡蛋进入裂缝");
        // 隐藏裂缝
        // cc.tween(this.crackLine).to(0.5, { scaleY: 0}).call(() => {
        //     this.crackLine.active = false
        //     this.isScondCrack = true
        // }).start();
        this.isScondCrack = true

        // 计算并记录鸡蛋进入裂缝时与裂缝水平方向的夹角
        this.entryRelativeAngle = this.calculateEntryRelativeAngle();
        cc.log("鸡蛋与裂缝的夹角:", this.entryRelativeAngle);

        // 记录鸡蛋的位置和速度
        const eggRigidBody = this.curEgg.getComponent(cc.RigidBody);
        eggRigidBody.linearVelocity = cc.Vec2.ZERO; // 停止鸡蛋
        //this.curEgg.active = false;

        // 节点坐标转换
        const eggPos = this.curEgg.convertToWorldSpaceAR(cc.Vec2.ZERO);
        this.crackPos = this.crackLineNodes[0].convertToNodeSpaceAR(eggPos);
        //cc.log("鸡蛋进入裂缝的位置",this.crackPos,eggPos);

        this.launchEggFromCrack()
    }

    // 鸡蛋从裂缝出来时的逻辑
    launchEggFromCrack() {
        cc.log("鸡蛋从裂缝出来");
        cc.log("第二道裂缝的角度",this.crackLineNodes[1].angle);
        let curEgg = cc.instantiate(this.egg)
        let collider = curEgg.getComponent(cc.PhysicsPolygonCollider);
        collider.enabled = false
        //this.isEggInCrack = false;
        // 将鸡蛋移动到第二个裂缝的位置
        curEgg.setPosition(this.crackPos);
        let targetScale =  this.crackLineNodes[1].scaleX;
        curEgg.scale = 0.5/targetScale;
        this.crackLineNodes[1].addChild(curEgg);
        this.isEggOut = true;
    }

    update(dt: number){
        if(!this.isEggOut){
            return
        }

        let curEgg = this.crackLineNodes[1].children[0]
        // 根据进入时的角度和位置，弹射鸡蛋
        let launchAngle = -this.entryRelativeAngle // 相反方向
        cc.log("鸡蛋从裂缝出来的角度",launchAngle);
        const direction = cc.v2(
            Math.cos(cc.misc.degreesToRadians(launchAngle)),
            Math.sin(cc.misc.degreesToRadians(launchAngle))
        );
        curEgg.x += direction.x * dt * 100;
        curEgg.y += direction.y * dt * 100;
    }
}
