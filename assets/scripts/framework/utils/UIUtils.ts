export class UIUtils {


    /**
     * 文字标签控件滚动数字
     * @param isAdd 是否是添加
     * @param label lable组件
     * @param addNum  需要加的数量
     * @param totalNum 当前总共数量
     * @param callback 滚动完回调
     * @param times 滚动几秒
     */
    public static rollNumLabelAtlas(isAdd: boolean, label: cc.Label, addNum: number, totalNum: number, callback: Function, times: number = 6) {
        let num: number = addNum
        let count: number = times * 10
        let total: number = 0;
        let cellNum: number = num / count + 1
        if (num <= count) {
            count = num;
            cellNum = 1;
        } else {
            count = count + 1;
        }
        let _increaseNum = function () {
            if (isAdd) {
                if (total != num) {
                    total = total + cellNum;
                    if (total > num) {
                        cellNum = cellNum - (total - num)
                        total = num
                    }
                    let curNum = Number(label.string)
                    let showNum = Math.floor(curNum + cellNum).toFixed(0) + ""
                    label.string = showNum;
                }
            } else {
                if (total != num) {
                    total = total + cellNum;
                    if (total > num) {
                        cellNum = 0
                        total = num
                    }
                    let curNum = Number(label.string)
                    if (curNum > totalNum) {
                        let showNum = Math.floor(curNum - cellNum).toFixed(0) + ""
                        label.string = showNum;
                    }

                }
            }
        }
        if (count > 0) {
            cc.tween(label.node).call(() => {
                _increaseNum()
            }).delay(0.05).union().repeat(count).call(() => {
                callback()
            }).start();
        } else {
            callback()
        }
    }
    /**
     * 开启一个计时器
     * @param func 
     * @param target 
     * @param delayTime 
     */
    public static scheduleOnce(func: Function, target: any, delayTime: number) {
        cc.director.getScheduler().enableForTarget(target)
        cc.director.getScheduler().schedule(func, target, 1, 0, delayTime, false)
    }
    /**
    * 开启一个循环计时器
    * @param func 
    * @param target 
    * @param delayTime 
    */
    public static schedule(func: Function, target: any, invert: number) {
        cc.director.getScheduler().enableForTarget(target)
        cc.director.getScheduler().schedule(func, target, invert, cc.macro.REPEAT_FOREVER, 0, false)
    }
    /**
     * 关闭一个计时器
     * @param func 
     * @param target 
     */
    public static unSchedule(func: Function, target: any) {
        cc.director.getScheduler().enableForTarget(target)
        if (cc.director.getScheduler().isScheduled(func, target)) {
            cc.director.getScheduler().unschedule(func, target)
        }
    }
}


