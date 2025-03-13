import { UIID } from "../../game/config/Config";
import BaseUI from "../base/BaseUI";
import { BaseEventName, OrderLayer, UIConf } from "../configs/Appcfg";
import { UIUtils } from "../utils/UIUtils";
import { EventMgr } from "./EventMgr";
import { LogMgr } from "./LogMgr";
import { ResourceMgr } from "./ResourceMgr";

class UIConfig {
    constructor(uid: any, parent: cc.Node, callback: Function, param1?: any, param2?: any, param3?: any, param4?: any, param5?: any) {
        this.uid = uid;
        this.parent = parent;
        this.callback = callback;
        this.param1 = param1;
        this.param2 = param2;
        this.param3 = param3;
        this.param4 = param4;
        this.param5 = param5;
    }
    uid: any;
    param1?: any;
    param2?: any;
    param3?: any;
    param4?: any;
    param5?: any;
    parent?: cc.Node;
    callback?: Function;
}
export class UIMgr {
    private static instance: UIMgr = null;
    protected constructor() { }
    public static getInstance(): UIMgr {
        if (this.instance == null) {
            this.instance = new UIMgr();
        }
        return this.instance;
    }
    private currentScene: cc.Scene = null
    private uistatck: Map<any, BaseUI> = new Map<any, BaseUI>();
    private uichace: Map<number, BaseUI> = new Map<number, BaseUI>();
    private orderMap: Map<any, number> = new Map();
    private popStatck: UIConfig[] = [];
    private layerNodeMap: Map<any, cc.Node[]> = new Map();
    private uiRoot: cc.Node = null;
    private waitOpening: UIConfig[] = []
    private onlyShowOne: OrderLayer[] = []
    private activityOne: OrderLayer[] = []
    /** UI配置 */
    private UIConf: { [key: string]: UIConf } = {};
    /**其他的ui配置 */
    private otherUIConf: { [key: string]: UIConf }[] = []
    /**是否正在打开 */
    private isOpening: boolean = false;
    /**初始化 需要ui根节点 */
    public Init(root: cc.Node, uicf?: { [key: string]: UIConf }) {
        let scene: cc.Scene = cc.director.getScene();
        if (this.currentScene == null) {
            this.currentScene == scene;
        } else {
            if (this.currentScene.name != scene.name) {
                this.clear();
            }
        }
        this.uiRoot = root;
        if (uicf) {
            this.UIConf = uicf
        }
        this.onlyShowOne.push(OrderLayer.pop)
        this.activityOne.push(OrderLayer.main)
    }
    public setUICF(uicf: { [key: string]: UIConf }) {
        this.UIConf = uicf;
    }
    /**添加哪个层 同时只能显示一个 默认已经有pop层 不能添加main层*/
    public addLayerShowOne(layer: OrderLayer) {
        this.onlyShowOne.push(layer)
    }
    /**添加哪个层级 只能显示一个 其他全部activity=false 默认已经有main层 不能添加pop层*/
    public addLayerActivityOne(layer: OrderLayer) {
        this.activityOne.push(layer)
    }
    /**添加其他的UI配置 */
    public addUICnf(cnf: { [key: string]: UIConf }) {
        this.otherUIConf.push(cnf)
    }
    /**预加载UI */
    public preLoadUI(uid: any, callback: Function) {
        let uiconfig = this.getUICnf(uid)
        if (!uiconfig) {
            LogMgr.getInstance().error("ui没有配置：", uid)
            return;
        }
        //从本地加载
        ResourceMgr.getInstance().loadRes(uiconfig.bundleName, uiconfig.prefab, (res: cc.Prefab) => {
            let node = cc.instantiate(res)
            node.name = uiconfig.name;
            let baseUi = node.getComponent(BaseUI)
            this.uistatck.set(uid, baseUi);
            if (callback) {
                callback();
            }
        })
    }
    /**清除以前的配置 */
    public clear() {
        if (this.uistatck && this.uistatck.size > 0) {
            this.uistatck.forEach((baseui: BaseUI, uid: number) => {
                baseui["closeUI"]()
            })
            this.uistatck.clear();
        }
        if (this.layerNodeMap && this.layerNodeMap.size > 0) {
            this.layerNodeMap.forEach((nodes: cc.Node[], layer: number) => {
                if (nodes && nodes.length > 0) {
                    for (let i = 0; i < nodes.length; i++) {
                        let node = nodes[i]
                        node.destroy();
                    }
                }
            })
        }
        if (this.waitOpening && this.waitOpening.length > 0) {
            this.waitOpening.splice(0, this.waitOpening.length)
        }
        if (this.onlyShowOne && this.onlyShowOne.length > 0) {
            this.onlyShowOne.splice(0, this.onlyShowOne.length)
        }
        this.orderMap.clear();
        this.popStatck.splice(0, this.popStatck.length)
    }

    /**打开一个界面 指定父节点 */
    public openUIOfParent(uid: any, parent: cc.Node, param1?: any, param2?: any, param3?: any, param4?: any, param5?: any) {
        this.open(uid, parent, param1, param2, param3, param4, param5)
    }
    /**打开界面 并且回调 */
    public openUIOfCallback(uid: any, callback: Function, param1?: any, param2?: any, param3?: any, param4?: any, param5?: any) {
        this.open(uid, this.uiRoot, callback, param1, param2, param3, param4, param5)
    }
    /**打开界面 指定父节点并且回调 */
    public openUIOfParentAndCallback(uid: any, parent: cc.Node, callback: Function, param1?: any, param2?: any, param3?: any, param4?: any, param5?: any) {
        this.open(uid, parent, callback, param1, param2, param3, param4, param5)
    }
    /**
    * 打开一个界面
    * @param uid 界面的uid
    * @param params 透传参数
    */
    public openUI(uid: any, param1?: any, param2?: any, param3?: any, param4?: any, param5?: any) {
        this.open(uid, this.uiRoot, null, param1, param2, param3, param4, param5)
    }
    /**
     * 打开一个界面
     * @param uid 界面的uid
     * @param params 透传参数
     */
    private open(uid: any, parent: cc.Node, callback: Function, param1?: any, param2?: any, param3?: any, param4?: any, param5?: any) {
        if (this.isOpening) {
            let isExist: boolean = false;
            for (let i = 0; i < this.waitOpening.length; i++) {
                let open = this.waitOpening[i]
                if (open.uid == uid) {
                    isExist = true;
                }
            }
            if (!isExist) {
                let config = new UIConfig(uid, parent, callback, param1, param2, param3, param4, param5)
                this.waitOpening.push(config)
            }
            return;
        }
        this.isOpening = true;
        let uiconfig = this.getUICnf(uid)
        if (uiconfig == null) {
            LogMgr.getInstance().error(uid + "不存在")
            this.isOpening = false;
            return;
        }
        let config = new UIConfig(uid, parent, callback, param1, param2, param3, param4, param5)
        if (!this.popCanShow(uid, uiconfig, config)) {
            this.isOpening = false;
            //return;
        }
        if (parent == null) {
            parent = this.uiRoot;
        }
        let baseUI = this.uichace.get(uid)
        if (baseUI) {
            //从缓存里面拿
            this.uistatck.set(uid, baseUI)
            this.uichace.delete(uid)
            let node = parent.getChildByName(uiconfig.name)
            if (node == null) {
                node.active = true
                node = baseUI.node
                node.name = uiconfig.name
                parent.addChild(node);
            }
            //设置层级
            baseUI.layer = uiconfig.zIndex
            let priority = uiconfig.zIndex
            if (this.orderMap.has(baseUI.layer)) {
                priority = this.orderMap.get(baseUI.layer) + 1
            }
            this.orderMap.set(baseUI.layer, priority)
            node.zIndex = priority;
            node.setSiblingIndex(priority)
            baseUI["setUid"](uid);
            if (baseUI.init) {
                baseUI.init(param1, param2, param3, param4, param5)
            }
            //刷新其他main层UI
            this.updateMainUI(uid, uiconfig)
            //添加到对应的层级
            let nodes = this.layerNodeMap.get(uiconfig.zIndex)
            if (nodes) {
                nodes.push(node)
            } else {
                let nods: cc.Node[] = []
                nods.push(node)
                this.layerNodeMap.set(uiconfig.zIndex, nods)
            }
            if (callback) {
                callback(node)
            }
            //执行打开动画
            baseUI["openAni"]();
            EventMgr.getInstance().emit(BaseEventName.OpenUI, uid, node)
            if (uiconfig.showTop) {
                EventMgr.getInstance().emit(BaseEventName.ShowTopUI, uid)
            }
            this.isOpening = false;
            this.openWaiting(uid);
        } else {
            //从本地加载
            ResourceMgr.getInstance().loadRes(uiconfig.bundleName, uiconfig.prefab, (res: cc.Prefab) => {
                let node = cc.instantiate(res)
                node.name = uiconfig.name;
                parent.addChild(node);
                let baseUi = node.getComponent(BaseUI)
                baseUi["setUid"](uid);
                //设置层级
                baseUi.layer = uiconfig.zIndex
                let priority = uiconfig.zIndex
                if (this.orderMap.has(baseUi.layer)) {
                    priority = this.orderMap.get(baseUi.layer) + 1
                }
                this.orderMap.set(baseUi.layer, priority)
                node.zIndex = priority;
                if (baseUi.init) {
                    baseUi.init(param1, param2, param3, param4, param5);
                }
                this.uistatck.set(uid, baseUi)

                //刷新其他main层UI
                this.updateMainUI(uid, uiconfig)
                //添加到对应的层级
                let nodes = this.layerNodeMap.get(uiconfig.zIndex)
                if (nodes) {
                    nodes.push(node)
                } else {
                    let nods: cc.Node[] = []
                    nods.push(node)
                    this.layerNodeMap.set(uiconfig.zIndex, nods)
                }
                if (callback) {
                    callback(node)
                }
                //执行打开动画
                baseUi["openAni"]();
                EventMgr.getInstance().emit(BaseEventName.OpenUI, uid, node)
                if (uiconfig.showTop) {
                    EventMgr.getInstance().emit(BaseEventName.ShowTopUI, uid)
                }
                this.isOpening = false;
                this.openWaiting(uid);
            })
        }

    }
    private openWaiting(uid) {
        if (this.waitOpening.length > 0) {
            let config = this.waitOpening.pop();
            if (config.uid == uid) {
                return;
            }
            this.openUIOfCallback(config.uid, config.callback, config.param1, config.param2, config.param3, config.param4, config.param5)
        }
    }

    /**
     * 关闭一个界面
     * @param node 
     * @param params 
     */
    public closeUI(node: cc.Node, param1?: any, param2?: any, param3?: any, param4?: any, param5?: any) {
        if (!node.isValid || node == null) {
            return;
        }
        let baseUI = node.getComponent(BaseUI)
        //cc.log("baseUI=======>",baseUI,node.name)
        baseUI["onClose"]();
        baseUI["closeAni"](() => {
            let uid = baseUI.getUid();
            let uiconf = this.getUICnf(uid)
            if (baseUI.cache) {
                node.active = false
                node.removeFromParent()
            } else {
                this.uistatck.delete(uid)
                node.destroy();
            }
            if (uiconf == null) {
                return;
            }
            let nodes = this.layerNodeMap.get(uiconf.zIndex)
            if (nodes) {
                for (let i = 0; i < nodes.length; i++) {
                    let nods = nodes[i]
                    if (nods.name == node.name) {
                        nodes = nodes.splice(i, 1)
                        break
                    }
                }
            }
            //设置层级
            let priority = baseUI.layer
            if (this.orderMap.has(baseUI.layer)) {
                priority = this.orderMap.get(baseUI.layer) - 1
                if (priority < baseUI.layer) {
                    priority = baseUI.layer
                }
            }
            this.orderMap.set(baseUI.layer, priority)
            EventMgr.getInstance().emit(BaseEventName.CloseUI, uid, param1, param2, param3, param4, param5)
            //当前关闭的是弹窗
            if (this.getIsShowOne(uiconf.zIndex)) {
                //cc.log("当前关闭的是弹窗=====>",this.popStatck)
                if (this.popStatck.length > 0) {
                    let config = this.popStatck.pop()
                    //this.open(config.uid, config.parent, config.callback, config.param1, config.param2, config.param3, config.param4, config.param5)
                }
            } else if (this.getIsActivityOne(uiconf.zIndex)) {
                //cc.log("关闭的是界面=====>")
                //关闭的是界面 
                let nodes = this.layerNodeMap.get(uiconf.zIndex)
                if (nodes && nodes.length > 0) {
                    nodes[nodes.length - 1].active = true;
                    nodes[nodes.length - 1].getComponent(BaseUI)["onToggleShow"](uid);
                }
            }
        })


    }
    /**刷新ui */
    private updateMainUI(uid: any, uiconfig: UIConf) {
        //每一个层的节点存起来
        let nodes = this.layerNodeMap.get(uiconfig.zIndex)
        //主界面需要全部隐藏
        if (this.getIsActivityOne(uiconfig.zIndex)) {
            if (nodes && nodes.length > 0) {
                let node: cc.Node = nodes[nodes.length - 1]
                node.active = false;
                node.getComponent(BaseUI)["onToggleHide"](uid);
            }
        }
    }
    /**弹窗是否需要排队 */
    private popCanShow(uid: any, uiconfig: UIConf, config: UIConfig): boolean {
        //每一个层的节点存起来
        let nodes = this.layerNodeMap.get(uiconfig.zIndex)
        if (this.getIsShowOne(uiconfig.zIndex)) {
            //弹窗需要排队
            if (nodes && nodes.length > 0) {
                this.popStatck.push(config);
                return false;
            }
        }
        return true;
    }
    private getIsShowOne(layer: OrderLayer) {
        for (let i = 0; i < this.onlyShowOne.length; i++) {
            let zindex = this.onlyShowOne[i]
            if (zindex == layer) {
                return true;
            }
        }
        return false;
    }
    private getIsActivityOne(layer: OrderLayer) {
        for (let i = 0; i < this.activityOne.length; i++) {
            let zindex = this.activityOne[i]
            if (zindex == layer) {
                return true;
            }
        }
        return false;
    }
    /**
     * 根据uid关闭界面
     * @param uid 界面的uid
     * @param params 
     */
    public closeById(uid: number, param1?: any, param2?: any, param3?: any, param4?: any, param5?: any) {
        let baseUI = this.uistatck.get(uid)
        if (baseUI) {
            if (baseUI.node) {
                this.closeUI(baseUI.node, param1, param2, param3, param4, param5)
            }
        }
    }
    /**根据id获取ui */
    public getUIById(uid: any): BaseUI {
        let ui = this.uistatck.get(uid)
        if (ui) {
            return ui;
        }
        let node = this.uiRoot.getChildByName(this.getUICnf(uid).name);
        if (node) {
            return node.getComponent(BaseUI)
        }
        return null;
    }
    /**根据id和父节点获取ui */
    public getUIByIdWithNode(uid: any, parent: cc.Node): BaseUI {
        let ui = this.uistatck.get(uid)
        if (ui) {
            return ui;
        }
        if (parent == null) {
            return null;
        }
        let node = parent.getChildByName(this.getUICnf(uid).name);
        if (node) {
            return node.getComponent(BaseUI)
        }
        return null;
    }

    private getUICnf(uid: any): UIConf {
        let cfg = this.UIConf[uid]
        if (cfg) {
            return cfg;
        }
        for (let i = 0; i < this.otherUIConf.length; i++) {
            let conf = this.otherUIConf[i]
            let cfg = conf[uid]
            if (cfg) {
                return cfg;
            }
        }
        return null;
    }

    public showTips(str: string) {
        this.openUI(UIID.UITips, str)
    }

    /**回到主界面 */
    public backHome() {
        let nodes = this.layerNodeMap.get(OrderLayer.main)
        //cc.log("nodes=========>", nodes)
        let closeNodeTab = []
        if (nodes.length > 0) {
            for (let i = 0; i < nodes.length; i++) {
                let node = nodes[i]
                let name = node.name
                if(name != "UIHome"){
                    closeNodeTab.push(node)
                }else{
                    node.active=true;
                }
            }
        }

        // cc.log("要关闭的界面========>",closeNodeTab)
        for (let k = 0; k < closeNodeTab.length; k++) {
            let node = closeNodeTab[k]
            this.closeUI(node)
        }
    }

    /**
     * 遍历查找子节点
     * @param target 目标节点
     * @param name 子节点名称
     * @returns 
     */
    public findChildByName(target: cc.Node,name:string) {
        let t = null;
        let func = (target, name) => {
            for (let i = 0, j = target.children, len = j.length; i < len; i += 1) {
                let node = j[i];
                if (t) {
                    return t;
                } else if (node.name === name) {
                    return j[i];
                } else if (node.children.length > 0) {
                    t = func(node, name);
                }
            }
            return t;
        };
        return func(target, name);
    }







}
