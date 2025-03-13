import Logger from "../utils/Logger";
import { TimeUtils } from "../utils/TimeUtils";
import { LogMgr } from "./LogMgr";
export type CompleteCallback<T = any> = (data?: T | null) => void;
export type preloadCompleteCallback<T = any> = (err: Error | null, data?: cc.AssetManager.RequestItem[] | null) => void;

export class ResourceMgr {
    private static instance: ResourceMgr = null;
    private _cacheSpriteframeMap: Map<string, cc.SpriteFrame>
    private _cacheDirMap: Map<string, Map<string, boolean>>;
    private _cacheAssetMap: Map<string, cc.Asset>

    protected constructor() { }
    public static getInstance(): ResourceMgr {
        if (this.instance == null) {
            this.instance = new ResourceMgr();
            this.instance.init()
        }
        return this.instance;
    }

    init() {
        this._cacheSpriteframeMap = new Map<string, cc.SpriteFrame>()
        this._cacheDirMap = new Map<string, Map<string, boolean>>()
        this._cacheAssetMap = new Map<string, cc.Asset>()

    }

    
    clearCache(url) {
        if (this._cacheAssetMap.has(url)) {
            this._cacheAssetMap.delete(url)
        }
    }

    /**
     * 获取bundle
     * @param bundlename 
     * @returns 
     */
    public getBundle(bundlename: string): cc.AssetManager.Bundle {
        return cc.assetManager.getBundle(bundlename);
    }

    /**
     * 加载assets bundle
     * @param bundleName bundle的名字
     * @param callback 
     */
    public loadBundle(bundleName: string, callback: Function) {
        let bundle = cc.assetManager.getBundle(bundleName)
        if (bundle == null) {
            cc.assetManager.loadBundle(bundleName, (er: Error, bunlde2: cc.AssetManager.Bundle) => {
                if (er) {
                    LogMgr.getInstance().error(bundleName + "bundle load error :" + er)
                    return;
                }
                //LogMgr.getInstance().debug("加载bundle:" + bundleName)
                callback(bunlde2)
            })
        } else {
            callback(bundle)
        }
    }
    /**预加载资源 */
    public preloadFromBundle(bundle: cc.AssetManager.Bundle, path: string[], callback?: preloadCompleteCallback) {
        bundle.preload(path, cc.Asset, (er: Error, resArr: cc.AssetManager.RequestItem[]) => {
            if (callback) {
                callback(er, resArr)
            }
        })
    }

    /**
     * eg:
     * let bundles: string[] = ["scene", "prefabs"]
     * let pathsMap: Map<number, string[]> = new Map();
     * pathsMap.set(0, ["pic1","pic2"])
     * pathsMap.set(1, ["UITop", "UIChapter"])
     * 加载bundle并且加载资源
     * @param bundleNames 需要加载的bundle数组  
     * @param preloadPathMap 对应的资源路径  
     */
    public relLoadBundle(bundleNames: string[], preloadPathMap?: Map<number, string[]>) {
        for (let i = 0; i < bundleNames.length; i++) {
            let bundleName = bundleNames[i]
            this.loadBundle(bundleName, (bundle: cc.AssetManager.Bundle) => {
                if (preloadPathMap) {
                    let paths = preloadPathMap.get(i)
                    bundle.load(paths)
                }
            })
        }
    }
    /**
     * 从resources文件中加载资源
     * @param path 资源路径
     * @param callback 回调
     */
    public loadFromRes(path: string, callback: CompleteCallback) {
        this.loadRes("resources", path, callback)
    }
    public loadDirFrom(dir: string, callback: CompleteCallback) {
        this.loadDir("resources", dir, callback)
    }
    /**加载图片 */
    public loadSpriteframe(bundleName: string, path: string, callback: CompleteCallback) {
        let bundle = cc.assetManager.getBundle(bundleName)
        //cc.log("加载图片bundle=====>",bundle)
        if (bundle == null) {
            ResourceMgr.getInstance().loadBundle(bundleName, (bundle2: cc.AssetManager.Bundle) => {
                bundle2.load(path, cc.SpriteFrame, (er: Error, res: cc.SpriteFrame) => {
                    if (er) {
                        LogMgr.getInstance().error("loadres error path:" + path + "  error:", er.message)
                        return;
                    }
                    res.addRef();
                    if (callback) {
                        callback(res);
                    }
                })
            })
        } else {
            bundle.load(path, cc.SpriteFrame, (er: Error, res: cc.SpriteFrame) => {
                if (er) {
                    LogMgr.getInstance().error("loadres error path:" + path + "  error:" + er)
                    return;
                }
                res.addRef();
                if (callback) {
                    callback(res);
                }
            })
        }
    }
    public loadRes(bundleName: string, path: string, callback: CompleteCallback) {
        //cc.log("加载bundleName======>",bundleName,path)
        let bundle = cc.assetManager.getBundle(bundleName)
        if (bundle == null) {
            ResourceMgr.getInstance().loadBundle(bundleName, (bundle2: cc.AssetManager.Bundle) => {
                bundle2.load(path, cc.Asset, (er: Error, res: cc.Asset) => {
                    if (er) {
                        LogMgr.getInstance().error("loadres error path:" + path + "  error:", er.message)
                        return;
                    }
                    res.addRef();
                    if (callback) {
                        callback(res);
                    }
                })
            })
        } else {
            bundle.load(path, cc.Asset, (er: Error, res: cc.Asset) => {
                if (er) {
                    LogMgr.getInstance().error("loadres error path:" + path + "  error:" + er)
                    return;
                }
                res.addRef();
                if (callback) {
                    callback(res);
                }
            })
        }
    }
    public loadDir(bundleName: string, path: string, callback: CompleteCallback) {
        let bundle = cc.assetManager.getBundle(bundleName)
        if (bundle == null) {
            cc.assetManager.loadBundle(bundleName, (er: Error, bundle2: cc.AssetManager.Bundle) => {
                bundle2.loadDir(path, cc.Asset, (er: Error, res: cc.Asset[]) => {
                    if (er) {
                        LogMgr.getInstance().error("loadres error path:" + path + "  error:" + er)
                        return;
                    }
                    if (callback) {
                        callback(res);
                    }
                })
            })
        } else {
            bundle.loadDir(path, cc.Asset, (er: Error, res: cc.Asset[]) => {
                if (er) {
                    LogMgr.getInstance().error("loadres error path:" + path + "  error:" + er)
                    return;
                }
                if (callback) {
                    callback(res);
                }
            })
        }

    }

    /**从bundle释放一个资源 */
    public releaseByBundle(bundle: cc.AssetManager.Bundle, path: string) {
        bundle.release(path)
    }
    /**根据bundle名字释放一个资源 */
    public releaseByBname(bundleName: string, path: string) {
        let bundle = cc.assetManager.getBundle(bundleName)
        if (bundle) {
            bundle.release(path)
        }
    }

    public releaseBundle(bundleName: string) {
        let bundle = cc.assetManager.getBundle(bundleName)
        if (bundle) {
            cc.assetManager.removeBundle(bundle)
        }
    }

     /**
     * 获取远程资源SpriteFrame
     * @param url 
     * @param finish 
     * @param target 
     */
     getUrlCacheSpriteframeAsyn(url: string, finish: (res: cc.SpriteFrame) => void, target?: any) {
        //cc.log("远程url====>",url)
        if (this._cacheSpriteframeMap.has(url)) {
            if (target)
                finish.call(target, this._cacheSpriteframeMap.get(url))
            else
                finish(this._cacheSpriteframeMap.get(url))
               //Logger.info("_cacheSpriteframeMap缓存资源")
        }
        this.getUrlCacheAssetAsyn<cc.Texture2D>(url, (tex: cc.Texture2D) => {
            let sp: cc.SpriteFrame = new cc.SpriteFrame(tex)
            this._cacheSpriteframeMap.set(url, sp)
            if (target)
                finish.call(target, sp)
            else
                finish(sp)
        })
    }

      /**
     * 异步获取远程资源
     * @param url 
     * @param finish 
     * @param target 
     */
      getUrlCacheAssetAsyn<T extends cc.Asset>(url: string, finish: (asset: T) => void, target?: any) {
        //Logger.info("异步获取远程资源")
        let func: (asset: T) => void = (res: T) => {
            if (target)
                finish.call(target, res)
            else
                finish(res)
        }
        if (this._cacheAssetMap.has(url)) {
            func(this._cacheAssetMap.get(url) as T)
        } else {
            this._loadNoCacheUrlAssetAsyn(url, (res: T) => {
                // tag
                this._saveByDir(cc.path.dirname(url), url);

                this._cacheAssetMap.set(url, res)
                func(res)
            })
        }
    }

    private _loadNoCacheUrlAssetAsyn<T extends cc.Asset>(url: string, finish: (asset: T) => void) {
        // 远程 url 带图片后缀名
        cc.assetManager.loadRemote<T>(url, function (err, res: T) {
            //Logger.info("请求远程资源：", err,res)
            if (!err) {
                finish(res)
            } else {
                Logger.info("远程资源：", url, "加载失败")
            }
        })
    }

    private _saveByDir(dir: string, assetPath: string): void {
        let assets = this._cacheDirMap.get(dir);
        if (!assets) {
            assets = new Map<string, boolean>();
            this._cacheDirMap.set(dir, assets);
        }

        // set
        assets.set(assetPath, true);
    }


    /**
     * 加载远程龙骨
     * @param skeletonUrl 骨架数据
     * @param atlasUrl 纹理数据
     * @param textureUrl 纹理图片
     * @param armatureName 骨架名称
     * @param animalAni 龙骨对象
     * @param animationName 动画名称
     * */
    public loadRemoteDragonBones(animalAni:dragonBones.ArmatureDisplay,skeletonUrl:string,atlasUrl:string,textureUrl:string,armatureName:string,animationName:string = "newAnimation") {
        // 加载骨架数据
        cc.assetManager.loadRemote(skeletonUrl, { ext: '.json' }, (err, skeletonJson) => {
            if (err) {
                console.error('Failed to load skeleton data:', err);
                return;
            }

            // 加载纹理数据
            cc.assetManager.loadRemote(atlasUrl, { ext: '.json' }, (err, atlasJson) => {
                if (err) {
                    console.error('Failed to load atlas data:', err);
                    return;
                }

                // 加载纹理图片
                cc.assetManager.loadRemote(textureUrl, { ext: '.png' }, (err, texture:cc.Texture2D) => {
                    if (err) {
                        console.error('Failed to load texture:', err);
                        return;
                    }

                    // 创建新的 DragonBonesAsset 和 DragonBonesAtlasAsset
                    let skeletonData = new dragonBones.DragonBonesAsset();
                    skeletonData.dragonBonesJson = JSON.stringify(skeletonJson["json"]);

                    let newAtlasData = new dragonBones.DragonBonesAtlasAsset();
                    newAtlasData.atlasJson = JSON.stringify(atlasJson["json"]);
                    newAtlasData.texture = texture;

                    //cc.log('成功加载远程 DragonBones 数据',skeletonJson,atlasJson,texture);
                    animalAni.dragonAsset = skeletonData;
                    animalAni.dragonAtlasAsset = newAtlasData;
    
                    animalAni.armatureName = armatureName; //骨架名称
                    animalAni.playAnimation(animationName, 0); //动画名称

                });
            });
        });
    }

    /**
     * 加载远程spine骨骼动画
     * @param atlasUrl 纹理数据
     * @param textureUrl 纹理图片
     * @param jsonUrl spine json
     * @param spine spine对象
     * @param animationName 动画名称
    * */
    public loadRemoteSpine(spine:sp.Skeleton,jsonUrl:string,atlasUrl:string,textureUrl:string,animationName:string = "stand",loadCall?:Function) {
        cc.assetManager.loadRemote(jsonUrl, { ext: '.txt' }, (err, jsonData:cc.TextAsset) => {
            if (err) {
                console.error('加载远程 Spine JSON 失败: ', err);
                return;
            }
        
            cc.assetManager.loadRemote(atlasUrl, { ext: '.txt' }, (err, atlasData:cc.TextAsset) => {
                if (err) {
                    console.error('加载远程 Spine Atlas 失败: ', err);
                    return;
                }
        
                cc.assetManager.loadRemote(textureUrl,cc.Texture2D, (err, texture:cc.Texture2D) => {
                    if (err) {
                        console.error('加载远程纹理失败: ', err);
                        return;
                    }
                    //cc.log("jsonData===>",jsonData)
                    let url = new URL(textureUrl);
                    let textureNames = url.pathname.split("/").pop();
                    let spineData = new sp.SkeletonData();
                    spineData.skeletonJson = jsonData["text"];
                    spineData.atlasText = atlasData["text"];
                    spineData.textures = [texture];
                    spineData["textureNames"] = [textureNames]

                    spine.skeletonData = spineData
                    spine.setAnimation(0, animationName, true);

                    let backData = [jsonData,atlasData,texture]
                    if(loadCall){
                        loadCall(backData)
                    }
                });
            });
        });
    }
 
    /**
     * 加载远程音频
     * @param url 远程音频地址
     * @param finish 加载完成回调
     * */
    public loadRemoteAudio(url: string, finish: (asset: cc.AudioClip) => void) {
        // 远程 url 带图片后缀名
        cc.assetManager.loadRemote(url, function (err, res: cc.AudioClip) {
            //Logger.info("加载远程音频", err,res)
            if (!err) {
                Logger.info("res111:", res)
                finish(res)
            } else {
                Logger.info("远程资源：", url, "加载失败")
            }
        })
    }











}