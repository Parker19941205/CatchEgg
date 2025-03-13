import BaseUI from "../../framework/base/BaseUI";
import UIToggle from "../../framework/commonts/UIToggle";
import { Utils } from "../../framework/utils/Utils";
import UIHome from "./UIHome";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BallController extends BaseUI {
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
        let index = Utils.randomRang(0,4);
        cc.log("随机生成小球",index)
        if(index == 0){
            this.node.getComponent(UIToggle).setName("任意球")
            this.node.attr({"index":100})
            this.numLabel.string = ""
        }else{
            this.node.getComponent(UIToggle).setToggle(index-1)
            this.numLabel.string = index + ""
            this.node.attr({"index":index})
        }
        this.node.setPosition(0,cc.winSize.height/2 - 200)
        this.circleCollider.enabled = false

    }

    createNewBall(delegate,position,index){
        cc.log("合成新小球",index)
        index = index > 10 ? 10 : index
        this.delegate = delegate
        this.numLabel.string = index + ""
        this.node.attr({"index":index})
        this.node.getComponent(UIToggle).setToggle(index-1)
        this.node.setPosition(position)

        this.scheduleOnce(()=>{
            this.circleCollider.enabled = false
            this.circleCollider.radius = this.node.height/2
            this.circleCollider.enabled = true
            this.rigidBody.linearVelocity = cc.v2(0,1); // 设置小球的速度
            this.rigidBody.gravityScale = 8
            this.delegate.isMixing = false;
        })
     
    }

    //掉落
    dropBall(){
        this.circleCollider.radius = this.node.height/2
        this.circleCollider.enabled = true
        this.isDrop = true
        this.rigidBody.linearVelocity = cc.v2(0,1); // 设置小球的速度
        this.rigidBody.gravityScale = 8
    }


    //施加力
    applyForcey(){
        cc.log("施加力",this.node.height)
        this.rigidBody.linearVelocity = cc.v2(cc.v2(Utils.randomRang(-500,500),Utils.randomRang(1000,2000)));  // 给小球施加向上的冲击力
    }

    update(dt) {
        // 每帧根据加速度调整小球的速度
        if(this.isDrop){
            //cc.log("小球下落")
            // let velocity = this.rigidBody.linearVelocity;
            // velocity.y -= 250 * dt;  // 使下落加速
            // this.rigidBody.linearVelocity = velocity; 
        }
        
    }

    // 只在两个碰撞体开始接触时被调用一次
    onBeginContact(contact,selfCollider,otherCollider){
        //cc.log("两个碰撞体开始接触",selfCollider.node,otherCollider.node)
        let selfNode:cc.Node = selfCollider.node
        let otherNode:cc.Node = otherCollider.node
        let selfIndex = selfNode["index"]
        let otherIndex = otherNode["index"]
        this.isDrop = false

        if(selfIndex == 100 && otherIndex == 100){
            cc.log("两个万能球碰撞")
            return
        }

        if(selfNode.name == "ball" && otherNode.name == "ball" && (selfIndex == 100 || selfIndex == otherIndex)){
            cc.log("碰撞的小球======>",selfIndex,this.delegate.isMixing)
            // 禁用其中一个小球的碰撞体，防止继续触发
            if(!this.delegate.isMixing){
                this.delegate.isMixing = true  //标记，确保不会重复合成
                this.delegate.removeBall(selfNode)
                this.delegate.removeBall(otherNode)
                let newpos = (selfNode.position.add(otherNode.position)).mul(0.5)
                this.delegate.createNewBall(newpos,otherIndex+1)
            }
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
