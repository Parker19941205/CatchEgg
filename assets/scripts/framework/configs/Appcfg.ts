export enum OrderLayer {
    /**主层（界面全屏使用） */
    main = 0,
    /**特殊层 */
    special = 50,
    /**弹框() */
    pop = 100,
    /**top层 */
    top = 200,
    pop2 = 300,
    /**tip */
    tip = 400,
    guide = 900,
    /**touch */
    touch = 1000,
}
/**加载的进度 */
export enum LoadingProcess {
    /**开始加载 */
    StartLoading = 5,
    /**加载配置 */
    ExcelCfg = 10,
    /**加载用户数据 */
    PlayerCfg = 20,
    /**加载资源 */
    ResCfg = 40,
    /**加载音效 */
    AudioCfg = 60,
    /**加载其他 */
    OtherCfg = 99,
    /**加载结束 */
    EndLoading = 100,
}
/** UI配置结构体 */
export interface UIConf {
    /**路径 */
    prefab: string;
    /**层 */
    zIndex: number;
    /**节点名称 */
    name: string;
    /**是否显示TopUI */
    showTop?: boolean
    /**所属assetsbundle */
    bundleName: string;
    fps?: number
}
/**声音资源 */
export interface Audiocfg {
    /**资源路径 */
    path: string;
    /**资源的assets bundle */
    bundle: string;
}

/**权重的类 */
export class WeightObject {
    id: number;
    weight: number;
}

export class ObjectValue {
    key: number;
    value: number;
}
export class ObjectWeightValue {
    id: number;
    num: number;
    weight: number;
}

export interface Servercfg {
    /**httpUrl路径 */
    httpUrl: string;
    /**socketUrl路径 */
    socketUrl: string;
}

/**===========================事件配置============================= */
export enum BaseEventName {
    /**loading界面 */
    Loading = "Loading",
    /**打开了一个ui */
    OpenUI = "openUi",
    /**关闭一个界面 */
    CloseUI = "CloseUI",
    /**需要显示顶部ui */
    ShowTopUI = "ShowTopUI",
}