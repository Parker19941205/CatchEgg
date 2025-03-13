import BaseUI from "../../../framework/base/BaseUI";
import { AudioMgr } from "../../../framework/manager/AudioMgr";
import { UIMgr } from "../../../framework/manager/UIMgr";
import { Utils } from "../../../framework/utils/Utils";
import { AudioId, EventName, UIID } from "../../config/Config";
import { CopperType } from "../../config/GameEnum";
import { PlayerMgr } from "../../manager/PlayerMgr";
const { ccclass, property } = cc._decorator;

/**顶部界面 */
@ccclass
export default class UITop extends BaseUI {
    @property(cc.Node)
    goldLayout: cc.Node = null;
    @property(cc.Node)
    diamondLayout: cc.Node = null;

    start() {
        this.addEvent(EventName.FlyCurrency, this.refreshCurrency)
        this.calcItemPos();
    }
    onEnable() {
    }

    goldPosArr: cc.Vec3[] = []
    diamondPosArr: cc.Vec3[] = []
    private calcItemPos() {
        for (let i = 0; i < this.goldLayout.childrenCount; i++) {
            let goldItem = this.goldLayout.children[i]
            this.goldPosArr.push(goldItem.position)
        }

        for (let i = 0; i < this.diamondLayout.childrenCount; i++) {
            let item = this.diamondLayout.children[i]
            this.diamondPosArr.push(item.position)
        }
    }

    /**刷新金币 如果是添加有飞的动画 */
    refreshCurrency(num: number){
        let uiHome = UIMgr.getInstance().getUIById(UIID.UIHome)
        let energyicon =  UIMgr.getInstance().findChildByName(uiHome.node,"energyicon")
        let energylab:cc.Label =  UIMgr.getInstance().findChildByName(uiHome.node,"energylab").getComponent(cc.Label)
        let rootCanvas = cc.director.getScene().getChildByName('Canvas')
        let pos = energyicon.convertToWorldSpaceAR(cc.Vec2.ZERO)
        let targetPos = rootCanvas.convertToNodeSpaceAR(pos)
        cc.log("刷新资产+",num)
        this.goldLayout.setPosition(0, 0)
        this.diamondLayout.setPosition(0, 0)

        let totalNum = PlayerMgr.getInstance().getUserInfo().energy
        this.flyGoldAni(targetPos,CopperType.Energy,num,totalNum,energylab);
        
        // UIUtils.rollNumLabelAtlas(isAdd, label, num, totalNum, () => {
        //     label.string = totalNum + ""
        // }, 4)
    }
    
    private flyGoldAni(targetPos,copperType,num:number,totalNum:number,label?:cc.Label) {
        let time: number = 0;
        let count: number = 0;

        let layout = this.diamondLayout //copperType ==  CopperType.Energy ? this.goldLayout : this.diamondLayout
        let flyNum = num < layout.children.length ? num : layout.children.length
        let addNum = Math.floor(num/flyNum)
        //cc.log("addNum",addNum)
        for (let i = 0; i < flyNum; i++) {
            let item = layout.children[i]
            item.active = true;
            item.position = new cc.Vec3(0, 0, 0)
            let flyTogold: Function = () => {
                cc.tween(item)
                    .to(0.5, { position: new cc.Vec3(targetPos.x, targetPos.y) })
                    .hide()
                    .call(() => {
                        if(!cc.isValid(label.node)){
                            return 
                        }

                        item.position = this.diamondPosArr[i] //copperType ==  CopperType.Gold ? this.goldPosArr[i]: this.diamondPosArr[i]
                        //纯数字显示数字递增
                        if(Utils.isNumber(label.string)){               
                            let num = Number(label.string) + addNum
                            label.string = String(num)
                        }

                        count++
                        AudioMgr.getInstance().playEffect(AudioId.add_coin)
                        if (count >= flyNum) {
                            count = 0;
                            label.string = Utils.unitGold(totalNum)
                        }
                    })
                    .start();
            }
            let scale = Utils.randomRang(1.5, 2)
            item.scale = 1
            cc.tween(item)
                .delay(time)
                .show()
                .to(0.2, { position: this.diamondPosArr[i] })
                .to(0.05, { scale: scale }).to(0.05, { scale: 1 })
                .delay(0.2)
                .delay(time)
                  .call(() => {
                    flyTogold();
                }).start();
            time += 0.04
        }
    }
  

}
