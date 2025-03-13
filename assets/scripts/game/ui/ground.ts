const { ccclass, property } = cc._decorator;

@ccclass
export default class ground extends cc.Component {
    @property(cc.Node)
    ground: cc.Node = null;

    onLoad() {
    }

    start() {
    }


    // 只在两个碰撞体开始接触时被调用一次
    onBeginContact(contact,selfCollider,otherCollider){
        //cc.log("两个碰撞体开始接触",selfCollider,otherCollider)
        // if(otherCollider.node.name == "player"){
        //     this.rigidBody = otherCollider.node.getComponent(cc.RigidBody);
        //     this.rigidBody.linearVelocity = cc.v2(0,0);
        // }
    }

    // 只在两个碰撞体结束接触时被调用一次
    onEndContact (contact, selfCollider, otherCollider) {
    }

    // // 每次将要处理碰撞体接触逻辑时被调用
    onPreSolve (contact, selfCollider, otherCollider) {
    }

    // 每次处理完碰撞体接触逻辑时被调用
    onPostSolve(contact, selfCollider, otherCollider) {
    }
}
