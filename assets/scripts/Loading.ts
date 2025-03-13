
import BaseUI from "./framework/base/BaseUI";
import { BaseEventName, LoadingProcess } from "./framework/configs/Appcfg";
import { AudioMgr } from "./framework/manager/AudioMgr";
import { EventMgr } from "./framework/manager/EventMgr";
import { UIMgr } from "./framework/manager/UIMgr";
import { DefStringProtocol } from "./framework/network/NetInterface";
import { NetManager } from "./framework/network/NetManager";
import { NetNode } from "./framework/network/NetNode";
import { WebSock } from "./framework/network/WebSock";
import { AudioCF, AudioId, EventName, GameConfig, ServerConfig, UICF, UIID } from "./game/config/Config";
import { TrackData, TrackId } from "./game/datas/TrackData";

import { DataMgr } from "./game/manager/DataMgr";
import { HttpManager } from "./game/manager/HttpManager";
import { Platform, PlatformManager } from "./game/manager/PlatformManager";
import { PlayerMgr } from "./game/manager/PlayerMgr";


const { ccclass, property } = cc._decorator;
//开启动态合图
cc.macro.CLEANUP_IMAGE_CACHE = false;
cc.dynamicAtlasManager.enabled = true;
// 开启调试
//cc.dynamicAtlasManager.showDebug(true)

@ccclass
export default class Loading extends BaseUI {
    @property(cc.Label)
    tips: cc.Label = null;
    @property(cc.Sprite)
    openSprite: cc.Sprite = null;

    private process: number = 0;
    private sceneName: string = "Main"
    private animationState: dragonBones.AnimationState = null;

    onLoad() {
        //初始化WebSocket
        let Node = new NetNode();
        Node.init(new WebSock(), new DefStringProtocol());
        NetManager.getInstance().setNetNode(Node);
    }

    //初始化server地址
    initNetUrl(){
        let httpUrl = ServerConfig[GameConfig.ServerType].httpUrl
        let socketUrl = ServerConfig[GameConfig.ServerType].socketUrl

        GameConfig.httpUrl = httpUrl
        GameConfig.socketUrl = socketUrl
    }

    start() {
        PlatformManager.getInstance().init();
        //初始化UI管理器配置
        UIMgr.getInstance().setUICF(UICF)
        //初始化音频管理器
        AudioMgr.getInstance().init(AudioCF)        
        cc.director.preloadScene(this.sceneName)
        this.initNetUrl()

        EventMgr.getInstance().on(BaseEventName.Loading, this, this.setProcessLoad)
        this.setProcessLoad(LoadingProcess.StartLoading)
        //获取用户隐私协议
        //PlatformManager.getInstance().getPrivacyAuthorize()

    }


    setProcessLoad(process: number) {
        this.process = process / 100;
        switch (process) {
            case LoadingProcess.StartLoading:
                //this.tips.string = "配置文件加载";
                DataMgr.getInstance().preload()
                break
            case LoadingProcess.ExcelCfg:
                //this.tips.string = "加载用户数据";
                PlayerMgr.getInstance().preload();
                break;
            case LoadingProcess.PlayerCfg:
                //this.tips.string = "加载资源";
                this.preloadRes();
                break;
            case LoadingProcess.ResCfg:
                //this.tips.string = "加载音效";
                this.preloadAudio();
                break;
            case LoadingProcess.AudioCfg:
                //this.tips.string = "加载其他";
                this.preloadUI();
                break;
            case LoadingProcess.EndLoading:
                //this.tips.string = "进入中...";
                cc.director.loadScene(this.sceneName)
            break;
        }
        //this.progressBar.position = cc.v3(0 + (this.process * 236),this.progressBar.position.y)

    }
    /**预加载资源 */
    preloadRes() {
        if (GameConfig.PreBundle.length > 0) {
            for (let i = 0; i < GameConfig.PreBundle.length; i++) {
                let bundleName = GameConfig.PreBundle[i]
                cc.assetManager.loadBundle(bundleName, (er: Error, bundle: cc.AssetManager.Bundle) => {
                    cc.log("预加载资源=====>",bundleName)
                    if (i == GameConfig.PreBundle.length - 1) {
                        this.setProcessLoad(LoadingProcess.ResCfg)
                    }
                })
            }
        } else {
            this.setProcessLoad(LoadingProcess.ResCfg)
        }
    }
    /**预加载音效 */
    preloadAudio() {
        let index = 0;
        if (GameConfig.PreAudioRes.length > 0) {
            for (let i = 0; i < GameConfig.PreAudioRes.length; i++) {
                let audId = GameConfig.PreAudioRes[i];
                AudioMgr.getInstance().loadAudio(audId, () => {
                    index++;
                    if (index == GameConfig.PreAudioRes.length) {
                        this.setProcessLoad(LoadingProcess.AudioCfg)
                    }
                })
            }
        } else {
            this.setProcessLoad(LoadingProcess.AudioCfg)
        }
    }
 
    /**预加载UI */
    preloadUI() {
        let index = 0;
        if (GameConfig.PreUIRes.length > 0) {
            for (let i = 0; i < GameConfig.PreUIRes.length; i++) {
                let uid = GameConfig.PreUIRes[i];
                UIMgr.getInstance().preLoadUI(uid, () => {
                    index++;
                    if (index == GameConfig.PreUIRes.length) {
                        this.setProcessLoad(LoadingProcess.EndLoading)
                    }
                })
            }
        } else {
            this.setProcessLoad(LoadingProcess.EndLoading)
        }
    }

}
