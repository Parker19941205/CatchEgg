//计算矩形角度常量
const KAPPA90 = 0.5522847493;
/**
 * 裁剪不规则矩形
 */
cc.Class({
    extends: cc.Mask,
    properties: {
        
        /**
        * 这边是由于该脚本继承了Mask组件，因此会将一些mask原有的公开属性展示在编辑器的面板上
        * 为了编辑器面板的整洁，在这里重新设置一下属性面板的显示
        */
        /************************************************************************************/
        type: {
            override: true,
            get: function () {
                return this._type;
            },
            visible() {
                //隐藏不需要的属性
                return false;
            }
        },
        spriteFrame: {
            override: true,
            type: cc.SpriteFrame,
            get: function () {
                return this._spriteFrame;
            },
            visible() {
                //隐藏不需要的属性
                return false;
            }
        },
        alphaThreshold: {
            override: true,
            get: function () {
                return 0;
            },
            visible() {
                //隐藏不需要的属性
                return false;
            }
        },
        segements: {
            override: true,
            get: function () {
                return this._segments;
            },
            visible() {
                //隐藏不需要的属性
                return false;
            }
        },
        /************************************************************************************/

        /**
         * 圆角矩形的每个角的弧度
         */
        rectRadius: {
            default: [],
            type: [cc.Integer],
            tooltip: '不规则矩形每个角的弧度\n（4：左上顺时针方向）\n（2：左上下，右上下）\n（0：四个角一致）',
            notify() {
                this._updateGraphics()
            }
        },
    },
    /**
     * 开启在编辑器中实时渲染
     */
    editor: {
        executeInEditMode: true
    },
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
    },

    start() {
        this.draw();
    },

    onEnable () {
        let widget = this.node.getComponent(cc.Widget);
        if (!!widget) {
            widget.updateAlignment();
        }
        this._super();
        if (this._type !== cc.Mask.Type.IMAGE_STENCIL) {
            this._updateGraphics();
        }

        this.node.on(cc.Node.EventType.POSITION_CHANGED, this._updateGraphics, this);
        this.node.on(cc.Node.EventType.ROTATION_CHANGED, this._updateGraphics, this);
        this.node.on(cc.Node.EventType.SCALE_CHANGED, this._updateGraphics, this);
        this.node.on(cc.Node.EventType.SIZE_CHANGED, this._updateGraphics, this);
        this.node.on(cc.Node.EventType.ANCHOR_CHANGED, this._updateGraphics, this);
    },

    onDisable () {
        this._super();

        this.node.off(cc.Node.EventType.POSITION_CHANGED, this._updateGraphics, this);
        this.node.off(cc.Node.EventType.ROTATION_CHANGED, this._updateGraphics, this);
        this.node.off(cc.Node.EventType.SCALE_CHANGED, this._updateGraphics, this);
        this.node.off(cc.Node.EventType.SIZE_CHANGED, this._updateGraphics, this);
        this.node.off(cc.Node.EventType.ANCHOR_CHANGED, this._updateGraphics, this);
    },

    onDestroy () {
        this._super();
        this._removeGraphics();
    },

    /**
     * 画矩形
     */
    draw(){
        let ctx = this._graphics;
        ctx.clear();
        this.irregularRect(ctx, this.node.width / 2 * -1, this.node.height / 2 * -1, this.node.width, this.node.height, this.rectRadius);
        ctx.stroke();
        ctx.fill();
    },

    /**
     * 根据传入的圆角弧度画矩形
     * @param ctx  graphics组件
     * @param x
     * @param y
     * @param w
     * @param h
     * @param r     圆角弧度
     * 将圆角矩形的每个角的绘制公式都重新书写，达到可以实现四个圆弧角度不一致的情况
     */
    irregularRect(ctx, x, y, w, h, r) {
        if (r < 0.1) {
            ctx.rect(x, y, w, h);
            return;
        } else {
            let rx0 = 0,
                ry0 = 0,
                rx1 = 0,
                ry1 = 0,
                rx2 = 0,
                ry2 = 0,
                rx3 = 0,
                ry3 = 0;
            if (r.length == 1) {
                rx0 = rx1 = rx2 = rx3 = Math.min(r[0], Math.abs(w) * 0.5) * Math.sign(w);
                ry0 = ry1 = ry2 = ry3 = Math.min(r[0], Math.abs(h) * 0.5) * Math.sign(h);
            } else if (r.length == 2) {
                rx0 = rx3 = Math.min(r[0], Math.abs(w) * 0.5) * Math.sign(w);
                rx1 = rx2 = Math.min(r[1], Math.abs(w) * 0.5) * Math.sign(w);
                ry0 = ry3 = Math.min(r[0], Math.abs(h) * 0.5) * Math.sign(h);
                ry1 = ry2 = Math.min(r[1], Math.abs(h) * 0.5) * Math.sign(h);
            } else if (r.length == 4) {
                rx0 = Math.min(r[0], Math.abs(w) * 0.5) * Math.sign(w);
                ry0 = Math.min(r[0], Math.abs(h) * 0.5) * Math.sign(h);
                rx1 = Math.min(r[1], Math.abs(w) * 0.5) * Math.sign(w);
                ry1 = Math.min(r[1], Math.abs(h) * 0.5) * Math.sign(h);
                rx2 = Math.min(r[2], Math.abs(w) * 0.5) * Math.sign(w);
                ry2 = Math.min(r[2], Math.abs(h) * 0.5) * Math.sign(h);
                rx3 = Math.min(r[3], Math.abs(w) * 0.5) * Math.sign(w);
                ry3 = Math.min(r[3], Math.abs(h) * 0.5) * Math.sign(h);
            } else {
                console.log('圆角弧度数组参数错误！');
                return;
            }
            ctx.moveTo(x, y + ry0);
            ctx.lineTo(x, y + h - ry0);
            ctx.bezierCurveTo(x, y + h - ry0 * (1 - KAPPA90), x + rx0 * (1 - KAPPA90), y + h, x + rx0, y + h);
            ctx.lineTo(x + w - rx1, y + h);
            ctx.bezierCurveTo(x + w - rx1 * (1 - KAPPA90), y + h, x + w, y + h - ry1 * (1 - KAPPA90), x + w, y + h - ry1);
            ctx.lineTo(x + w, y + ry2);
            ctx.bezierCurveTo(x + w, y + ry2 * (1 - KAPPA90), x + w - rx2 * (1 - KAPPA90), y, x + w - rx2, y);
            ctx.lineTo(x + rx3, y);
            ctx.bezierCurveTo(x + rx3 * (1 - KAPPA90), y, x, y + ry3 * (1 - KAPPA90), x, y + ry3);
            ctx.close();
        }

    },

    /**
     * 更新矩形
     * @private
     */
    _updateGraphics () {
        let graphics = this._graphics;
        // Share render data with graphics content
        graphics.clear(false);
        this.irregularRect(graphics,this.node.width / 2 * -1, this.node.height / 2 * -1, this.node.width, this.node.height, this.rectRadius);
        if (cc.game.renderType === cc.game.RENDER_TYPE_CANVAS) {
            graphics.stroke();
        }
        else {
            graphics.fill();
        }
    },
    // update (dt) {},
});

