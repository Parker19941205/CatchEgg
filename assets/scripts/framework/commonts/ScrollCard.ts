export enum Direction {
    Horizontal = 0,
    Vertical = 1,
}
cc.Enum(Direction);
const { ccclass, property } = cc._decorator;
@ccclass
export default class ScrollCard extends cc.Component {
    @property({ type: Direction, tooltip: "滑动方向" })
    Direction: Direction = Direction.Horizontal
    @property({ type: cc.Integer, tooltip: 'node 间隔', })
    itemOffset = 0
    @property({ type: cc.Integer, tooltip: '移动速度', })
    speed = 500
    @property({ type: cc.Float, tooltip: '减速频率', })
    rub = 1.0
    @property({ type: cc.Float, tooltip: '缩放最小值', })
    scaleMin = 0.5
    @property({ type: cc.Float, tooltip: '缩放最大值', })
    scaleMax = 1.0
    @property({ type: [cc.Node], tooltip: '滚动item', })
    item: cc.Node[] = []
    @property({ type: cc.Integer })
    itemSize = 5
    @property({ type: cc.Node })
    itemNode: cc.Node = null;

    private _startTime: number = 0;
    private _moveSpeed: number = 0;
    private uiTransform: cc.Node = null;
    private _maxSize: cc.Size
    private _screenRect: cc.Rect;
    private itemList: cc.Node[] = []
    private canTouch: boolean = true;

    start() {
        this.uiTransform = this.node
        this.node.on(cc.Node.EventType.TOUCH_START, () => {
            if (this.canTouch) {
                this._moveSpeed = 0;
                this._startTime = new Date().getTime();
            }

        })
        this.node.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
            if (this.canTouch) {
                var movePos = event.getDelta();
                this.itemMoveBy(movePos);
            }
        })
        this.node.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            if (this.canTouch) {
                this.touchEnd(event)
            }
        });
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, (event: cc.Event.EventTouch) => {
            if (this.canTouch) {
                this.touchEnd(event)
            }
        });
    }

    init() {
        for (let i = 0; i < this.itemSize; i++) {
            let item = cc.instantiate(this.itemNode)
            item.active = true;
            item.parent = this.node
            this.item.push(item)
        }
        this._initItemPos();
        this.updateScale();
    }

    private invert: number = 0
    private speedTime: number = 0
    private offset: cc.Vec2
    /**自动 */
    autoScroll(speedTime: number, offset: cc.Vec2) {
        this.canTouch = false
        this.speedTime = speedTime;
        this.offset = offset;
        this.schedule(() => {
            this.invert += 0.01
            if (this.invert >= this.speedTime) {
                this.invert = 0;
                this.scrollOffset(this.offset)
            }
        }, 0)
    }
    changleScrollSpeed(speedTime: number, offset: cc.Vec2) {
        this.speedTime = speedTime;
        this.offset = offset;
    }
    stopAutoScroll() {
        this.unscheduleAllCallbacks()
    }

    private scrollOffset(offset: cc.Vec2) {
        this.itemMoveBy(offset);
    }

    touchEnd(event) {
        var curpos = event.getLocation();
        var startpos = event.getStartLocation();
        var dis;
        if (this.Direction == 0) {
            dis = startpos.x - curpos.x;
        } else {
            dis = startpos.y - curpos.y;
        }
        var curTime = new Date().getTime();
        var disTime = curTime - this._startTime;
        this._moveSpeed = dis / disTime;
    }
    _initItemPos() {
        this.uiTransform.anchorY = 0.5;
        this.uiTransform.anchorX = 0.5;
        this._maxSize = new cc.Size(0, 0)
        for (let i = 0; i < this.item.length; i++) {
            this._maxSize.width += this.item[i].width;
            this._maxSize.height += this.item[i].height;
            this._maxSize.width += this.itemOffset;
            this._maxSize.height += this.itemOffset;
        }
        let startPos: cc.Vec2;
        if (this.Direction == 0) {
            startPos = new cc.Vec2(-this._maxSize.width * this.uiTransform.anchorX, -this._maxSize.height * this.uiTransform.anchorY);
        } else {
            startPos = new cc.Vec2(this._maxSize.width * this.uiTransform.anchorX, this._maxSize.height * this.uiTransform.anchorY);
        }
        this._screenRect = new cc.Rect(startPos.x, startPos.y, this._maxSize.width, this._maxSize.height);
        this.itemList = [];
        for (let i = 0; i < this.item.length; i++) {
            var anchor = this.item[i].getAnchorPoint();
            var itemSize = this.item[i].getContentSize();
            if (this.Direction == 0) {
                startPos = startPos.add(new cc.Vec2(itemSize.width * anchor.x, itemSize.height * anchor.y));
                this.item[i].position = new cc.Vec3(startPos.x, 0, 0)
                startPos = startPos.add(new cc.Vec2(itemSize.width * anchor.x, itemSize.height * anchor.y));
                startPos = startPos.add(new cc.Vec2(this.itemOffset, this.itemOffset));
            } else {
                startPos = startPos.subtract(new cc.Vec2(itemSize.width * anchor.x, itemSize.height * anchor.y));
                this.item[i].position = new cc.Vec3(0, startPos.y, 0)
                startPos = startPos.subtract(new cc.Vec2(itemSize.width * anchor.x, itemSize.height * anchor.y));
                startPos = startPos.subtract(new cc.Vec2(this.itemOffset, this.itemOffset));
            }
            this.itemList[i] = this.item[i];
        }

    }
    updateScale() {
        if (this.scaleMax < this.scaleMin || this.scaleMax == 0) {
            return;
        }
        for (let i = 0; i < this.item.length; i++) {
            var pre;
            if (this.Direction == 0) {
                var x = this.item[i].position.x + this._maxSize.width / 2;
                if (this.item[i].position.x < 0) {
                    pre = x / this._maxSize.width;
                }
                else {
                    pre = 1 - x / this._maxSize.width;
                }
            } else {
                var y = this.item[i].position.y + this._maxSize.height / 2;
                if (this.item[i].position.y < 0) {
                    pre = y / this._maxSize.height;
                }
                else {
                    pre = 1 - y / this._maxSize.height;
                }
            }
            pre *= 2;
            var scaleTo = this.scaleMax - this.scaleMin;
            scaleTo *= pre;
            scaleTo += this.scaleMin;
            scaleTo = Math.abs(scaleTo);
            this.item[i].scale = scaleTo
        }
    }
    itemMoveBy(posss: cc.Vec2) {
        for (let i = 0; i < this.item.length; i++) {
            let position = this.item[i].position;
            if (this.Direction == 0) {
                let pos = new cc.Vec3(position.x + posss.x, position.y, 0)
                this.item[i].position = pos;
            } else {
                let pos = new cc.Vec3(position.x, position.y + posss.y, 0)
                this.item[i].position = pos;
            }
        }
        this.updatePos();
    }
    updatePos() {
        var startItem = this.itemList[0];
        var endItem = this.itemList[this.itemList.length - 1];
        var startout = false;
        if (this.Direction == 0) {
            if (startItem.position.x < -this._maxSize.width / 2) {
                startout = true;
            }
        } else {
            if (startItem.position.y > this._maxSize.width / 2) {
                startout = true;
            }
        }
        //left
        if (startout) {
            var item = this.itemList.shift();
            this.itemList.push(item);
            let pos = item.position;
            if (this.Direction == 0) {
                let x = endItem.position.x + endItem.width + this.itemOffset;
                item.position = new cc.Vec3(x, pos.y, 0)
            } else {
                let y = endItem.position.y - endItem.height - this.itemOffset;
                item.position = new cc.Vec3(pos.x, y, 0)
            }
        }
        var endout = false;
        if (this.Direction == 0) {
            if (endItem.position.x > this._maxSize.width / 2) {
                endout = true;
            }
        } else {
            if (endItem.position.y < -this._maxSize.height / 2) {
                endout = true;
            }
        }
        //right
        if (endout) {
            var item = this.itemList.pop();
            this.itemList.unshift(item);
            let pos = item.position;
            if (this.Direction == 0) {
                let x = startItem.position.x - startItem.width - this.itemOffset;
                item.position = new cc.Vec3(x, pos.y, 0)
            } else {
                let y = startItem.position.y + startItem.height + this.itemOffset;
                item.position = new cc.Vec3(pos.x, y, 0)
            }
        }
        this.updateScale();
    }
    update(dt) {
        if (this._moveSpeed == 0) return;
        for (let i = 0; i < this.item.length; i++) {
            let pos = this.item[i].position
            if (this.Direction == 0) {
                let x = this._moveSpeed * dt * this.speed;
                this.item[i].position = new cc.Vec3(pos.x - x, pos.y, 0)
            } else {
                let y = this._moveSpeed * dt * this.speed;
                this.item[i].position = new cc.Vec3(pos.x, pos.y - y, 0)
            }
        }
        if (this._moveSpeed > 0) {
            this._moveSpeed -= dt * this.rub;
            if (this._moveSpeed < 0) {
                this._moveSpeed = 0;
            }
        } else {
            this._moveSpeed += dt * this.rub;
            if (this._moveSpeed > 0) {
                this._moveSpeed = 0;
            }
        }
        var moveTo = -this._moveSpeed * dt * this.speed;
        this.itemMoveBy(new cc.Vec2(moveTo, moveTo))
        this.updatePos();
    }
}


