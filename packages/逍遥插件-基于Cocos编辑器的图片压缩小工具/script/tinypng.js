var child_process = require("child_process");
const fs = require('fs');
const path = require('path');
const https = require('https');
const URL = require('url').URL;
const EventEmitter = require('events');
const err = msg => new EventEmitter().emit('error', msg);

String.prototype.format = function (args) {
    if (arguments.length > 0) {
        var result = this
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                var reg = new RegExp("({" + key + "})", "g");
                result = result.replace(reg, args[key])
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] == undefined) {
                    return "";
                }
                else {
                    var reg = new RegExp("({[" + i + "]})", "g")
                    result = result.replace(reg, arguments[i])
                }
            }
        }
        return result;
    }
    else {
        return this;
    }
}

var m_apiKey = 'tinypng压缩的key';

function m_logFunc(...arg) {
    if (Editor && Editor.log) {
        Editor.log(...arg);
    } else {
        console.log(...arg);
    }
}

function shrink(filePath, callBack) {
    m_logFunc("tinypng shrink file ", filePath);
    var curl = 'curl --user api:{0} --data-binary @{1} -H "Accept: application/json" \
    "https://api.tinify.com/shrink"'.format(m_apiKey, filePath);
    var child = child_process.exec(curl, (err, stdout, stderr) => {
        if (err) {
            m_logFunc("tinypng shrink err", stderr, filePath);
            callBack(false);
        }
        else {
            var shrinkInfo = JSON.parse(stdout);
            downloadFile(shrinkInfo.output.url, filePath, (success) => {
                callBack(success, shrinkInfo);
            });
        }
        child.kill("SIGTERM");
    })
}

function downloadFile(url, destFilePath, callBack) {
    var curl = 'curl {0} -s -o {1}'.format(url, destFilePath);
    var child = child_process.exec(curl, (err, stdout, stderr) => {
        if (err) {
            m_logFunc("tinypng downloadFile err", stderr, url, destFilePath);
            callBack(false);
        }
        else {
            callBack(true);
        }
        child.kill("SIGTERM");
    })
}

/**
* TinyPng 远程压缩 HTTPS 请求的配置生成方法
*/
function getAjaxOptions() {
    return {
        method: 'POST',
        hostname: 'tinypng.com',
        path: '/backend/opt/shrink',
        headers: {
            rejectUnauthorized: false,
            "X-Forwarded-For": Array(4).fill(1).map(() => parseInt(Math.random() * 254 + 1)).join('.'),
            'Postman-Token': Date.now(),
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
        }
    }
}

/**
 * TinyPng 远程压缩 HTTPS 请求
 * @param {string} imgPath 待处理的文件
 */
async function fileUpload(imgPath) {
    return new Promise((resolve, reject) => {
        let req = https.request(getAjaxOptions(), (res1) => {
            res1.on('data', buf => {
                let obj = JSON.parse(buf.toString());
                if (obj.error) {
                    reject(false);
                } else {
                    let options = new URL(obj.output.url);
                    let req2 = https.request(options, res => {
                        let body = '';
                        res.setEncoding('binary');
                        res.on('data', (data) => {
                            body += data;
                        });
                        res.on('end', () => {
                            let data = {
                                result: true,
                                obj: obj,
                                body: body
                            }
                            resolve(data);
                        });
                    });
                    req2.on('error', e => {
                        reject(false)
                    });
                    req2.end();
                }
            });
        });
        req.write(fs.readFileSync(imgPath), 'binary');
        req.on('error', e => reject(false));
        req.end();
    });
}

/**
 * 网络压缩
 * @param {string} imgPath 
 */
async function shrinkNic(imgPath) {
    return fileUpload(imgPath);
}

module.exports.shrink = shrink;
module.exports.shrinkNic = shrinkNic;