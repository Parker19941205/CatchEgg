import { GameConfig } from "../config/Config";

export class HttpManager {
    private static instance: HttpManager;
    private _xhr: any;
    private constructor() {
    }
    public static getInstance(): HttpManager {
        if (this.instance == null) {
            this.instance = new HttpManager();
        }
        return this.instance;
    }
    httpGet(url: string, params: object = {}, callback: Function) {
        let dataStr = '';
        Object.keys(params).forEach(key => {
            dataStr += key + '=' + encodeURIComponent(params[key]) + '&';
        })
        if (dataStr !== '') {
            dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'));
            url = url + '?' + dataStr;
        }

        cc.log("httpGet=====>",url)
        let xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.open("GET", url, true);
        //xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
        xhr.setRequestHeader('Access-Control-Allow-Methods', 'GET, POST');
        xhr.setRequestHeader('Access-Control-Allow-Headers', 'x-requested-with,content-type');
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                let responseText = xhr.responseText;
                if (xhr.status >= 200 && xhr.status < 300) {
                    //cc.log("httpGet:resq====>",responseText)
                    let json: any = {};
                    try {
                        json = JSON.parse(responseText);
                    } catch (e) {
                        throw "network json parse exception::" + e;
                    }

                    let state = json.state;
                    if (state == "success") {
                        callback(true,json);
                    }else {
                        callback(false,json);
                    }
                } else {
                    callback(false, responseText);
                }
            } else {
            }
        };
        xhr.ontimeout = function () {
        };
        xhr.send();
    }

    httpPost(url?: string,oparams: object = null, callback?: Function,) {
        let xhr = new XMLHttpRequest()
        let datastr = null;
        if (oparams) {
            datastr = JSON.stringify(oparams)
            //datastr = ''
            // Object.keys(oparams).forEach(key => {
            //     datastr += key + '=' + encodeURIComponent(oparams[key]) + '&';
            // })
            // if (datastr !== '') {
            //     datastr = datastr.substr(0, datastr.lastIndexOf('&'));
            // }
        }
        xhr.timeout = 7000; // 
        let httpUrl = url
        xhr.open("POST", httpUrl, true);
        xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
        xhr.setRequestHeader('Access-Control-Allow-Methods', 'GET, POST');
        xhr.setRequestHeader('Access-Control-Allow-Headers', 'x-requested-with,content-type');
        xhr.setRequestHeader("Content-Type", "application/json");
        //xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        xhr.onreadystatechange = function () {
            //console.log("onreadystatechange====>",xhr)
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 400) {
                    let responseText = xhr.responseText;
                    //cc.log("responseText====>",responseText)
                    let json: any = {};
                    try {
                        json = JSON.parse(responseText);
                    } catch (e) {
                        throw "network json parse exception::" + e;
                    }

                    let status = json.status;
                    callback(status,json);
                    // if (state == ") {
                    //     callback(true,json);
                    // }else {
                    //     callback(false,json);
                    // }
                }
            }
        }
        xhr.ontimeout = function () {
            // if (callback) {
            //     callback(false)
            // }
        }
        xhr.onerror = function () {
            cc.log("onerror====>")
            // if (callback) {
            //     callback(false)
            // }
        }

        console.log("httpPost:req====>",datastr)
        if (datastr) {
            xhr.send(datastr);
        } else {
            xhr.send();
        }
    }
    private static isPass(json: string): boolean {
        return true;
    }

}


  