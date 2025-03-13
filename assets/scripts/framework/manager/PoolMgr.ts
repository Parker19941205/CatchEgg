export class PoolNode {
    private _isReady: boolean = false;
    private _createCount: number = 0;
    private _warterMark: number = 50;
    private _node: cc.Node = null;
    private _nodes: Array<cc.Node> = new Array<cc.Node>();

    public init(node: cc.Node, num: number) {
        this._node = node;
        this._isReady = true;
        for (let i = 0; i < num; i++) {
            let n = cc.instantiate(node)
            this._createCount++;
            this._nodes.push(n)
        }
    }
    public getNode(): cc.Node {
        //cc.log("节点数====>",this._nodes.length)
        if (this._nodes.length > 0) {
            //cc.log("对象池里拿")
            return this._nodes.pop();
        } else {
            this._createCount++;
            return cc.instantiate(this._node);
        }
    }
    /**
    * 回收Node实例
    * @param node 要回收的Prefab实例
    */
    public freeNode(nodes: cc.Node) {
        if (!(nodes && cc.isValid(nodes))) {
            this._createCount--;
            return;
        }
        if (this._warterMark < this._nodes.length) {
            this._createCount--;
            nodes.destroy();
        } else {
            nodes.removeFromParent();
            this._nodes.push(nodes);
        }
    }
    /**
   * 设置回收水位
   * @param waterMakr 水位
   */
    public setWaterMark(waterMakr: number) {
        this._warterMark = waterMakr;
    }
    /**
     * 清空
    */
    public destory() {
        // 清空节点、回收资源
        for (let node of this._nodes) {
            node.destroy();
        }
        this._createCount -= this._nodes.length;
        this._nodes.length = 0;
    }
}


export class PoolMgr {
    private static instance: PoolMgr = null;
    protected constructor() { }
    public static getInstance(): PoolMgr {
        if (this.instance == null) {
            this.instance = new PoolMgr();
        }
        return this.instance;
    }
    private poolMap: Map<string, PoolNode> = new Map();
    /**
     * 创建一个节点池
     * @param key key
     * @param node
     * @param num 
     */
    public creatrePool(key: string, node: cc.Node, num: number = 1) {
        let isHas = this.poolMap.has(key)
        if (isHas) {
            let pool = this.poolMap.get(key)
            pool.destory();
            pool = null;
        }
        let pool: PoolNode = new PoolNode();
        if (node) {
            pool.init(node, num)
        }
        this.poolMap.set(key, pool)
    }
    /**
     * 从节点池里获取节点  
     * @param key 
     */
    public getNode(key: string): cc.Node {
        let isHas = this.poolMap.has(key)
        if (!isHas) {
            return null;
        }
        return this.poolMap.get(key).getNode()
    }
    /**
     * 把节点放回池里
     * @param key 
     * @param node 
     */
    public freeNode(key: string, node: cc.Node) {
        let isHas = this.poolMap.has(key)
        if (!isHas) {
            node.destroy();
            return;
        }
        this.poolMap.get(key).freeNode(node)
    }
}