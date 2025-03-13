import GridExtent from "./GridExtent";

const { ccclass, property, menu } = cc._decorator;

class ExchangeInterface {
    constructor(num1: number, num2: number) {
        this.num1 = num1
        this.num2 = num2

    }
    num1: number
    num2: number
    has(num1: number, num2: number) {
        if (num1 == this.num1 || num1 == this.num2 || num2 == this.num1 || num2 == this.num2)
            return true
        return false
    }
    equal(num1: number, num2: number) {
        return num1 == this.num1 && num2 == this.num2
    }
}

@ccclass
@menu('Ui/List Extent')
export default class ListExtent extends cc.ScrollView {
    @property(cc.Node)
    itemEx: cc.Node = null
    @property(cc.Prefab) itemPrefabEx: cc.Prefab = null
    @property({ displayName: "scale" }) prefabScale: number = 1

    @property({
        displayName: "虚拟列表", tooltip: "只能搭配GridExtent组件才生效"
    })
    virtualList: boolean = false
    @property({
        tooltip: "超出视野范围外item数量"
    })
    outViewNum: number = 2

    itemCallback: (node: cc.Node, data: any, index?: number) => void
    target: any
    list: cc.ScrollView
    haveInit: boolean
    layout: cc.Layout
    grid: GridExtent
    private _contentInitY: number
    private _contentInitX: number
    private _maxHangNum: number = 0 //最大行/列
    private _curViewMinHang: number //当前显示最小行
    private _curViewMaxHang: number //当前显示最大行
    private _oldMinHang: number //上一次视野范围最小行
    private _oldMaxHang: number //上一次视野范围最大行
    private _curViewSpace: number
    private _isInit: boolean = false
    listItems: Map<number, cc.Node>
    listData: any[]
    scale: number = 1

    protected start(): void {
        this.init()
    }
    private init() {
        if (this.haveInit) {
            return
        }
        if (this.itemEx) {
            this.itemEx.active = false
            this.scale = this.itemEx.scale
        }
        this.listItems = new Map<number, cc.Node>()
        this.list = this.node.getComponent(cc.ScrollView)
        this.layout = this.list.content.getComponent(cc.Layout)
        this.grid = this.list.content.getComponent(GridExtent)
        if (!this.grid) //虚拟列表必须搭配GridExtent组件才生效
            this.virtualList = false
        this._contentInitX = this.list.node.width * (1 - this.list.node.anchorX)
        this._contentInitY = this.list.node.height * (1 - this.list.node.anchorY)

        this.list.node.on("scrolling", this.updateContent, this)
        this.haveInit = true
    }

    public updateContent() {
        if (!this._isInit)
            return
        if (!this.virtualList)
            return
        if (this.list.horizontal) { //水平滚动
            //暂时不支持水平滚动虚拟列表
        } else { //垂直滚动
            //计算视野范围内的行数
            let ch = this.grid.cellHeight
            let sy = this.grid.spaceY
            let min = this.content.y - this._contentInitY
            let max = min + this.list.node.height
            let minHang = Math.floor((min - ch) / (ch + sy)) + 1
            let maxHang = Math.floor((max - ch) / (ch + sy)) + 1
            minHang = minHang < 0 ? 0 : minHang
            let minMax = this._maxHangNum - this._curViewSpace - - this.outViewNum
            if (minHang > minMax) {
                minHang = minMax
            }
            maxHang = maxHang > this._maxHangNum ? this._maxHangNum : maxHang
            let maxMin = this._curViewSpace - this.outViewNum
            if (maxHang < maxMin) {
                maxHang = maxMin
            }
            this.updateContentView(minHang, maxHang)
        }
    }

    updateContentView(min: number, max: number) {
        if (min == this._oldMinHang && max == this._oldMaxHang)
            return
        let dir = max > this._oldMaxHang || min > this._oldMinHang //滑动方向
        if (dir) { //向下滑
            if (max >= this._curViewMaxHang) {
                // let t1 = TimeUtil.curTimestampMSecond()
                if (max < this._maxHangNum) {
                    let len = max - this._curViewMaxHang
                    for (let i = 0; i <= len; i++) {
                        if (i > this._curViewSpace)
                            continue
                        let num1 = this._curViewMinHang + i
                        let num2 = max + 1 - i
                        if (num1 >= 0 && num2 <= this._maxHangNum) {
                            this.changeHangAsyne(new ExchangeInterface(num1, num2))
                            // cc.log(`向下滑,交换行：${num1}->${num2}`)
                        }
                    }
                    this._curViewMinHang = this._curViewMinHang + len + 1
                    this._curViewMaxHang = this._curViewMinHang + this._curViewSpace
                } else {
                    if (this.outViewNum == 1 && this._curViewMaxHang == this._maxHangNum - 1) {
                        this.changeHangAsyne(new ExchangeInterface(this._curViewMinHang, this._maxHangNum))
                        // cc.log(`向下滑,交换行：${this._curViewMinHang}->${this._maxHangNum}`)
                        this._curViewMaxHang = this._maxHangNum
                        this._curViewMinHang = this._curViewMaxHang - this._curViewSpace
                    }
                }

                // let t2 = TimeUtil.curTimestampMSecond()
                // cc.log(`滑动,向下滑，刷新显示,耗时：${t2 - t1}ms`, this._curViewMinHang, this._curViewMaxHang, min, max)
            }
        } else {
            if (min <= this._curViewMinHang) {
                // let t1 = TimeUtil.curTimestampMSecond()
                if (min > 0) {
                    let len = this._curViewMinHang - min
                    for (let i = 0; i <= len; i++) {
                        if (i > this._curViewSpace)
                            continue
                        let num1 = this._curViewMaxHang - i
                        let num2 = min - 1 + i
                        if (num2 >= 0 && num1 <= this._maxHangNum) {
                            this.changeHangAsyne(new ExchangeInterface(num1, num2))
                            // cc.log(`向上滑,交换行：${num1}->${num2}`)
                        }
                    }
                    this._curViewMaxHang = this._curViewMaxHang - len - 1
                    this._curViewMinHang = this._curViewMaxHang - this._curViewSpace
                } else {
                    if (this.outViewNum == 1 && this._curViewMinHang == 1) {
                        this.changeHangAsyne(new ExchangeInterface(this._curViewMaxHang, 0))
                        // cc.log(`向上滑,交换行：${this._curViewMaxHang}->${0}`)
                        this._curViewMinHang = 0
                        this._curViewMaxHang = this._curViewSpace
                    }
                }

                // let t2 = TimeUtil.curTimestampMSecond()
                // cc.log(`滑动,向上滑，刷新显示,耗时：${t2 - t1}ms`, this._curViewMinHang, this._curViewMaxHang, min, max)
            }
        }
        this._oldMinHang = min
        this._oldMaxHang = max
    }
    private _exchangeingList: ExchangeInterface[]  //正在进行列表
    private _waitExchangeList: ExchangeInterface[] //等待执行列表
    checkInExchange(list: ExchangeInterface[], data: ExchangeInterface) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].has(data.num1, data.num2)) {
                return true
            }
        }
        return false
    }
    checkHaveExchange(list: ExchangeInterface[], data: ExchangeInterface) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].equal(data.num1, data.num2)) {
                return true
            }
        }
        return false
    }
    changeHangAsyne(data: ExchangeInterface) {
        let num1 = data.num1
        let num2 = data.num2
        if (this.checkHaveExchange(this._exchangeingList, data)) {
            return
        }
        if (this.checkInExchange(this._exchangeingList, data)) { //正在被交换，加入等待列表
            if (!this.checkHaveExchange(this._waitExchangeList, data))
                this._waitExchangeList.push(data)
            return
        }
        if (this._exchangeingList.length > 0) {
            if (this.checkHaveExchange(this._waitExchangeList, data)) {
                return
            }
            if (this.checkInExchange(this._waitExchangeList, data)) { //正在等待被交换，加入等待列表
                this._waitExchangeList.push(data)
                return
            }
        }
        this._exchangeingList.push(data)
        this._executePerFrame(this._getItemChangeGenerator(num1, num2), 2, () => {
            this._exchangeingList.splice(this._exchangeingList.indexOf(data), 1)
            if (this._waitExchangeList.length > 0) {
                this.changeHangAsyne(this._waitExchangeList.shift())
            }
        }, this)
    }


    private *_getItemChangeGenerator(num1: number, num2: number) {
        let len = this.grid.lie > 0 ? this.grid.lie : 0
        for (let i = 0; i < len; i++) {
            yield this.changeCell(num1, num2, i)
        }
    }


    changeHangOrLie(num1: number, num2: number) {
        if (num1 == num2)
            return
        let len = this.grid.lie > 0 ? this.grid.lie : 0
        for (let i = 0; i < len; i++) {
            this.changeCell(num1, num2, i)
        }
    }
    async changeCell(num1: number, num2: number, index: number) {
        let len = this.grid.lie > 0 ? this.grid.lie : 0
        let max = this.listData.length
        let index1 = num1 * len + index
        let index2 = num2 * len + index
        // cc.log(`滑动，交换格子：${index1}->${index2}`, num1, num2, index, len, max)
        let node: cc.Node = this.listItems.get(index1)
        if (node) {
            node.name = index2 + ""
            node.active = index2 < max
            this.grid.refreshChildHeight(node, num2)
            this.listItems.set(index2, node)
            this.listItems.delete(index1)
            if (index2 >= 0 && index2 < this.listData.length && this.itemCallback) {
                try {
                    this.itemCallback.call(this.target, node, this.listData[index2], index2)
                } catch (error) {
                    cc.error(error);
                }
            }
            // cc.log("滑动", node.name, node.active, node.x, node.y)

        } else {
            cc.error("滑动,虚拟列表计算错误1，请检查！！")
        }
    }

    private _addId = 0
    private _excuting: Map<number, boolean> = new Map<number, boolean>()
    private _executePerFrame(generator: Generator, duration: number, callback?: Function, target?: any, executeReurn?: any[]) {
        let gen = generator;
        let id = this._addId
        let self = this
        let execute = () => {
            if (!self._excuting.get(id)) {
                gen = null
            }
            if (gen) {
                let startTime = new Date().getTime();
                for (let iter = gen.next(); ; iter = gen.next()) {
                    if (executeReurn && iter.value) {
                        executeReurn.push(iter.value)
                    }
                    if (iter == null || iter.done) {
                        if (callback) {
                            callback.call(target, executeReurn)
                        }
                        self._excuting.delete(id)
                        return;
                    }
                    if (new Date().getTime() - startTime > duration) {
                        self.scheduleOnce(() => {
                            execute();
                        });
                        return;
                    }
                }
            }
        };
        this._excuting.set(id, true)
        this._addId++
        execute();
    }
    /**
     * 
     * @param func item data index
     * @param target 
     */
    setItemRenderer(func: (node: cc.Node, data: any, index?: number) => void, target: any) {
        this.itemCallback = func
        this.target = target
    }
    private *_getItemGenerator(data: any[], len?: number) {
        len = len ? len : data.length
        for (let i = 0; i < len; i++) {
            yield this.itemGenerator(len, i, data[i])
        }
    }
    private itemGenerator(len: number, i: number, data: any) {
        let item = this._initItem(i, data);
        if (this.grid)
            this.grid.refreshChild(len, item, i)
        if (this.itemCallback) {
            this.itemCallback.call(this.target, item, data, i)
        }
        return item
    }

    private instantiate(parent: cc.Node) {
        let node: cc.Node
        if (this.itemEx) {
            node = cc.instantiate(this.itemEx)
            node.scale = this.scale
        } else if (this.itemPrefabEx) {
            node = cc.instantiate(this.itemPrefabEx)
            node.scale = this.prefabScale
        }
        node.parent = parent
        return node
    }
    private _initItem(itemIndex: number, data) {
        let child = this.list.content.children[itemIndex]
        let item: cc.Node = child || this.instantiate(this.list.content)
        item.name = itemIndex + ""
        item.active = true
        this.listItems.set(itemIndex, item)

        return item
    }



    getMaxNum(total: number) {
        if (this.virtualList) {
            if (this.list.horizontal) { //水平滚动
                let lie = (Math.ceil(this.list.node.width / (this.grid.cellWidth + this.grid.spaceX)) + this.outViewNum)
                let num = lie * this.grid.hang
                if (num > total) num = total
                return [lie, num]
            } else { //垂直滚动
                let hang = (Math.ceil(this.list.node.height / (this.grid.cellHeight + this.grid.spaceY)) + this.outViewNum)
                let num = hang * this.grid.lie
                if (num > total) num = total
                return [hang, num]
            }
        } else {
            return [0, total]
        }
    }
    setNumItemsInterval(data: any[], interval: number, callback?: Function, target?: any) {
        let items = []
        let len = this.setNumItemInit(data)
        this.unscheduleAllCallbacks()
        let i = 0
        this.schedule(() => {
            let n = this.itemGenerator(len, i, data[i])
            items.push(n)
            i++
            if (i == len) {
                this._isInit = true
                callback?.call(target)
            }
        }, interval, len - 1)
    }

    /**
     * 
     * @param data 
     * @param immediately 0 立即执行, > 0 分帧加载时间（毫秒）(同步才有返回)
     * @param callback 分帧加载回调
     */
    setNumItems(data: any[], immediately: number = 0, callback?: Function, target?) {
        let items = []
        let len = this.setNumItemInit(data)
        if (immediately <= 0) {
            for (let i = 0; i < len; i++) {
                let n = this.itemGenerator(len, i, data[i])
                items.push(n)
            }
            this._isInit = true
            if (callback)
                callback.call(target)
        } else {
            this.stopLastExecutePerFrame()
            this._executePerFrame(this._getItemGenerator(data, len), immediately, () => {
                this._isInit = true
                if (callback)
                    callback.call(target)
            }, this, items)
        }

        return items
    }

    private setNumItemInit(data: any[]) {
        this.init()
        if (this.grid) {
            this._maxHangNum = this.grid.lie > 0 ? Math.floor(data.length / this.grid.lie) : (this.grid.hang > 0 ? Math.floor(data.length / this.grid.hang) : 0)
        }
        this.listData = data
        let [hang, len] = this.getMaxNum(data.length)
        this._oldMinHang = 0
        this._oldMaxHang = hang - 1 - this.outViewNum
        this._curViewMinHang = 0
        this._curViewMaxHang = hang - 1
        this._curViewSpace = this._curViewMaxHang - this._curViewMinHang
        let childCount = this.list.content.childrenCount
        if (childCount > len) {
            for (let i = len; i < childCount; i++)
                this.list.content.children[i].active = false
        }
        this._exchangeingList = []
        this._waitExchangeList = []
        this.list.stopAutoScroll()
        this.list.scrollToTop(0)
        this.listItems.clear()
        if (this.grid) {
            this.grid.updateContent(data.length)
        }
        return len
    }
    /**
   * 停止指定分帧执行
   * @param id 
   */
    public stopExecutePerFrame(id) {
        if (this._excuting.has(id)) {
            this._excuting.set(id, false)
        }
    }
    /**
     * 停止上一个分帧执行
     */
    public stopLastExecutePerFrame() {
        let id = this._addId - 1
        this.stopExecutePerFrame(id)
    }


    /**
     * 停止回调
     */
    public stopAllExecutePerFrame() {
        this.unscheduleAllCallbacks()
    }
}