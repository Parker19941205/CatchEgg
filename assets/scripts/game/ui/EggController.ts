import BaseUI from "../../framework/base/BaseUI";
import UIToggle from "../../framework/commonts/UIToggle";
import { Utils } from "../../framework/utils/Utils";
import UIHome from "./UIHome";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EggController extends BaseUI {
    @property(cc.Label)
    numLabel: cc.Label = null;

    private rigidBody: cc.RigidBody = null;
    private delegate:UIHome = null;
    private circleCollider: cc.PhysicsCircleCollider = null;
    private isDrop:boolean = false;

    onLoad() {
        this.rigidBody = this.node.getComponent(cc.RigidBody);
        this.circleCollider = this.node.getComponent(cc.PhysicsCircleCollider);
    }

    start() { 
    }

    // 初始化小球
    initBall(delegate){
        this.delegate = delegate
        this.node.setPosition(-200,cc.winSize.height/2 - 200)
        this.applyForcey()
    }


    //施加力
    applyForcey(){
        cc.log("施加力",this.node.height)
        let force = cc.v2(0, -100)
        this.rigidBody.gravityScale = 0
        this.rigidBody.linearVelocity = force;  // 给小球施加向上的冲击力
        this.rigidBody.node.attr({force:force})
    }

    update(dt) {
    }

    // 只在两个碰撞体开始接触时被调用一次
    onBeginContact(contact,selfCollider,otherCollider){
        cc.log("两个碰撞体开始接触",selfCollider.node,otherCollider.node)
        let selfNode:cc.Node = selfCollider.node
        let otherNode:cc.Node = otherCollider.node
        let selfIndex = selfNode["index"]
        let otherIndex = otherNode["index"]
        this.isDrop = false
        if (selfNode === this.node && !this.delegate.isEggInCrack) {
            cc.log("鸡蛋碰撞到了自己")
            this.delegate.onEggEnterCrack()
        }
    }

    // 只在两个碰撞体结束接触时被调用一次
    onEndContact (contact, selfCollider, otherCollider) {
        //cc.log("两个碰撞体结束接触")
    }

    // 每次将要处理碰撞体接触逻辑时被调用
    onPreSolve (contact, selfCollider, otherCollider) {
        //cc.log("onPreSolve=======>")
    }

    // 每次处理完碰撞体接触逻辑时被调用
    onPostSolve(contact, selfCollider, otherCollider) {
        //cc.log("onPostSolve======>")
    }
}
