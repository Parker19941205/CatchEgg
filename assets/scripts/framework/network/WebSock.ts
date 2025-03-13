import { ISocket, NetData } from "./NetInterface";

/*
*   WebSocket封装
*   1. 连接/断开相关接口
*   2. 网络异常回调
*   3. 数据发送与接收
*   
*   2018-5-14 by 宝爷
*/

export class WebSock implements ISocket {
    private _ws: WebSocket = null;              // websocket对象

    onConnected: (event) => void = null;
    onMessage: (msg) => void = null;
    onError: (event) => void = null;
    onClosed: (event) => void = null;

    connect(options: any) {
        if (this._ws) {
            //cc.log("connect==========>",this._ws,this._ws.readyState)
            if (this._ws.readyState === WebSocket.CONNECTING) {
                console.log("websocket connecting, wait for a moment...")
                return false;
            }
        }
        

        let url = null;
        if(options.url) {
            url = options.url;
        } else {
            let ip = options.ip;
            let port = options.port;
            let protocol = options.protocol;
            url = `${protocol}://${ip}:${port}`;    
        }

        cc.log("url==========>",url)
        if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
            let cacert = cc.url.raw('resources/cacert.pem');
            if (cc.loader.md5Pipe) {
                cacert = cc.assetManager.utils.getUrlWithUuid("1d467e09-a07d-4ffc-acb4-6826cd4bd394", { isNative: true, nativeExt: '.pem' });
                //cacert = cc.loader.md5Pipe.transformURL(path)
            }
            this._ws = new WebSocket(url, [], cacert)
        } else {
            this._ws = new WebSocket(url);
        }

        this._ws.binaryType = options.binaryType ? options.binaryType : "arraybuffer";
        this._ws.onmessage = (event) => {
            this.onMessage(event.data);
        };
        this._ws.onopen = this.onConnected;
        this._ws.onerror = this.onError;
        this._ws.onclose = this.onClosed;
        return true;
    }

    send(buffer: NetData) {
        if (this._ws.readyState == WebSocket.OPEN)
        {
            this._ws.send(buffer);
            return true;
        }
        return false;
    }

    close(code?: number, reason?: string) {
        this._ws.close(code, reason);
    }
}