import BaseUI from "../../../framework/base/BaseUI";
import { TimeUtils } from "../../../framework/utils/TimeUtils";

const { ccclass, property } = cc._decorator;

export enum ClickType {
    /**点击 */
    click,
    /**滑动 */
    slide,
}

export enum LightType {
    /**圆形 */
    circle,
    /**方形 */
    square,
}

export enum DirPos {
    /**上方右边 */
    TopRight,
    /**上方左边 */
    TopLeft,
    BottomLeft,
    BottomRight,
    /**全屏提示 */
    FullScreen,
}
export class GuildCfg {
    /**点击 0：点击 1：滑动 */
    clickType: ClickType = ClickType.click
    /**目标节点 */
    distNode: cc.Node = null;
    /**指引的文字 */
    tipstring: string = null;
    /**tips方位 */
    tipsDir: DirPos = DirPos.TopRight;
    /**是否是弱引导 */
    isWeek: boolean = false;
    /**高亮的图形 0:圆形 1：方形 */
    lightType: LightType = LightType.circle;
    /**是否需要显示手指 */
    showHand: boolean = true;
  
    /**延时出现 */
    delay: number = 0.1
    /**滑动 开始位置 */
    startNode: cc.Node = null;
    /**滑动 结束位置 */
    
    endNode: cc.Node = null;
    /**滑动时间 */
    moveTime: number = 1
    /**隐藏mask */
    hideMask: boolean = false;
    /**需要加多少的框 */
    addSize: cc.Size = new cc.Size(40, 40)
    /**位置偏移量 */
    maskPos: cc.Vec2 = cc.v2(0,0)
    /**提示框位置偏移量 */
    tipsPos: cc.Vec2 = cc.v2(0,0)
    /**点击后是否走自己的回调 */
    callBack: Function = null;
    /**出现引导时间 */
    openGuideTime: number = 0.7
    /**是否手动关闭 */
    isManualClose: boolean = false;
    index: number = 0;
}
/**引导点击界面 */
@ccclass
export default class UIGuide extends BaseUI {
    @property(cc.Mask)
    mask: cc.Mask = null;
    @property(cc.Node)
    hand: cc.Node = null;
    @property(cc.Node)
    tipBg: cc.Node = null;
    @property(cc.Label)
    tipText: cc.Label = null;
    @property(cc.Node)
    roleNode: cc.Node = null;
    @property(cc.Node)
    fullTips: cc.Node = null;

    private distNode: cc.Node = null;
    private dirPos: DirPos = DirPos.TopRight;
    private cfg: GuildCfg;

     onLoad(){
        this.hand.active = false;
        this.mask.node.active = false;
    }

    init(cfg: GuildCfg) {
        cc.log("UIGuide:init",cfg)
        if (!cfg.delay || cfg.delay < 0.1) {
            cfg.delay = 0.1
        }
        this.cfg = cfg;
        this.scheduleOnce(() => {
            if (cfg.clickType == ClickType.click) {
                this.clickTouch(cfg)
            } else {
                this.moveTouch(cfg)
            }
        }, cfg.delay)
    }

    private clickTouch(cfg: GuildCfg) {
        this.hand.active = false;
        this.tipBg.active = false;
        this.cfg = cfg;
        if (cfg.tipsDir) {
            this.dirPos = cfg.tipsDir;
        }
        this.distNode = cfg.distNode;
        let size: cc.Size;
        if (cfg.distNode) {
            let p = this.distNode.convertToWorldSpaceAR(cc.Vec2.ZERO)
            let poss = this.mask.node.parent.convertToNodeSpaceAR(p)
            poss.x = poss.x + cfg.maskPos.x
            poss.y = poss.y + cfg.maskPos.y
            this.mask.node.setPosition(poss);
            this.mask.node.setContentSize(900, 900)
            size = cfg.distNode.getContentSize();
        } else {
            size = new cc.Size(0, 0)
        }
        if (cfg.lightType == LightType.circle) {
            this.mask.type = cc.Mask.Type.ELLIPSE;
        } else {
            this.mask.type = cc.Mask.Type.RECT;
        }
        if (cfg.isWeek && cfg.hideMask) {
            this.mask.node.active = false;
            this.showHand();
            this.showTip(cfg.tipstring)
        } else {
            this.mask.node.active = true;
            cc.tween(this.mask.node)
                .to(this.cfg.openGuideTime, { width: size.width + this.cfg.addSize.width, height: size.height + this.cfg.addSize.height })
                .call(() => {
                    this.showHand();
                    this.showTip(cfg.tipstring)
                })
                .start();
        }
    }
    private moveTween: cc.Tween
    moveTouch(cfg: GuildCfg) {
        if (cfg.startNode && cfg.endNode) {
            this.distNode = cfg.distNode;
            let startWPos = cfg.startNode.convertToWorldSpaceAR(cc.Vec2.ZERO)
            let endWPos = cfg.endNode.convertToWorldSpaceAR(cc.Vec2.ZERO)
            let spos = this.hand.parent.convertToNodeSpaceAR(startWPos)
            let spos2 = this.hand.parent.convertToNodeSpaceAR(startWPos)
            let epos = this.hand.parent.convertToNodeSpaceAR(endWPos)

            let handSize = this.hand.getContentSize();
            epos.x = epos.x + handSize.width / 2
            epos.y = epos.y + handSize.height / 2

            spos.x = spos.x + handSize.width / 2
            spos.y = spos.y + handSize.height / 2

            this.scheduleOnce(() => {
                this.hand.getComponent(cc.Animation).stop("hand");
            }, 0.2)
            this.hand.setPosition(spos)
            this.hand.active = true;
            this.moveTween = cc.tween(this.hand)
                .to(cfg.moveTime, { position: new cc.Vec3(epos.x, epos.y) })
                .delay(0.5)
                .call(() => {
                    this.hand.setPosition(spos)
                }).union().repeatForever();
            this.moveTween.start();

            if (cfg.isWeek && cfg.hideMask) {
                this.mask.node.active = false;
            }else{
                this.mask.node.active = true;
            }

            this.mask.node.setPosition(spos2)
            let size = cfg.startNode.getContentSize();
            this.mask.node.setContentSize(size.width, size.height)

            //特殊调整
            if (cfg.index == 0) {
                this.mask.node.setContentSize(size.width+50, size.height+150)
                this.mask.node.setPosition(this.mask.node.x, this.mask.node.y - 50)
            }else if (cfg.index == 1) {
                this.mask.node.setContentSize(size.width+150, size.height+50)
                this.mask.node.setPosition(this.mask.node.x+50, this.mask.node.y)
            }else if (cfg.index == 2) {
                this.mask.node.setContentSize(size.width+50, size.height+150)
                this.mask.node.setPosition(this.mask.node.x, this.mask.node.y+50)
            }else if (cfg.index == 3) {
                this.mask.node.setContentSize(size.width+150,size.height+50)
                this.mask.node.setPosition(this.mask.node.x-50, this.mask.node.y)
            }


            this.showTip(cfg.tipstring);
        } else {
            this.closeUI();
        }
    }
    start() {
        //监听事件
        this.node.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            //放行
            if (this.cfg.isWeek || !this.mask.node.active) {
                if (this.cfg.callBack) {
                    //this.cfg.callBack();
                } else {
                    this.node["_touchListener"].setSwallowTouches(false);
                }
                if (!this.cfg.isManualClose) {
                    this.closeUI();
                }
                return;
            }

            if (this.distNode) {
                //目标区域存在，击中放行
                let rect = this.distNode.getBoundingBoxToWorld();
                if (rect.contains(event.getLocation())) {       
                    this.node["_touchListener"].setSwallowTouches(false);
                    if (this.cfg.callBack) {
                        this.cfg.callBack();
                    }

                    if (!this.cfg.isManualClose) {
                        this.closeUI();
                    }
                }
            }
        }, this);

        //监听事件
        this.node.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            // if(this.cfg.isManualClose){
            //     this.mask.node.active = false
            // }
        })

        //遮罩层监听事件
        this.mask.node.getChildByName("bg").on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            //放行
            if (this.cfg.isWeek || !this.mask.node.active) {
                if (this.cfg.callBack) {
                    this.cfg.callBack();
                } else {
                    this.node["_touchListener"].setSwallowTouches(false);
                }
                this.closeUI();
                return;
            }

            //目标区域存在，击中放行
            //cc.log("点击了遮罩层",this.distNode)
            if (this.distNode) {
                let rect = this.distNode.getBoundingBoxToWorld();
                if (rect.contains(event.getLocation())) {
                    if (this.cfg.callBack) {
                        this.cfg.callBack();
                    } else {
                        this.node["_touchListener"].setSwallowTouches(false);
                    }

                    if (!this.cfg.isManualClose) {
                        this.closeUI();
                    }
                }
            }
        }, this)
    }
    showHand() {
        if (this.cfg.showHand) {
            let handSize = this.hand.getContentSize();
            this.hand.setPosition(this.mask.node.position.x + handSize.width/2,this.mask.node.position.y + handSize.height/2);
            this.hand.active = true;
        }
    }
    showTip(text: string) {
        if (text && text.length > 0) {
            let handSize = this.hand.getContentSize();
            this.tipText.string = text;
            this.tipBg.getComponent(cc.Layout).updateLayout()

            if(this.cfg.tipsDir == DirPos.FullScreen){
                this.roleNode.active = true
                this.fullTips.active = true
            }


            this.scheduleOnce(()=>{
                this.tipBg.active = true;
                let bgSize = this.tipBg.getContentSize()
                if(this.cfg.showHand){  //默认手指正上方
                    this.tipBg.setPosition(this.hand.position.x + this.cfg.tipsPos.x, this.hand.position.y + handSize.height/2 + bgSize.height/2  + this.cfg.tipsPos.y)
                }else if(this.cfg.tipsDir == DirPos.FullScreen){ //全屏位置
                    this.tipBg.setPosition(this.roleNode.position.x + this.cfg.tipsPos.x, this.roleNode.position.y + this.cfg.tipsPos.y)
                }else{ //默认引导节点位置
                    this.tipBg.setPosition(this.mask.node.position.x + this.cfg.tipsPos.x, this.mask.node.position.y + this.cfg.tipsPos.y)
                }

                //cc.log("距离====>",cc.winSize.height/2,this.tipBg.position.y,bgSize)
                //适配屏幕(防止超出屏幕外)
                if(this.tipBg.position.x + bgSize.width/2 > cc.winSize.width/2) { //右
                    this.tipBg.setPosition(cc.winSize.width/2 - bgSize.width/2, this.tipBg.position.y)
                }else if(this.tipBg.position.x - bgSize.width/2 < -cc.winSize.width/2){ //左
                    this.tipBg.setPosition(-cc.winSize.width/2 + bgSize.width/2, this.tipBg.position.y)
                }else if(this.tipBg.position.y + bgSize.height/2 > cc.winSize.height/2) { //上
                    this.tipBg.setPosition(this.tipBg.position.x, cc.winSize.height/2 - bgSize.height/2)
                }else if(this.tipBg.position.y - bgSize.height/2 < -cc.winSize.height/2){ //下
                    this.tipBg.setPosition(this.tipBg.position.x, -cc.winSize.height/2 + bgSize.height/2)
                }
            })
       

            let orginScalex = Math.abs(this.tipBg.scaleX);
            let orginScaleY = Math.abs(this.tipBg.scaleY);
            let textScaleX = Math.abs(this.tipText.node.scaleX);
            let textScaleY = Math.abs(this.tipText.node.scaleY);
            if (this.dirPos == DirPos.TopLeft) {
                this.tipBg.scaleX = -orginScalex
                this.tipText.node.scaleX = -textScaleX
            } else if (this.dirPos == DirPos.TopRight) {
                this.tipBg.scaleX = orginScalex
                this.tipText.node.scaleX = textScaleX
            } else if (this.dirPos == DirPos.BottomLeft) {
                this.tipBg.scaleX = -orginScalex
                this.tipBg.scaleY = -orginScaleY
                this.tipText.node.scaleX = -textScaleX
                this.tipText.node.scaleY = -textScaleY
                this.tipBg.setPosition(this.mask.node.position.x, this.mask.node.position.y - 100)
            } else if (this.dirPos == DirPos.BottomRight) {
                this.tipBg.scaleY = -orginScaleY
                this.tipText.node.scaleX = textScaleX
                this.tipText.node.scaleY = -textScaleY
                this.tipBg.setPosition(this.mask.node.position.x, this.mask.node.position.y - 100)
            }

        } else {
            this.tipBg.active = false;
        }
    }

    hideMask() {
        this.mask.node.active = false
    }


}
