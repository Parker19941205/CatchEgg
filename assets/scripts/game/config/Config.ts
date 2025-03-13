import { Audiocfg, OrderLayer, Servercfg, UIConf } from "../../framework/configs/Appcfg";
/**===========================UI配置============================= */
/**所有界面的UID */
export enum UIID {
    UITouch,
    UITips,
    LoadingCicle,
    UITop,
    UIGuide,
    UIMask,
    LoginUI,
    UIHome,
    SexSelect,
    PersonInfo,
    FindPropUI,
    RewardUI,
    EnergyBuyUI,
    FriendUI,
    FightUI,
    SettingUI,
    SelectPetUI,
    BagUI,
    SelectFightPet,
    MatchUI,
    CustomerUI,
    OnHookUI,
    OnHookIngUI,
    ChatUI,
    InviteUI,
}

/**ui配置类 */
export let UICF: { [key: string]: UIConf } = {
    /**通用ui */
    [UIID.UITouch]: { prefab: "UITouch", name: "UITouch", showTop: true, zIndex: OrderLayer.touch, bundleName: "comprefabs" },
    [UIID.UITips]: { prefab: "UITips", name: "UITips", showTop: true, zIndex: OrderLayer.tip, bundleName: "comprefabs" },
    [UIID.LoadingCicle]: { prefab: "LoadingCicle", name: "LoadingCicle", showTop: true, zIndex: OrderLayer.guide, bundleName: "comprefabs" },
    [UIID.UITop]: { prefab: "UITop", name: "UITop", showTop: true, zIndex: OrderLayer.top, bundleName: "comprefabs" },
    [UIID.UIGuide]: { prefab: "UIGuide", name: "UIGuide", showTop: true, zIndex: OrderLayer.guide, bundleName: "comprefabs" },
    [UIID.UIMask]: { prefab: "UIMask", name: "UIMask", showTop: true, zIndex: OrderLayer.touch, bundleName: "comprefabs" },

    /**游戏ui */
    [UIID.UIHome]: { prefab: "UIHome", name: "UIHome", showTop: true, zIndex: OrderLayer.main, bundleName: "mainprefabs" },
    [UIID.LoginUI]: { prefab: "LoginUI", name: "LoginUI", showTop: true, zIndex: OrderLayer.main, bundleName: "prefabs" },
    [UIID.SexSelect]: { prefab: "SexSelect", name: "SexSelect", showTop: true, zIndex: OrderLayer.main, bundleName: "prefabs" },
    [UIID.PersonInfo]: { prefab: "PersonInfo", name: "PersonInfo", showTop: true, zIndex: OrderLayer.pop, bundleName: "prefabs" },
    [UIID.RewardUI]: { prefab: "RewardUI", name: "RewardUI", showTop: true, zIndex: OrderLayer.pop, bundleName: "prefabs" },
    [UIID.FindPropUI]: { prefab: "FindPropUI", name: "FindPropUI", showTop: true, zIndex: OrderLayer.pop, bundleName: "prefabs" },
    [UIID.EnergyBuyUI]: { prefab: "EnergyBuyUI", name: "EnergyBuyUI", showTop: true, zIndex: OrderLayer.pop, bundleName: "prefabs" },
    [UIID.FightUI]: { prefab: "FightUI", name: "FightUI", showTop: true, zIndex: OrderLayer.main, bundleName: "prefabs" },
    [UIID.SettingUI]: { prefab: "SettingUI", name: "SettingUI", showTop: true, zIndex: OrderLayer.pop, bundleName: "prefabs" },
    [UIID.SelectPetUI]: { prefab: "SelectPetUI", name: "SelectPetUI", showTop: true, zIndex: OrderLayer.pop, bundleName: "prefabs" },
    [UIID.BagUI]: { prefab: "BagUI", name: "BagUI", showTop: true, zIndex: OrderLayer.pop, bundleName: "prefabs" },
    [UIID.SelectFightPet]: { prefab: "SelectFightPet", name: "SelectFightPet", showTop: true, zIndex: OrderLayer.pop, bundleName: "prefabs" },
    [UIID.MatchUI]: { prefab: "MatchUI", name: "MatchUI", showTop: true, zIndex: OrderLayer.main, bundleName: "prefabs" },
    [UIID.CustomerUI]: { prefab: "CustomerUI", name: "CustomerUI", showTop: true, zIndex: OrderLayer.pop, bundleName: "prefabs" },
    [UIID.OnHookUI]: { prefab: "OnHookUI", name: "OnHookUI", showTop: true, zIndex: OrderLayer.pop, bundleName: "prefabs" },
    [UIID.OnHookIngUI]: { prefab: "OnHookIngUI", name: "OnHookIngUI", showTop: true, zIndex: OrderLayer.main, bundleName: "prefabs" },
    [UIID.FriendUI]: { prefab: "FriendUI", name: "FriendUI", showTop: true, zIndex: OrderLayer.pop, bundleName: "friend" },
    [UIID.ChatUI]: { prefab: "ChatUI", name: "ChatUI", showTop: true, zIndex: OrderLayer.pop, bundleName: "friend" },
    [UIID.InviteUI]: { prefab: "InviteUI", name: "InviteUI", showTop: true, zIndex: OrderLayer.pop, bundleName: "friend" },

}

/**===========================声音资源============================= */

/**对应声音的名称路径 */
export enum AudioId {
    btnclick = "btnclick",
    bgm = "bgm",
    add_coin = "add_coin",
    分裂 = "分裂",
    进入瓶子 = "进入瓶子",
    浪潮 = "浪潮",
    收缩 = "收缩",
    吸收 = "吸收",
    拉伸 = "拉伸",
    失败 = "失败",
    通关 = "通关",

}

export let AudioCF: { [key: string]: Audiocfg } = {
    [AudioId.btnclick]: { path: "btnclick", bundle: "audio" },
    [AudioId.bgm]: { path: "bgm", bundle: "audio" },
    [AudioId.add_coin]: { path: "add_coin", bundle: "audio" },
    [AudioId.分裂]: { path: "分裂", bundle: "audio" },
    [AudioId.拉伸]: { path: "拉伸", bundle: "audio" },
    [AudioId.收缩]: { path: "收缩", bundle: "audio" },
    [AudioId.进入瓶子]: { path: "进入瓶子", bundle: "audio" },
    [AudioId.浪潮]: { path: "浪潮", bundle: "audio" },
    [AudioId.吸收]: { path: "吸收", bundle: "audio" },
    [AudioId.失败]: { path: "失败", bundle: "audio" },
    [AudioId.通关]: { path: "通关", bundle: "audio" },
    
}

/**事件 */
export enum EventName {
    RefreshMaskShow = "RefreshMaskShow",
    RefreshEenergy = "RefreshEenergy",
    FlyCurrency = "FlyCurrency",
    RefreshPet = "RefreshPet",
    RefreshUserInfo = "RefreshUserInfo",
    RefreshCurPet = "RefreshCurPet",
    RefreshScanResult = "RefreshScanResult",
    RefreshChatMsg = "RefreshChatMsg",

}

/**tip提示 */
export let TipsList = [
    "踩爆地雷了也不一定会输哦！",
    "正确标记一个地雷可会增加8分呢！",
    "踩爆地雷是会扣15分的！",
    "翻开一个安全格子增加1分。",
    "火焰道具可以燃烧格子呢！",
    "飓风道具可以吹开有地雷的格子。",
    "透视道具可以短时间透视格子下面哦！",
    "冰霜道具能让对手无法翻开冰冻的区域。",
    "错误标记一次会扣10分滴！",
    "标记和踩爆得分会在结束时结算。",
    "30秒内没有操作会默认认输的呢！",
]

/**服务器配置 */
export let ServerConfig: { [key: string]: Servercfg } = {
    ["test"]: { httpUrl: "http://192.168.0.92:8443/", socketUrl: "ws://192.168.0.92:8443/wss" },
    ["release"]:{ httpUrl: "https://w.dongtayouxi.cn.ahghdj.com/", socketUrl: "wss://w.dongtayouxi.cn.ahghdj.com/wss"},
}


export class GameConfig {
    public static readonly AppName: string = "开箱子"
    /**用来存缓存的key的前缀 每个游戏需要唯一*/
    public static readonly AppCacheName: string = "OpenBox_";
    /**当前游戏版本 */
    public static readonly curVer: string = "v1.2.3"
    /**切割段 |*/
    public static readonly splitCount: string = "|"
    /**切割数量 ; */
    public static readonly splitNum: string = ";"
    /**需要预先加载的bundle */
    public static PreBundle: string[] = ["comprefabs","prefabs"];
    /**数据是否需要加密 */
    public static ecrypt: boolean = false;
    /**预加载音效 */
    static PreAudioRes: any = [];
    /**预加载界面 */
    static PreUIRes: any = [UIID.UIHome]  
    //http地址
    public static httpUrl: string = ""
    //WebSocket地址
    public static  socketUrl: string = ""
    //服务器
    public static readonly ServerType: string = "release"  // test
 

}
