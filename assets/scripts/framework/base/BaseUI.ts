import { EventName, GameConfig, UIID } from "../../game/config/Config";
import { OrderLayer } from "../configs/Appcfg";
import { EventMgr } from "../manager/EventMgr";
import { CompleteCallback, ResourceMgr } from "../manager/ResourceMgr";
import { TweenMgr } from "../manager/TweenMgr";
import { UIMgr } from "../manager/UIMgr";

const { ccclass, property } = cc._decorator;

export enum OpenAin {
    None,
    Pop,
}


cc.Enum(OpenAin)
@ccclass
export default class BaseUI extends cc.Component {
    @property({ displayName: "是否需要缓存" })
    cache: boolean = false;
    @property({ type: OpenAin, tooltip: "注意：主节点下必须有bg 和 root", displayName: "打开动画" })
    openAniType: OpenAin = OpenAin.None;
    @property({ tooltip: "注意：主节点下必须有bg 和 root", displayName: "点击弹窗外是否关闭" })
    outClose:boolean = false

    public layer: OrderLayer
    private uid: number = -1;
    private resArray: cc.Asset[] = []

    private eventList: Array<Map<string, Function>> = [];
    protected isclose: boolean = false;


    public init(param1?: any, param2?: any, param3?: any, param4?: any, param5?: any) {
        this.isclose = false;
    }
    protected onOpen() { }
    protected onClose() { }

    /**其他界面显示了 当前界面隐藏回调 只作用于设置了activiy层的界面*/
    protected onToggleHide(uid: UIID) { }
    /**其他界面关闭了 当前界面显示回调  只作用于设置了activiy层的界面*/
    protected onToggleShow(uid: UIID) { }

    // update (dt) {}

    /**
    * 添加监听的事件
    * @param listenename 事件名
    * @param fun 响应的方法
    */
    protected addEvent(listenename: string, fun: Function) {
        EventMgr.getInstance().on(listenename, this, fun);
        let map: Map<string, Function> = new Map();
        map.set(listenename, fun);
        this.eventList.push(map);
    }
    /**
     * 发送事件
     * @param listenerName 事件名称
     * @param param1 
     * @param param2 
     * @param param3 
     * @param param4 
     * @param param5 
     */
    protected sendEvent(listenerName: string, param1?: any, param2?: any, param3?: any, param4?: any, param5?: any) {
        EventMgr.getInstance().emit(listenerName, param1, param2, param3, param4, param5);
    }

    public getUid() {
        return this.uid;
    }
    public onOpened() {
        this.isclose = false;
    }
    private setUid(uid: number) {
        this.uid = uid;
    }

    /**是否显示屏蔽层 */
    public showTouchMask(isShow:boolean){
        this.sendEvent(EventName.RefreshMaskShow, isShow);
    }

    /**带动画打开 uimgr里调用 */
    private openAni() {
        if (this.openAniType == OpenAin.Pop) {
            let bg = this.node.getChildByName("bg")
            if (bg) {
                bg.opacity = 0;
                cc.tween(bg).to(0.2, { opacity: 200 }).start();

                if(this.outClose){
                    bg.on(cc.Node.EventType.TOUCH_END,() => {
                        this.closeUI()
                    }, this)
                }
            }
            let root = this.node.getChildByName("root")
            if (root) {
                let orginScale = root.scale;
                root.scale = 0;
                let popAni = TweenMgr.getInstance().getTween(root)
                TweenMgr.getInstance().popOpenAin(popAni, () => {
                    if (root.scale != orginScale) {
                        cc.tween(root).to(0.15, { scale: orginScale }).start();
                    }
                    this.onOpen();
                })

                if(this.outClose){
                    root.addComponent(cc.BlockInputEvents)
                }
            } else {
                this.onOpen();
            }
        }
    }

    /**带动画关闭  uimgr里调用*/
    private closeAni(callback: Function) {
        if (this.openAniType == OpenAin.None) {
            callback();
        } else {
            if (this.openAniType == OpenAin.Pop) {
                let bg = this.node.getChildByName("bg")
                if (bg) {
                    bg.opacity = 200;
                    cc.tween(bg).to(0.4, { opacity: 0 }).start();
                }
                let root = this.node.getChildByName("root")
                if (root) {
                    let popAni = TweenMgr.getInstance().getTween(root)
                    TweenMgr.getInstance().popCloseAin(popAni, () => {
                        callback();
                    })
                } else {
                    callback();
                }
            }
        }
    }

    /**关闭界面 */
    protected closeUI(param1?: any, param2?: any, param3?: any, param4?: any, param5?: any) {
        //去除监听的事件
        if (this.eventList && this.eventList.length > 0) {
            for (let i = 0; i < this.eventList.length; i++) {
                let event = this.eventList[i]
                event.forEach((fun: Function, name: string) => {
                    EventMgr.getInstance().off(name, this, fun);
                })
            }
        }

        this.isclose = true;
        this.release();
        UIMgr.getInstance().closeUI(this.node, param1, param2, param3, param4, param5)
    }
    /**不带动画的关闭 */
    protected closeNotAni(param1?: any, param2?: any, param3?: any, param4?: any, param5?: any) {
        this.openAniType = OpenAin.None
        this.closeUI(param1, param2, param3, param4, param5)
    }
    /**
     * 从resources文件夹下获取资源
     * @param path 资源路径
     * @param callback 
     */
    protected loadFromRes(path: string, callback: CompleteCallback) {
        ResourceMgr.getInstance().loadFromRes(path, (res: cc.Asset) => {
            if (this.isclose) {
                return;
            }
            this.addRes(res)
            callback(res)
        })
    }
    /**
     * 从指定的assets bundle加载资源 
     * @param bundleName assets bundle的名称
     * @param path 
     * @param callback 
     * @param autoRelese 界面关闭后自动释放资源  默认为true 
     */
    protected loadResFromBundle(bundleName: string, path: string, callback: CompleteCallback, autoRelese: boolean = true) {
        ResourceMgr.getInstance().loadRes(bundleName, path, (res: cc.Asset) => {
            if (this.isclose) {
                return;
            }
            if (autoRelese) {
                this.addRes(res)
            }
            callback(res)
        })
    }
    /**
     * 加载图片 界面关闭后自动释放 
     * @param bundleName 
     * @param path 
     * @param callback 
     * @param autoRelese 界面关闭后自动释放资源  默认为true 
     */
    protected loadSpriteFrame(bundleName: string, path: string, callback: CompleteCallback, autoRelese: boolean = true) {
        ResourceMgr.getInstance().loadSpriteframe(bundleName, path, (res: cc.SpriteFrame) => {
            if (this.isclose) {
                return;
            }
            if (autoRelese) {
                this.addRes(res)
            }
            callback(res)
        })
    }
    private addRes(res: cc.Asset) {
        if(res && this.resArray){
            this.resArray.push(res)
        }
    }
    /**翻译 */
    protected T(string: string): string {
        return string;
    }

    /**释放动态加载的资源 */
    private release() {
        //cc.log("释放资源",this.resArray);
        if (!this.cache && this.resArray) {
            for (let i = 0; i < this.resArray.length; i++) {
                let res = this.resArray[i]
                res.decRef();
                res = null
            }
            this.resArray = [];
        }

    }

    onDestroy() {
        //去除监听的事件
        if (this.eventList && this.eventList.length > 0) {
            for (let i = 0; i < this.eventList.length; i++) {
                let event = this.eventList[i]
                event.forEach((fun: Function, name: string) => {
                    EventMgr.getInstance().off(name, this, fun);
                })

            }
            this.eventList = null;
        }
        this.isclose = true;
        this.release();
    }

    /**设置纹理 */
    setSprite(sprite:cc.Sprite,bundleName,name,callback?: CompleteCallback){
        this.loadSpriteFrame(bundleName, name, (res: cc.SpriteFrame) => {
            sprite.spriteFrame = res;
            this.addRes(res)
            if(callback){
                callback()
            }
        })
    }

    /**设置远端纹理 */
    setRemoteSprite(url:string,sprite:cc.Sprite,callback?: CompleteCallback){
        if(url == null || url == "" || url.length == 0 || sprite == null){
            return
        }
        ResourceMgr.getInstance().getUrlCacheSpriteframeAsyn(GameConfig.httpUrl + url, (res: cc.SpriteFrame) => {
            //cc.log("设置远端纹理====>",url,res)
            sprite.spriteFrame = res
            this.addRes(res)
            if(callback){
                callback()
            }
        })
    }

    /**加载远程龙骨 */
    setRemoteDragonBones(animalAni:dragonBones.ArmatureDisplay,skeletonUrl:string,atlasUrl:string,textureUrl:string,armatureName:string,animationName:string){
        ResourceMgr.getInstance().loadRemoteDragonBones(animalAni, skeletonUrl, atlasUrl, textureUrl, armatureName,animationName)
    }

    /**加载远程Spine */
    setRemoteSpine(spine:sp.Skeleton,jsonUrl:string,atlasUrl:string,textureUrl:string,animationName?:string){
        if(jsonUrl == null || jsonUrl == ""){
            return
        }
        let httpUrl = GameConfig.httpUrl
        ResourceMgr.getInstance().loadRemoteSpine(spine, httpUrl + jsonUrl, httpUrl + atlasUrl, httpUrl + textureUrl,animationName,(res:cc.Asset[])=>{
            for(let i = 0;i<res.length;i++){
                this.addRes(res[i])
            }
        })
    }
   




}
