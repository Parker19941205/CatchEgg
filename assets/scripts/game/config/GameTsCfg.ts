export interface LevelDataCfg {
   /**关卡*/
   level: number; 
   /**地图类型*/
   map_type: string; 
   /**尺寸*/
   area_size: string; 
   /**空区*/
   remove_area: string; 
   /**雷数量*/
   mine_num: number; 
   /**最大耗时秒*/
   max_time: number; 
   /**最多复活*/
   max_revive: number; 
   /**最多使用道具*/
   max_prop: number; 

}

export class GameData {
   LevelDataCfg?: LevelDataCfg[];

}