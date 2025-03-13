var fs = require('fs');
var path = require('path');
var yasuo = require('./../script/yasuo');

var defaultTipTxt = `未选择保存文件夹，会在压缩文件夹下\n创建'compress-dir'保存`

Editor.Panel.extend({
    // css style for panel
    style: fs.readFileSync(Editor.url('packages://nicoluss-tool/panel/index.css'), 'utf-8'),

    // html template for panel
    template: fs.readFileSync(Editor.url('packages://nicoluss-tool/panel/index.html'), 'utf-8'),

    ready() {
        this.vm = new window.Vue({
            el: this.shadowRoot,
            data: {
                tipContent: defaultTipTxt,// 提示文本
                choosedYasuoDir: false,// 已选择了压缩
                yasuoDir: '',// 压缩文件夹
                jumpDir: '',// 跳过文件夹
                saveDir: '',// 保存文件夹
                fileCount: 0,// 待压缩文件数
                yasuoing: false// 是否压缩中
            },

            methods: {

                /**
                 * 匹配待压缩文件夹回调
                 * @param {{list:any[],count:number}} res 
                 */
                _matchCb(res) {
                    this.fileCount = res.count;
                    this.tipContent = `待压缩文件数:${this.fileCount}`;
                },

                /**
                 * 确定选择
                 * @returns 
                 */
                confirmChoose() {
                    if (!this.yasuoDir) {
                        this.tipContent = '未选择压缩文件夹';
                        return;
                    }
                    this.choosedYasuoDir = true;
                    let obj = {
                        dirs: [this.yasuoDir],
                        jumpdir: this.jumpDir.split(','),
                        savedir: this.saveDir,
                        matchCb: (res) => {
                            this._matchCb(res);
                        }
                    };
                    if (!!this.saveDir) {
                        obj.savedir = this.saveDir;
                    } else {
                        this.saveDir = this.yasuoDir + '\\compress_dir';
                    }
                    yasuo.panelCompress(obj);
                },

                /**
                 * 选择待压缩文件夹
                 */
                chooseYasuoDir() {
                    let srcs = Editor.Dialog.openFile({
                        defaultPath: Editor.projectInfo.path,
                        properties: ['openDirectory']
                    });
                    if (srcs[0]) {
                        this.yasuoDir = srcs[0];
                        this.tipContent = defaultTipTxt;
                    } else {
                        this.yasuoDir = '';
                        this.tipContent = '未选择压缩文件夹';
                    }
                },

                /**
                 * 选择保存文件夹
                 */
                chooseSaveDir() {
                    let srcs = Editor.Dialog.openFile({
                        defaultPath: Editor.projectInfo.path,
                        properties: ['openDirectory']
                    });
                    if (srcs[0]) {
                        this.saveDir = srcs[0];
                        this.tipContent = `保存文件路径：${this.saveDir}`;
                    } else {
                        this.saveDir = '';
                        this.tipContent = defaultTipTxt;
                    }
                },

                /**
                 * 选择跳过目录
                 * @param {any} e 
                 */
                chooseJump(e) {
                    this.jumpDir = e.target.value;
                },

                /**
                 * 压缩进度回调
                 * @param {{
                 * file:string,
                 * left:number
                 * }} res 
                 */
                _proresscb(res) {
                    this.tipContent = `当前压缩文件：${res.file};当前已压缩:${this.fileCount - res.left}, 剩余待压缩:${res.left}`
                },

                /**
                 * 压缩完成回调
                 * @param {*} res 
                 */
                _completeCb(res) {
                    this.tipContent = `全部压缩完成! 压缩前大小:${res.input};压缩后大小:${res.output}`;
                    let timer = setTimeout(() => {
                        this.yasuoing = false;
                        this.choosedYasuoDir = false;
                        clearTimeout(timer);
                    }, 50);
                },

                /**
                 * 开始压缩
                 * @returns 
                 */
                startYauo() {
                    if (this.yasuoing) {
                        Editor.warn('Tip: 压缩中!');
                        return;
                    }
                    let obj = {
                        progressCb: (res) => {
                            this._proresscb(res);
                        },
                        completeCb: (res) => {
                            this._completeCb(res);
                        }
                    }
                    yasuo.panelCompressCmd(obj);
                    this.yasuoing = true;
                },
                /**
                 * 取消压缩选择
                 */
                cancelChoose() {
                    if (this.yasuoing) {
                        Editor.warn('Tip: 压缩中!');
                        return;
                    }
                    this.saveDir = '';
                    this.jumpDir = '';
                    this.yasuoDir = '';
                    this.fileCount = 0;
                    this.yasuoing = false;
                    this.choosedYasuoDir = false;
                    this.tipContent = defaultTipTxt;
                    Editor.success("Tip: 取消压缩");
                }
            }
        });
    },

});