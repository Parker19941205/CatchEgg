import { GameConfig } from "../../game/config/Config"
import { Utils } from "./Utils"

export class CacheUtils {

    /**
     * 保存数据到本地
     * @param key 
     * @param data 
     */
    public static saveData(key: string, data: string) {
        localStorage.setItem(key, data)
    }
    /**
     * 从本地获取数据
     * @param key 
     */
    public static getData(key: string): string {
        return localStorage.getItem(key)
    }

    /**
     * 保存数据到本地(加密) 注：不支持中文
     * @param key 
     * @param data 
     * @param pwd 密码
     */
    public static saveDataEncrypt(key: string, data: string, pwd: string) {
        let d = Utils.encrypt(data, pwd)
        this.saveData(key, d)
    }
    /**
     * 从本地获取加密的数据并且解密返回
     * @param key 
     * @param pwd 密码
     */
    public static getDataDecrypt(key: string, pwd: string): string {
        let data = this.getData(key)
        let d = Utils.decrypt(data, pwd)
        return d;
    }

    /**
     * 是否可以播放音乐 
     */
    public static canPlayMusin(): boolean {
        let music = this.getData(GameConfig.AppCacheName + "MUSIC")
        if (music) {
            if (music == "0") {
                return false;
            }
        }
        return true;
    }
    /**
     * 是否可以播放音效
     */
    public static canPlayEffect(): boolean {
        let effect = this.getData(GameConfig.AppCacheName + "EFFECT")
        if (effect) {
            if (effect == "0") {
                return false;
            }
        }
        return true;
    }
    /**
     * 设置是否可以播放音乐
     * @param isOn 是否可以播放 true代表可以播放
     */
    public static setPlayMusic(isOn: boolean) {
        if (isOn) {
            this.saveData(GameConfig.AppCacheName + "MUSIC", "1")
        } else {
            this.saveData(GameConfig.AppCacheName + "MUSIC", "0")
        }
    }
    /**
        * 设置是否可以播放音效
        * @param isOn 是否可以播放 true代表可以播放
        */
    public static setPlayEffect(isOn: boolean) {
        if (isOn) {
            this.saveData(GameConfig.AppCacheName + "EFFECT", "1")
        } else {
            this.saveData(GameConfig.AppCacheName + "EFFECT", "0")
        }
    }
}