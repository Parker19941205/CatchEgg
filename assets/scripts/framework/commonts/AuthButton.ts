
const { ccclass, property } = cc._decorator;

@ccclass
export default class AuthButton extends cc.Component {

    private btnAuthorize:any = null;

    onLoad() {
        // 通过 wx.getSetting 查询用户是否已授权头像昵称信息
        // var that = this;
        // wx.getSetting({
        //     success (res){
        //         console.log("authSetting========>",res.authSetting)
        //         if (res.authSetting['scope.userInfo']) {
        //             // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
        //             // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
        //             wx.getUserProfile({
        //                 desc: '用于完善个人资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        //                 success: (res) => {
        //                     console.log("已经授权====>",res)
        //                 }
        //             })
        //         } else {
        //             that.onAuthButtonClick()
        //         }
        //     }
        // })


        // wx.authorize({ scope: 'scope.userFuzzyLocation' })
        // .then((res) => {
        //     console.log('用户已授权', res);
        //     // 已授权
        //     wx.getFuzzyLocation({
        //         type: 'wgs84',
        //         success (res) {
        //             console.log("getFuzzyLocation====>",res)
        //             const latitude = res.latitude
        //             const longitude = res.longitude
        //         }
        //     })
        // })
        // .catch((res) => {
        //     console.log('用户未授权', res);
    
        // });
    }

    onAuthButtonClick() {
        if (!window.wx) return;
        // 获取按钮的世界坐标并转换
        let systemInfo = wx.getSystemInfoSync();
        let winSize = cc.director.getWinSize();
        let btnSize = cc.size(this.node.width+10,this.node.height+10);
        let frameSize = cc.view.getFrameSize();
        let width = btnSize.width/winSize.width*frameSize.width;
        let height = btnSize.height/winSize.height*frameSize.height;
        let left = systemInfo.screenWidth / 2 - width/2
        let top = systemInfo.screenHeight - 0.05*systemInfo.screenHeight - height;
      
        console.log("height========>",systemInfo.screenHeight,frameSize.height)
        console.log("left========>",left,top,width,height)
        // 显示微信授权按钮
        this.createWeChatUserInfoButton(left, top, width, height);
    }

    createWeChatUserInfoButton(left, top, width, height) {
        if (!window.wx) return;

        if(!this.btnAuthorize){
            this.btnAuthorize = wx.createUserInfoButton({
                type: 'text',
                text: '',
                style: {
                    left: left,
                    top: top,
                    width: width,
                    height: height,
                    lineHeight: height,
                    backgroundColor: 'rgba(0,0,0,0)', // 设置背景透明
                    color: '#ffffff',
                    textAlign: 'center',
                    fontSize: 16,
                    borderRadius: 4
                }
            });
            this.btnAuthorize.onTap((res) => {
                if (res.userInfo) {
                    console.log('User info:', res.userInfo);
                    this.setButtonVisible(false)
                } else {
                    console.log('User denied the request');
                }
            });
        }
    }

    setButtonVisible(visible:boolean){
        if (!window.wx) return;
        if(this.btnAuthorize){
            if(visible){
                this.btnAuthorize.show()
            }else{
                this.btnAuthorize.hide()
            }
        }
    }
}
