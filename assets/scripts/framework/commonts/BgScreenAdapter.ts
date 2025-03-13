const { ccclass, property } = cc._decorator;
import menu = cc._decorator.menu;

@ccclass
@menu('自定义组件/背景适配屏幕')
export default class BgScreenAdapter extends cc.Component {
 
    onLoad() {
        this.adjustForNotch();
    }

    adjustForNotch() {
        let winRatio = cc.winSize.width/cc.winSize.height  //屏幕宽高比
        let scaleRatio = 750/1334   //设计宽高比

        if(winRatio > scaleRatio){ //适配宽度
            //cc.log("适配宽====>", cc.winSize.width/750)
            this.node.scale = cc.winSize.width/750
        }else{ //适配高
            //cc.log("适配高====>", cc.winSize.height/1334)
            this.node.scale = cc.winSize.height/1334
        }
    }
}
