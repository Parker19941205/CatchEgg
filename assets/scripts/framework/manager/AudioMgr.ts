import { GameConfig } from "../../game/config/Config";
import { Audiocfg } from "../configs/Appcfg";
import { CacheUtils } from "../utils/CacheUtils";
import { LogMgr } from "./LogMgr";
import { ResourceMgr } from "./ResourceMgr";

export class AudioMgr {
    private static instance: AudioMgr;
    private constructor() { }
    public static getInstance(): AudioMgr {
        if (this.instance == null) {
            this.instance = new AudioMgr();
        }
        return this.instance;
    }
    private audioSourceMap: Map<string, cc.AudioSource> = new Map();
    private audioClipMap: Map<string, cc.AudioClip> = new Map();
    private EffectAduioSource: cc.AudioSource
    /** UI配置 */
    private ADConf: { [key: string]: Audiocfg } = {};
    private otherADConf: { [key: string]: Audiocfg }[] = [];
    public init(cnf: { [key: string]: Audiocfg }) {
        this.ADConf = cnf
    }
    public loadAudio(audId: any, callback: Function) {
        let cfg = this.getAdConf(audId)
        if (!cfg) {
            LogMgr.getInstance().error("音效没有配置：", audId)
            return;
        }
        ResourceMgr.getInstance().loadRes(cfg.bundle, cfg.path, (res: cc.AudioClip) => {
            this.audioClipMap.set(cfg.path, res)
            if (callback) {
                callback();
            }
        })
    }
    public addAdConf(conf: { [key: string]: Audiocfg }) {
        this.otherADConf.push(conf)
    }
    public getAdConf(uid: any): Audiocfg {
        let conf = this.ADConf[uid]
        if (conf) {
            return conf;
        }
        for (let i = 0; i < this.otherADConf.length; i++) {
            let conf = this.otherADConf[i]
            let c = conf[uid]
            if (c) {
                return c;
            }
        }
        return null;
    }


    /**
    * 创建一个AudioSource
    * @param name audioSource的名字
    */
    public creatreAudioSource(name: string): cc.AudioSource {
        let audioEngine: cc.AudioSource = new cc.AudioSource();
        if (this.audioSourceMap.has(name)) {
            //已经存在了 以前的销毁
            this.audioSourceMap.get(name).destroy();
        }
        this.audioSourceMap.set(name, audioEngine)
        return audioEngine;
    }
    /**
     * 获取一个AudioSource 没有的话自动创建
     * @param name audioSource的名字
     */
    public getAudioSource(name: string): cc.AudioSource {
        if (this.audioSourceMap.has(name)) {
            return this.audioSourceMap.get(name)
        }
        return this.creatreAudioSource(name)
    }
    /**播放一个背景音乐 */
    public playMusic(audio: string, loop: boolean = true, volume: number = 1) {
        if (CacheUtils.canPlayMusin()) {
            let audioSource = this.getAudioSource(audio)
            if (audioSource == null) {
                LogMgr.getInstance().error("audioSourceName：" + audio + "不存在")
                return;
            }
            //默认关闭前面的
            audioSource.stop();
            let cfg = this.getAdConf(audio)
            if (cfg == null) {
                LogMgr.getInstance().error("audio id:" + audio + "不存在")
                return;
            }
            let ishas = this.audioClipMap.has(cfg.path)
            if (ishas) {
                let clip = this.audioClipMap.get(cfg.path)
                audioSource.clip = clip;
                audioSource.loop = loop;
                audioSource.volume = volume
                audioSource.play()
            } else {
                ResourceMgr.getInstance().loadRes(cfg.bundle, cfg.path, (res: cc.AudioClip) => {
                    audioSource.clip = res;
                    this.audioClipMap.set(cfg.path, res)
                    audioSource.loop = loop;
                    audioSource.volume = volume
                    audioSource.play()
                })
            }
        }
    }
    /**暂停一个音乐 */
    public pauseMusic(audioSourceName: string) {
        let audioSource = this.getAudioSource(audioSourceName)
        if (audioSource == null) {
            LogMgr.getInstance().error("audioSourceName：" + audioSourceName + "不存在")
            return;
        }
        audioSource.pause();
    }
    /**恢复一个音乐 */
    public resumeMusic(audioSourceName: string) {
        let audioSource = this.getAudioSource(audioSourceName)
        if (audioSource == null) {
            LogMgr.getInstance().error("audioSourceName：" + audioSourceName + "不存在")
            return;
        }
        audioSource.resume();

    }
    /**关闭一个音乐 */
    public stopMusic(audioSourceName: string) {
        let audioSource = this.getAudioSource(audioSourceName)
        if (audioSource == null) {
            LogMgr.getInstance().error("audioSourceName：" + audioSourceName + "不存在")
            return;
        }
        audioSource.stop();
    }
    /**关闭所有的音乐 */
    public stopAll() {
        this.audioSourceMap.forEach((audioSource: cc.AudioSource, name: string) => {
            audioSource.stop();
        })
    }

    /**暂停所有的音乐 */
    public pauseAll() {
        this.audioSourceMap.forEach((audioSource: cc.AudioSource, name: string) => {
            audioSource.pause();
        })
    }

    /**恢复所有的音乐 */
    public resumeAll() {
        this.audioSourceMap.forEach((audioSource: cc.AudioSource, name: string) => {
            audioSource.resume();
        })
    }

    /**
     * 播放一个音效
     * @param audioId 
     * @param volume 
     * @param customAudio 是否自定义AudioSource
     */
    public playEffect(audioId: any, volume: number = 1,customAudio:boolean = false) {
        if (CacheUtils.canPlayEffect()) {
            let audioSource = null
            if(customAudio){
                audioSource = this.getAudioSource(audioId)
            }else{
                audioSource = this.EffectAduioSource
                if (audioSource == null) {
                    //创建一个
                    audioSource = this.getAudioSource("effect")
                } 
            }

            let cfg = this.getAdConf(audioId)
            let ishas = this.audioClipMap.has(cfg.path)
            if (ishas) {
                let clip = this.audioClipMap.get(cfg.path)
                audioSource.clip = clip;
                audioSource.volume = volume;
                audioSource.play()
            } else {
                ResourceMgr.getInstance().loadRes(cfg.bundle, cfg.path, (res: cc.AudioClip) => {
                    this.audioClipMap.set(cfg.path, res)
                    audioSource.clip = res;
                    audioSource.volume = volume;
                    audioSource.play()
                })
            }
        }
    }

    public stopEffect(audioId?: string) {
        let audioSource = null
        if(audioId){
            audioSource = this.getAudioSource(audioId)
        }else{
            audioSource = this.getAudioSource("effect")
        }
        if (audioSource) {
            audioSource.stop();
        }
    }
    private normalButtonAudio: any;
    /**设置点击按钮的默认音效 */
    public setButtonNomalAudio(audioId: any) {
        this.normalButtonAudio = audioId;
    }

    /**默认的点击音效 */
    public playAudioButtonClicked() {
        if (this.normalButtonAudio) {
            this.playEffect(this.normalButtonAudio,0.2)
        }
    }

    /**播放一个远程背景音乐 */
    public playRemoteMusic(audio: string,url: string, loop: boolean = true, volume: number = 1) {
        if (CacheUtils.canPlayMusin()) {
            let audioSource = this.getAudioSource(audio)
            if (audioSource == null) {
                LogMgr.getInstance().error("audioSourceName：" + audio + "不存在")
                return;
            }
            //默认关闭前面的
            audioSource.stop();
         
            let ishas = this.audioClipMap.has(audio)
            if (ishas) {
                let clip = this.audioClipMap.get(audio)
                audioSource.clip = clip;
                audioSource.loop = loop;
                audioSource.volume = volume
                audioSource.play()
            } else {
                let newurl = GameConfig.httpUrl + url
                ResourceMgr.getInstance().loadRemoteAudio(newurl, (res: cc.AudioClip) => {
                    audioSource.clip = res;
                    this.audioClipMap.set(audio, res)
                    audioSource.loop = loop;
                    audioSource.volume = volume
                    audioSource.play()
                })
            }
        }
    }


}