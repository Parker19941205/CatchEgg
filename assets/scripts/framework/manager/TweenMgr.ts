
export class TweenMgr {
    private static instance: TweenMgr;
    private constructor() { }
    public static getInstance(): TweenMgr {
        if (this.instance == null) {
            this.instance = new TweenMgr();
        }
        return this.instance;
    }
    private twenMap: Map<string, cc.Tween<any>> = new Map();

    public getTween(node: cc.Node): cc.Tween<any> {
        if (this.twenMap.has(node.uuid)) {
            this.stopTween(node)
        }
        let tween = cc.tween(node)
        this.twenMap.set(node.uuid, tween)
        return tween;
    }
    public stopTween(node: cc.Node) {
        if (this.twenMap.has(node.uuid)) {
            this.twenMap.get(node.uuid).stop();
            this.twenMap.delete(node.uuid)
        }
    }
    /**心跳动画 */
    playHeartAni(node: cc.Node) {
        let tween = this.getTween(node)
        this.heartani(tween);
    }

    //心跳动画
    heartani(tween: cc.Tween<cc.Node>) {
        tween
            .to(0.3, { scale: 1.04 })
            .to(0.2, { scale: 0.98 })
            .delay(0.4)
            .to(0.1, { scale: 1.05 })
            .to(0.2, { scale: 0.95 })
            .union().repeatForever()
            .start();
    }

    /**打开动画 */
    popOpenAin(tween: cc.Tween<cc.Node>, call?: Function) {
        tween
            .to(0.1, { scale: 0.9 })
            .to(0.05, { scale: 1.1 })
            .to(0.1, { scale: 1 })
            .call(() => {
                if (call) {
                    call();
                }
            })
            .start();
    }
    /**关闭动画 */
    popCloseAin(tween: cc.Tween<cc.Node>, call?: Function) {
        tween.stop();
        tween
            .to(0.1, { scale: 0 })
            .call(() => {
                if (call) {
                    call();
                }
            })
            .start();
    }
    /**盖章 */
    stampAni(node: cc.Node) {
        node.scale = node.scale + 1;
        cc.tween(node).to(0.2, { scale: 1 }).start();
    }

    anglesAni(node: cc.Node, count: number = 1) {
        let tween: cc.Tween<cc.Node> = this.getTween(node)
        tween
            .by(.5, { angle: 20 })
            .by(.5, { angle: -20 })
            .delay(0.5)
            .by(0.2, { angle: 10 })
            .by(0.2, { angle: -10 })
            .delay(0.1)
            .union()
        if (count == -1) {
            tween.repeatForever()
        } else {
            tween.repeat(count)
        }
        tween.start();
    }

    jumpAniForever(node: cc.Node, delay: number = 0.2) {
        let tween = this.getTween(node)
        tween.by(0.2, { position: new cc.Vec3(0, -10, 0) })
            .by(0.2, { position: new cc.Vec3(0, 10, 0) })
            .delay(delay)
            .union().repeatForever()
        tween.start();

    }
    sharkAni(node: cc.Node, count: number = 1) {
        let tween = this.getTween(node)
        tween.by(0.01, { position: new cc.Vec3(2, 2, 0) })
            .by(0.01, { position: new cc.Vec3(-2, -2, 0) }).union()
        if (count == -1) {
            tween.repeatForever();
        } else {
            tween.repeat(count)
        }
        tween.start();
    }
}