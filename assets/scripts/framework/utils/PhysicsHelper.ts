/**
 * 物理引擎方法集合
 * */
export class PhysicsHelper {
    public static openPhysics(print: boolean = false) {
        //开启物理系统
        cc.director.getPhysicsManager().enabled = true;
        // 打印信息
        if (print) {
            cc.director.getPhysicsManager().debugDrawFlags = //cc.PhysicsManager.DrawBits.e_aabbBit |
                cc.PhysicsManager.DrawBits.e_jointBit |
                cc.PhysicsManager.DrawBits.e_shapeBit
            ;
        }
        // 开启物理步长的设置
        cc.director.getPhysicsManager().enabledAccumulator = false;
        //cc.director.getPhysicsManager().gravity = cc.v2(0, -980);
        // 物理步长，默认 FIXED_TIME_STEP 是 1/60
        // cc.PhysicsManager.FIXED_TIME_STEP = 1 / 60; // 设置固定的时间步长
        // // // 增加物理引擎的迭代次数
        // cc.PhysicsManager.VELOCITY_ITERATIONS = 10;  // 设置速度迭代次数
        // cc.PhysicsManager.POSITION_ITERATIONS = 10;  // 设置位置迭代次数
    }

    public static openCollision(print: boolean = false) {
        let manager = cc.director.getCollisionManager();
        manager.enabled = true;
        manager.enabledDebugDraw = print;
    }

    public static closePhysics() {
        cc.director.getPhysicsManager().enabled = false;
    }

    /**
     * @function 设置刚体线性速度 外部调用后需用原刚体赋值
     * @param {cc.RigidBody} rigidBody 原刚体
     * @param {cc.Vec2} v 线性速度
     * @param {Boolean} isPlus 是否为变化值（是为加速度，否为直接赋值速度）
     * @return {cc.RigidBody} 原刚体
     * */
    public static setRigidBodyLinearVelocity(rigidBody: cc.RigidBody, v = cc.v2(), isPlus = false): cc.RigidBody {
        let velocity = rigidBody;
        if (isPlus) {
            v.x += velocity.linearVelocity.x;
            v.y += velocity.linearVelocity.y;
        }
        velocity.linearVelocity = v;
        return velocity;
    }

    /**
     * @function 显示抛物线
     * @param {cc.Graphics} graphics 绘图组件
     * @param {cc.Vec2} linearVelocity 计算时线性速度
     * @param {cc.Vec2} startPos 起始坐标
     * @param {Number} G 重力值 cocos如不特意指定 传 cc.director.getPhysicsManager().gravity.y 即可
     * @param {Boolean} xu 是否用虚线显示 是虚线 否实线
     */
    public static showParabola(graphic: cc.Graphics, linearVelocity: cc.Vec2, startPos: cc.Vec2, G: number, xu: boolean) {
        graphic.clear();
        //
        let dt = 0.05; //刷新率
        let maxLine = Math.max(linearVelocity.x, linearVelocity.y);
        //
        if (maxLine > 2000) dt = 0.02;
        else if (maxLine > 1000) dt = 0.03;
        //虚线
        let xuMoveTo = false;
        //
        for (let count = 0; count < 150; count++) {
            const time = dt * count;
            // s = v_x * t
            const dx = linearVelocity.x * time;
            // h = v_y * t + 0.5 * a * t * t
            const dy = linearVelocity.y * time + 0.5 * G * 1 * time * time;
            // 当前时间点坐标
            const targetX = startPos.x + dx;
            const targetY = startPos.y + dy;
            //
            if (xu) {
                if (xuMoveTo) {
                    graphic.lineTo(targetX, targetY);
                    xuMoveTo = false;
                } else {
                    graphic.moveTo(targetX, targetY);
                    xuMoveTo = true;
                }
            } else {
                if (count == 0) {
                    graphic.moveTo(targetX, targetY);
                } else {
                    graphic.lineTo(targetX, targetY);
                }
            }
        }
        graphic.stroke();
    }

    /**
     * 计算被炸飞时的线性速度
     * @param BombPos 爆炸位置
     * @param KnockPos 被炸位置
     * @param mass 被炸节点质量
     * @param power 指定爆炸半径
     * @param boom_power_time 爆炸威力
     * @return 被炸的线性速度变化
     */
    public static calcBombLinearV(BombPos: cc.Vec2, KnockPos: cc.Vec2, mass: number, power = null, boom_power_time = cc.v2(1, 1,)): cc.Vec2 {
        let distance = this.calcTowPointDistance(BombPos, KnockPos);
        //爆炸半径
        if (distance >= power) {
            return cc.v2(0, 0);
        }
        //按距离计算速度
        let p = 1 - distance / power;
        let x = KnockPos.x - BombPos.x;
        let y = KnockPos.y - BombPos.y;
        let absX = boom_power_time.x * x * p;
        let absY = boom_power_time.y * y * p;
        absX /= Math.sqrt(mass);
        absY /= Math.sqrt(mass);
        //
        return cc.v2(absX, absY);
    }

    //此方法多余写了 cc.Vec2 有提供计算
    public static calcTowPointDistance(p1: cc.Vec2, p2: cc.Vec2): number {
        let dx = Math.abs(p2.x - p1.x);
        let dy = Math.abs(p2.y - p1.y);
        let dz = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

        return dz;
    }

    //弧度转角度
    public static radianToAngle(radian: number): number {
        return radian * 180 / Math.PI;
    }

    //角度转弧度
    public static angleTorDian(angle: number): number {
        return angle * Math.PI / 180;
    }

    /**
     * @function 碰撞过程中修改碰撞物位置
     * @param {cc.Component} 节点所在组件或父组件
     * @param {cc.Node} node
     * @param {cc.Vec2} pos
     */
    public static cheatColliderPos(component, node, pos) {
        let PHY = cc.director.getPhysicsManager();
        if (!PHY.enabled) {
            console.warn('#151 警告 非物理引擎激活状态下不建议此方法');
            return;
        }
        // PHY.enabled = false;
        // //物理引擎线程中，不能直接修改位置，须暂时后下一秒修改
        // node_component.nextTickRun(component, () => {
        //     node.setPosition(pos);
        //     PHY.enabled = true;
        // });
    }
}

