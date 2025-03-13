import { BaseData } from "../../framework/base/BaseData"
import { EventMgr } from "../../framework/manager/EventMgr"
import { EventName, GameConfig } from "../config/Config"

export interface msgData {
    /**玩家uid */
    uid: string;
    /**内容 */
    content: string;
    /**是否已读 */
    isRead: boolean;
}

class Data {
    /**登陆口令 */
    command: string = "";
    /**聊天消息 */
    chatMsg:{[uid:string]:msgData[]} = {};

}

export class GameData extends BaseData {
    data: Data;
    gameKey: string = GameConfig.AppCacheName + "GAME_DATA";

    /**没有数据时候 执行 */
    public createData(): Data {
        this.data = new Data();
        return this.data;
    };

    initData() {
        cc.log("GameData initData")
    }

    getCommand():string{
       return this.data.command;
    }

    setCommand(command:string){
        if(command == null || command == "" ) return
        this.data.command = command;
        this.saveData()

    }

    clearAllData(){
        this.data.command = "";
        this.data.chatMsg = {};
        this.saveData()
    }

    getMsgData(uid:string):msgData[]{
        if(!this.data.chatMsg[uid]){
            this.data.chatMsg[uid] = [];
        }
        return this.data.chatMsg[uid];
    }
 
    setMsgData(uid:string,data:msgData){
        if(!this.data.chatMsg[uid]){
            this.data.chatMsg[uid] = [];
        }
        let msgList:msgData[] = this.data.chatMsg[uid];
        msgList.push(data);
        this.data.chatMsg[uid] = msgList;
        this.saveData()
        EventMgr.getInstance().emit(EventName.RefreshChatMsg)
    }
 
    setReadMsg(uid:string){
        let msgList:msgData[] = this.data.chatMsg[uid];
        for(let msg of msgList){
            msg.isRead = true;
        }
        this.data.chatMsg[uid] = msgList;
        this.saveData()
    }

    isNoReadMsg(){
        for(let uid in this.data.chatMsg){
            let msgList:msgData[] = this.data.chatMsg[uid];
            for(let msg of msgList){
                if(!msg.isRead){
                    return true;
                }
            }
        }
        return false;
    }
}
