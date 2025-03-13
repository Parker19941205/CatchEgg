import { GAME_MSG_TYPE } from "../../framework/network/MsgEnum";
import { NetManager } from "../../framework/network/NetManager";
import { PlayerMgr } from "./PlayerMgr";

export class GameMgr{
    private static instance: GameMgr;
    private constructor() { }
    public static getInstance(): GameMgr {
        if (this.instance == null) {
            this.instance = new GameMgr();
            this.instance.initData();
        }
        return this.instance;
    }
  
    private initData() {
    }
}
