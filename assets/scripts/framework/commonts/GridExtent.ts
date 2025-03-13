const { ccclass, property, menu } = cc._decorator;
export enum HORIZONTAL_ALIGNMENT {
    LEFT = 0,
    CENTER = 1,
    RIGHT = 2,
}
/**
 * 将子物体按格子排序，暂时只支持从左至右从上至下
 */
@ccclass
@menu('Ui/Grid Extent')
export default class GridExtent extends cc.Component {
    @property({ type: cc.Integer, displayName: "格子宽" })
    cellWidth: number = 0
    @property({ type: cc.Integer, displayName: "格子高" })
    cellHeight: number = 0
    @property({ type: cc.Integer, displayName: "行" })
    hang: number = 0
    @property({ type: cc.Integer, displayName: "列" })
    lie: number = 0
    @property({ type: cc.Integer, displayName: "间隔X" })
    spaceX: number = 0
    @property({ type: cc.Integer, displayName: "间隔Y" })
    spaceY: number = 0
    @property({ type: cc.Integer, displayName: "上下边距" })
    topSpace: number = 0
    @property({ type: cc.Integer, displayName: "左右边距" })
    leftSpace: number = 0
    @property({ type: cc.Enum(HORIZONTAL_ALIGNMENT), displayName: "水平对齐方式" })
    horizon: number = HORIZONTAL_ALIGNMENT.LEFT


    updateContent(total: number) {
        let maxXnum = this.lie == 0 ? Math.ceil(total / this.hang) : this.lie
        let maxYnum = this.hang == 0 ? Math.ceil(total / this.lie) : this.hang
        let nodex = this.node.x
        if (this.horizon == HORIZONTAL_ALIGNMENT.LEFT) {
            let oldAnchor = this.node.anchorX
            this.node.anchorX = 0
            nodex = this.node.x - oldAnchor * this.node.width
        } else if (this.horizon == HORIZONTAL_ALIGNMENT.CENTER) {
            let oldAnchor = this.node.anchorX
            this.node.anchorX = 0.5
            nodex = this.node.x + (0.5 - oldAnchor) * this.node.width
        } else {
            let oldAnchor = this.node.anchorX
            this.node.anchorX = 1
            nodex = this.node.x + (1 - oldAnchor) * this.node.width
        }
        this.node.width = this.cellWidth * maxXnum + this.spaceX * (maxXnum - 1) + this.leftSpace
        this.node.height = this.cellHeight * maxYnum + this.spaceY * (maxYnum - 1) + this.topSpace
        if (total && total > 0) {
            if (this.lie > 0) {
                this.node.height = (this.cellHeight + this.spaceY) * Math.ceil(total / this.lie) - this.spaceY + this.topSpace
            } else if (this.hang > 0) {
                this.node.width = (this.cellWidth + this.spaceX) * Math.ceil(total / this.hang) - this.spaceX + this.leftSpace
            }
        }
        this.node.x = nodex
    }

    refresh(total?: number) {
        let allcount = this.node.childrenCount
        let count = 0
        for (let i = 0; i < allcount; i++) {
            let child = this.node.children[i]
            if (child.active) {
                count++
            }
        }


        let maxXnum = 0, maxYnum = 0
        for (let i = 0; i < count; i++) {
            let x, y = 0
            if (this.lie == 0) {
                x = Math.floor(i / this.hang)
                y = i % this.hang
            } else {
                x = i % this.lie
                y = Math.floor(i / this.lie)
            }
            if (x > maxXnum) {
                maxXnum = x
            }
            if (y > maxYnum) {
                maxYnum = y
            }
        }
        maxXnum++
        maxYnum++
        let nodex = this.node.x
        if (this.horizon == HORIZONTAL_ALIGNMENT.LEFT) {
            let oldAnchor = this.node.anchorX
            this.node.anchorX = 0
            nodex = this.node.x - oldAnchor * this.node.width
        } else if (this.horizon == HORIZONTAL_ALIGNMENT.CENTER) {
            let oldAnchor = this.node.anchorX
            this.node.anchorX = 0.5
            nodex = this.node.x + (0.5 - oldAnchor) * this.node.width
        } else {
            let oldAnchor = this.node.anchorX
            this.node.anchorX = 1
            nodex = this.node.x + (1 - oldAnchor) * this.node.width
        }
        this.node.width = this.cellWidth * maxXnum + this.spaceX * (maxXnum - 1) + this.leftSpace
        this.node.height = this.cellHeight * maxYnum + this.spaceY * (maxYnum - 1) + this.topSpace
        if (total && total > 0) {
            if (this.lie > 0) {
                this.node.height = (this.cellHeight + this.spaceY) * Math.ceil(total / this.lie) - this.spaceY + this.topSpace
            } else if (this.hang > 0) {
                this.node.width = (this.cellWidth + this.spaceX) * Math.ceil(total / this.hang) - this.spaceX + this.leftSpace
            }
        }
        this.node.x = nodex
        this.refreshChilds(count, 0, this.node.children)
    }

    refreshChilds(count: number, initHang: number, childrens: cc.Node[]) {
        let xnum = 0, ynum = 0
        let totalXNum = this.lie == 0 ? Math.ceil(count / this.hang) : this.lie
        for (let i = 0; i < count; i++) {
            let nd = childrens[i]
            if (this.lie == 0) {
                xnum = Math.floor(i / this.hang)
                ynum = i % this.hang
            } else {
                xnum = i % this.lie
                ynum = Math.floor(i / this.lie)
            }


            if (this.horizon == HORIZONTAL_ALIGNMENT.LEFT) {
                //左上角为原点坐标
                let x = xnum * this.cellWidth + xnum * this.spaceX + this.leftSpace

                //自身偏移坐标校正
                x = x + this.cellWidth * nd.anchorX

                // //父物体偏移校正
                // x = x - this.node.width * this.node.anchorX

                nd.x = x

            } else if (this.horizon == HORIZONTAL_ALIGNMENT.RIGHT) {
                //左上角为原点坐标
                let x = -(xnum * this.cellWidth + xnum * this.spaceX + this.leftSpace)

                //自身偏移坐标校正
                x = x - this.cellWidth * nd.anchorX

                // //父物体偏移校正
                // x = this.node.width * this.node.anchorX + x

                nd.x = x
            } else {
                let total = totalXNum
                if (count % totalXNum != 0) {
                    if (i >= (count - count % totalXNum)) {
                        total = count % totalXNum
                    }
                }
                let coefficient = 1
                let rx = 0
                let center = 0
                let t = Math.floor(total / 2)
                if (total % 2 == 0) { //偶数
                    rx = xnum >= t ? xnum - t + 1 : t - xnum
                    coefficient = (xnum >= t ? 1 : -1)
                } else { //奇数
                    center = t
                    rx = xnum > t ? xnum - t : t - xnum
                    coefficient = (xnum > t ? 1 : -1)
                }

                let x = 0
                if (!(total % 2 == 1 && xnum == center)) {
                    x = rx * this.cellWidth + (rx - 1) * this.spaceX
                    x = coefficient * x
                    if (x > 0) {
                        if (total % 2 == 0)
                            x = x + this.spaceX / 2 - this.cellWidth / 2
                        else
                            x = x + this.spaceX
                    }
                    else {
                        if (total % 2 == 0)
                            x = x - this.spaceX / 2 + this.cellWidth / 2
                        else
                            x = x - this.spaceX
                    }
                }
                nd.x = x
            }


            let y = (ynum + initHang) * this.cellHeight + (ynum + initHang - 1) * this.spaceY + this.topSpace
            y = y + this.cellHeight * nd.anchorY
            y = y - this.node.height * (1 - this.node.anchorY)
            y = -y
            nd.y = y
        }
    }
    refreshChild(total: number, child: cc.Node, index: number) {
        let xnum = 0, ynum = 0
        if (this.lie == 0) {
            xnum = Math.floor(index / this.hang)
            ynum = index % this.hang
        } else {
            xnum = index % this.lie
            ynum = Math.floor(index / this.lie)
        }
        this.refreshChildWidth(total, child, xnum, index)
        this.refreshChildHeight(child, ynum)
    }


    refreshChildWidth(count: number, child: cc.Node, initLie: number, index: number) {

        if (this.horizon == HORIZONTAL_ALIGNMENT.LEFT) {
            //左上角为原点坐标
            let x = initLie * this.cellWidth + initLie * this.spaceX + this.leftSpace

            //自身偏移坐标校正
            x = x + this.cellWidth * child.anchorX

            // //父物体偏移校正
            x = x - this.node.width * this.node.anchorX

            child.x = x

        } else if (this.horizon == HORIZONTAL_ALIGNMENT.RIGHT) {
            //左上角为原点坐标
            let x = -(initLie * this.cellWidth + initLie * this.spaceX + this.leftSpace)

            //自身偏移坐标校正
            x = x - this.cellWidth * child.anchorX

            // //父物体偏移校正
            // x = this.node.width * this.node.anchorX + x

            child.x = x
        } else {
            let totalXNum = this.lie == 0 ? Math.ceil(count / this.hang) : this.lie
            let total = totalXNum
            if (count % totalXNum != 0) {
                if (index >= (count - count % totalXNum)) {
                    total = count % totalXNum
                }
            }
            let coefficient = 1
            let rx = 0
            let center = 0
            let t = Math.floor(total / 2)
            if (total % 2 == 0) { //偶数
                rx = initLie >= t ? initLie - t + 1 : t - initLie
                coefficient = (initLie >= t ? 1 : -1)
            } else { //奇数
                center = t
                rx = initLie > t ? initLie - t : t - initLie
                coefficient = (initLie > t ? 1 : -1)
            }

            let x = 0
            if (!(total % 2 == 1 && initLie == center)) {
                x = rx * this.cellWidth + (rx - 1) * this.spaceX
                x = coefficient * x
                if (x > 0) {
                    if (total % 2 == 0)
                        x = x + this.spaceX / 2 - this.cellWidth / 2
                    else
                        x = x + this.spaceX
                }
                else {
                    if (total % 2 == 0)
                        x = x - this.spaceX / 2 + this.cellWidth / 2
                    else
                        x = x - this.spaceX
                }
            }
            child.x = x
        }
    }

    refreshChildHeight(child: cc.Node, initHang: number) {
        let y = initHang * this.cellHeight + initHang * this.spaceY + this.topSpace
        y = y + this.cellHeight * (1 - child.anchorY) 
        y = y - this.node.height * (1 - this.node.anchorY)
        y = -y
        child.y = y
    }
}