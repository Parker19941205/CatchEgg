'use strict';

var path = require('path');
var fs = require('fs-extra');
const m_tinypng = require('./tinypng');

var compress_data = {
    /** 保存目录 */
    dir_save: "compress_dir",
    /** 压缩模式 */
    _modes: [
        { "name": "不压缩", "id": 0 },
        { "name": "网络压缩", "id": 1 }
    ],
    /** 当前选择压缩模式 */
    mode_choose: 0,
    /** 跳过目录 */
    dir_jump: ["internal"],
    /** 需要判断子包的平台 */
    plat_sub: ["qgame", "quickgame"],
    /** 待压缩文件列表 */
    compress_file_list: [],
    /* 压缩文件缓存*/
    compressed_file_set: null,
    /** 压缩前大小 */
    m_totalInputSize: 0,
    /** 压缩后大小 */
    m_totalOutputSize: 0,
    /** 压缩后文件夹名称 */
    name_save_dir: "compress_dir",
    /** 压缩列表每组长度 */
    count_group: 10,
    /** 需要压缩的文件数量 */
    count_file_compress: 0,
    /** 模式选择提示 */
    _modeTipStr: [
        '压缩模式选择： 不压缩',
        '压缩模式选择： 构建后压缩'
    ],
    /** 是否面板压缩 */
    panel_compress: false,
    /** 构建后保存目录 */
    builded_save_dir: 'compress_dir'
};

/** 压缩完回调 */
var onCompressFinished = null;

/** 单张压缩完回调 */
var singleShrinkedCb = null;

function log(...arg) {
    // if (!compress_data.panel_compress) {
    Editor.log(...arg);
    // }
}

/** 
 * 读取压缩缓存目录
 */
function readShrinkDir() {
    if (!fs.existsSync(compress_data.dir_save)) {
        fs.mkdirSync(compress_data.dir_save);
    }
    var fileArr = fs.readdirSync(compress_data.dir_save);
    compress_data.compressed_file_set = new Set(fileArr);
    log("Tip: 读取压缩缓存目录 - ", compress_data.dir_save);
}

/**
 * 匹配文件夹中的图片
 * @param {{dirs:string[],jumpdir:string[],cb?:Function}} obj 
 */
async function matchImg(obj) {
    log('Tip: 开始匹配待压缩目录...');
    let matchList = obj.dirs || [];
    let fileList = [];
    let groupIdx = 0;
    let fileCount = 0;
    let matchedCb = function () {
        if (matchList.length > 0) {
            log(`Tip: 单次匹配目录完成! `);
            match();
        } else {
            log(`Tip: 待压缩目录全部匹配完成! `);
            obj.cb && obj.cb({
                list: fileList,
                count: fileCount
            });
        }
    };
    let match = function () {
        let dir = matchList[0];
        log('Tip: 匹配目录 - ', dir);
        for (let i = 0; i < obj.jumpdir.length; i++) {
            let index = i;
            if (!!obj.jumpdir[index] && dir.endsWith(obj.jumpdir[index])) {
                log("Tip: 跳过目录 - ", obj.jumpdir[index]);
                matchList.shift();
                matchedCb();
                return;
            }
        }
        let fileArr = fs.readdirSync(dir);
        fileArr.forEach((el, index) => {
            let fileOrDir = dir + "/" + el;
            let info = fs.statSync(fileOrDir);
            if (info.isDirectory()) {
                matchList.push(fileOrDir);
            } else {
                let ext = path.extname(fileOrDir);
                if ([".png", ".jpg"].indexOf(ext) != -1) {
                    !fileList[groupIdx] && (fileList[groupIdx] = []);
                    fileList[groupIdx].push([fileOrDir, el]);
                    if (fileList[groupIdx].length >= compress_data.count_group) {
                        groupIdx += 1;
                    }
                    fileCount += 1;
                }
            }
        });
        matchList.shift();
        return matchedCb();
    }
    match();
}

/** 遍历要压缩的图片文件 */
function checkShrinkFile(options, cb) {
    compress_data.compress_file_list = [];
    let dir = path.join(options.dest, 'assets');
    let checkList = [];
    checkList.push(dir);
    if (options.platform === "runtime") {
        let plat = options.actualPlatform;
        if (compress_data.plat_sub.indexOf(plat) !== -1) {
            let subdir = path.join(options.dest, "subpackages");
            if (fs.existsSync(subdir)) {
                checkList.push(subdir);
            }
        }
    }
    log('Tip: 遍历目录 - ', checkList);
    let matchObj = {
        dirs: checkList,
        jumpdir: compress_data.dir_jump,
        cb(res) {
            cb && cb(res);
        }
    }
    matchImg(matchObj);
}

/**
 * 执行文件压缩
 */
async function compress() {
    let fileGroup = compress_data.compress_file_list[0];
    let numHasCompress = 0;
    let fileNameList = [];
    fileGroup.forEach(el => {
        fileNameList.push(el[1]);
    });
    log('Tip: 开始压缩单组图片 - ', fileNameList);
    fileGroup.forEach((el, i) => {
        let file = fileGroup[i][0];
        let fileName = fileGroup[i][1];
        // - 单个文件压缩完成回调
        let shrinkSingleCb = (isSuccess, tipLeft = false) => {
            numHasCompress += 1;
            compress_data.count_file_compress -= 1;
            tipLeft
                ? log("Tip: 单个文件压缩完成 - " + fileName + " 结果 - " + isSuccess + " 剩余文件数目 - " + compress_data.count_file_compress)
                : log("Tip: 文件已经有压缩缓存（直接替换） - " + fileName + " 剩余：" + compress_data.count_file_compress);
            if (!!singleShrinkedCb) {
                singleShrinkedCb({
                    file: fileName,
                    left: compress_data.count_file_compress
                });
            }
            if (compress_data.count_file_compress > 0 && numHasCompress == fileGroup.length) {
                compress_data.compress_file_list.shift();
                if (compress_data.compress_file_list.length > 0) {
                    compress();
                    return false;
                }
            }
            return compress_data.count_file_compress <= 0;
        };
        // - 缓存文件夹中已有，直接替换
        if (compress_data.compressed_file_set.has(fileName)) {
            let body = fs.readFileSync(path.join(compress_data.dir_save, fileName), 'binary');
            fs.writeFileSync(file, body, 'binary');
            if (shrinkSingleCb(true)) {
                onCompressFinished({
                    input: compress_data.m_totalInputSize,
                    output: compress_data.m_totalOutputSize
                });
            }
            return;
        }
        // - TODO 添加更多压缩方式,待定
        switch (compress_data.mode_choose) {
            // - 网络压缩
            case 1: {
                m_tinypng.shrinkNic(file).then((data) => {
                    if (data.result) {
                        compress_data.m_totalInputSize += data.obj.input.size;
                        compress_data.m_totalOutputSize += data.obj.output.size;
                        fs.writeFileSync(path.join(compress_data.dir_save, fileName), data.body, 'binary');
                        fs.writeFileSync(file, data.body, 'binary');
                    }
                    if (shrinkSingleCb(data.result, true)) {
                        onCompressFinished({
                            input: compress_data.m_totalInputSize,
                            output: compress_data.m_totalOutputSize
                        });
                    }
                }).catch(err => {
                    if (shrinkSingleCb(false, true)) {
                        onCompressFinished({
                            input: compress_data.m_totalInputSize,
                            output: compress_data.m_totalOutputSize
                        });
                    }
                });
                break;
            }
        }
    });
}

/**
 * 执行压缩
 * @returns 
 */
async function compressStart() {
    if (!compress_data.compress_file_list.length) {
        onCompressFinished();
        return true;
    }
    compress();
}

/**
 * 开始构建回调
 * @param {{[key:string]:any}} options 
 * @param {Function} callback 
 */
function onBuildStart(options, callback) {
    log('', Editor.Builder);
    compress_data.dir_save = path.join(options.buildPath, compress_data.builded_save_dir);
    compress_data.panel_compress = false;
    compress_data.m_totalInputSize = 0;
    compress_data.m_totalOutputSize = 0;
    singleShrinkedCb = null;
    if (compress_data.mode_choose === 0) {
        log("Tip: 本次构建不压缩图片资源!");
    } else {
        log("Tip: 本次压缩缓存路径 - ", compress_data.dir_save);
    }
    callback();
}

/**
 * 构建完成回调
 * @param {{[key:string]:any}} options 
 * @param {Function} callback 
 */
function onBuildFinish(options, callback) {
    if (compress_data.mode_choose !== 0) {
        compress_data.m_totalInputSize = 0;
        compress_data.m_totalOutputSize = 0;
        readShrinkDir();
        checkShrinkFile(options, function (res) {
            log("Tip: 压缩目录检测返回 - ", res);
            if (res.list.length <= 0) {
                callback();
            } else {
                onCompressFinished = function () {
                    log("Tip: 压缩前总大小 " + compress_data.m_totalInputSize + ",压缩后总大小" + compress_data.m_totalOutputSize);
                    callback();
                };
                compress_data.compress_file_list = res.list;
                compress_data.count_file_compress = res.count;
                log("Tip: 待压缩文件总数目:", res.count);
                compressStart();
            }
        });
    } else {
        callback();
    }
}

function load() {
    Editor.Builder.on('build-finished', onBuildFinish);
    Editor.Builder.on('build-start', onBuildStart);
}

function unload() {
    Editor.Builder.removeListener('build-finished', onBuildFinish);
    Editor.Builder.removeListener('build-start', onBuildStart);
}

/** 设置压缩模式 */
function setCompressMode(mode) {
    let tipStr = compress_data._modeTipStr[mode];
    compress_data.mode_choose = mode;
    log(tipStr, mode);
}

/**
 * 面板压缩参数传输
 * @param {{
 * jumpdir:string[],
 * matchCb:Function,
 * savedir:string
 * }} obj 
 * @returns 
 */
function panelCompress(obj) {
    if (!obj) return;
    !obj.jumpdir && (obj.jumpdir = []);
    !obj.editor && (obj.editor = false);
    compress_data.panel_compress = true;
    compress_data.m_totalInputSize = 0;
    compress_data.m_totalOutputSize = 0;
    compress_data.mode_choose = 1;
    compress_data.dir_save = obj.savedir || path.join(obj.dirs[0], compress_data.builded_save_dir);
    log('Tip: 压缩保存路径 - ', compress_data.dir_save, obj.jumpdir);
    let match_obj = {
        dirs: [...obj.dirs],
        cb(res) {
            compress_data.compress_file_list = res.list;
            compress_data.count_file_compress = res.count;
            obj.matchCb && obj.matchCb(res);
        },
        jumpdir: [...obj.jumpdir],
        editor: false
    };
    matchImg(match_obj);
}

/**
 * 面板压缩开始指令
 * @param {{
 * progressCb:Function,
 * completeCb:Function
 * }} obj 
 */
function panelCompressCmd(obj) {
    singleShrinkedCb = function (res) {
        obj.progressCb(res);
    }
    onCompressFinished = function (res) {
        obj.completeCb(res);
    }
    readShrinkDir();
    compressStart();
}

module.exports.load = load;
module.exports.unload = unload;
module.exports.panelCompress = panelCompress;
module.exports.setCompressMode = setCompressMode;
module.exports.panelCompressCmd = panelCompressCmd;

