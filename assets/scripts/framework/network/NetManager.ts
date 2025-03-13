import { NetNode, NetConnectOptions } from "./NetNode";
import { NetData, CallbackObject, NetCallFunc } from "./NetInterface";

/*
*   网络节点管理类
*
*   2019-10-8 by 宝爷
*/

export class NetManager {
    private static _instance: NetManager = null;
    protected _channels: { [key: number]: NetNode } = {};

    public static getInstance(): NetManager {
        if (this._instance == null) {
            this._instance = new NetManager();
        }
        return this._instance;
    }

    // 添加Node，返回ChannelID
    public setNetNode(newNode: NetNode, channelId: number = 0) {
        this._channels[channelId] = newNode;
    }

    // 移除Node
    public removeNetNode(channelId: number) {
        delete this._channels[channelId];
    }

    // 注册消息
    public register(cmd:number,callback:NetCallFunc,target:any,channelId: number = 0) {
        if (this._channels[channelId]) {
            this._channels[channelId].addResponeHandler(cmd,callback,target);
        }
    }
    
    // 移除消息
    public remove(cmd:number,callback:NetCallFunc,target:any,channelId: number = 0) {
        if (this._channels[channelId]) {
            this._channels[channelId].removeResponeHandler(cmd,callback,target);
        }
    }

    // 调用Node连接
    public connect(options: NetConnectOptions, channelId: number = 0,callback?:Function): boolean {
        if (this._channels[channelId]) {
            return this._channels[channelId].connect(options,callback);
        }
        return false;
    }

    // 调用Node发送
    public send(data: object, force: boolean = false, channelId: number = 0): boolean {
        //data["u_id"] = PlayerMgr.getInstance().u_id;
        let buf:NetData = JSON.stringify(data)
        let node = this._channels[channelId];
        if(node) {
            return node.send(buf, force);
        }
        return false;
    }

    // 发起请求，并在在结果返回时调用指定好的回调函数
    public request(data: object, rspObject: CallbackObject, showTips: boolean = true, force: boolean = false, channelId: number = 0) {
        let node = this._channels[channelId];
        let buf:NetData = JSON.stringify(data)
        if(node) {
            node.request(buf, data["mark"], rspObject, showTips, force);
        }
    }

    // 同request，但在request之前会先判断队列中是否已有rspCmd，如有重复的则直接返回
    public requestUnique(buf: NetData, rspCmd: number, rspObject: CallbackObject, showTips: boolean = true, force: boolean = false, channelId: number = 0): boolean {
        let node = this._channels[channelId];
        if(node) {
            return node.requestUnique(buf, rspCmd, rspObject, showTips, force);
        }
        return false;
    }

    // 调用Node关闭
    public close(code?: number, reason?: string, channelId: number = 0) {
        if (this._channels[channelId]) {
            return this._channels[channelId].closeSocket(code, reason);
        }
    }

    // 同步请求
    public sendRequest(data:any,object:any,callBack:Function) {
        let callbackObject:CallbackObject = {target:object,callback:(cmd: number, resqData: any)=>{
            if(callBack){
                callBack(resqData)
            }
        }}
        this.request(data,callbackObject)
    }
  
}