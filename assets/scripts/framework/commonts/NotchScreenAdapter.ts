const { ccclass, property } = cc._decorator;
import menu = cc._decorator.menu;

@ccclass
@menu('自定义组件/刘海屏适配')
export default class NotchScreenAdapter extends cc.Component {

    onLoad() {
        this.adjustForNotch();
    }

    adjustForNotch() {
        // 获取设计分辨率
        const designResolution = cc.view.getDesignResolutionSize();
        // 获取屏幕可视区域
        const visibleSize = cc.view.getVisibleSize();
        // 获取安全区域
        const safeArea = cc.sys.getSafeAreaRect();

        // 计算刘海高度
        const notchHeight = (visibleSize.height - safeArea.height)/2;

        console.log(`Notch height: ${notchHeight}`);

        // 根据刘海高度调整 UI 布局
        this.adjustUILayout(notchHeight);
    }

    adjustUILayout(notchHeight: number) {
        // 我们要调整的节点
        if (notchHeight > 0 && this.node) {
            // 获取 UI 节点的 Widget 组件
            const widget = this.node.getComponent(cc.Widget);
            if (widget) {
                // 根据实际需要调整顶部间距
                widget.top = notchHeight;
                widget.updateAlignment();
            }
        }
    }
}
