import List from "../commonts/List";

export class Utils {
    /**
        * 格式化字符串
        * js.formatStr("a: %s, b: %s", a, b);
        * js.formatStr(a, b, c);
        * @param msg 
        * @param subst 
        */
    public static formatStr(msg: string | any, ...subst: any[]): string {
        return cc.js.formatStr(msg, subst);
    }

    /**
     * 格式化字符 eg:CommUtils.StringFormat("需要x{0}x{1}金币",200,00) 
     * @param src 需要格式化的字符串 eg:需要x{0}金币
     * @param any 参数
     */
    public static StringFormat(src: string, ...any) {
        for (let i = 0; i < any.length; i++) {
            var reg = new RegExp("\\{" + i + "\\}", "gm");
            src = src.replace(reg, arguments[i + 1]);
        }
        return src
    }
    /**
     * 金钱转换成格式 1,000
     * @param num 多少金币
     */
    public static formatGold(num): string {
        let str = (num + '').replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, '$1,');

        return str
    }
    /**
      * 产生随机整数，包含下限值，但不包括上限值
      * @param {Number} lower 下限
      * @param {Number} upper 上限
      * @return {Number} 返回在下限到上限之间的一个随机整数
      */
    public static randomRang(minNum: number, maxNum: number) {
        return Math.floor(Math.random() * (maxNum - minNum)) + minNum;
    }

    public static getRange(min: number, max: number): number[] {
        let num: number[] = [];
        for (let i = min; i < max + 1; i++) {
            num.push(i);
        }
        return num;
    }

    /**
    * js数组实现权重概率分配，支持数字比模式(支持2位小数)和百分比模式(不支持小数，最后一个元素多退少补)
    * 参数arr元素必须含有weight属性，参考如下所示
    *    var arr=[{name:'1',weight:1.5},{name:'2',weight:2.5},{name:'3',weight:3.5}];
    *    var arr=[{name:'1',weight:'15%'},{name:'2',weight:'25%'},{name:'3',weight:'35%'}];
    *    求出最大公约数以计算缩小倍数，perMode为百分比模式
    * @param Array arr js数组，参数类型[{name:'1',weight:1.5},{name:'2',weight:2.5},{name:'3',weight:3.5}]
    * @return Array 返回一个随机元素，概率为其weight/所有weight之和，参数类型Object
    * @author shuiguang
    */
    public static weight_rand(arr): any {
        var per;
        var maxNum = 0;
        var perMode = false;
        //自定义Math求最小公约数方法
        let gcd = function (a, b) {
            var min = Math.min(a, b);
            var max = Math.max(a, b);
            var result = 1;
            if (a === 0 || b === 0) {
                return max;
            }
            for (var i = min; i >= 1; i--) {
                if (min % i === 0 && max % i === 0) {
                    result = i;
                    break;
                }
            }
            return result;
        };
        //使用clone元素对象拷贝仍然会造成浪费，但是使用权重数组对应关系更省内存
        var weight_arr = new Array();
        for (let i = 0; i < arr.length; i++) {
            if ('undefined' != typeof (arr[i].weight)) {
                if (arr[i].weight.toString().indexOf('%') !== -1) {
                    per = Math.floor(arr[i].weight.toString().replace('%', ''));
                    perMode = true;
                } else {
                    per = Math.floor(arr[i].weight * 100);
                }
            } else {
                per = 0;
            }
            weight_arr[i] = per;
            maxNum = gcd(maxNum, per);
        }
        //cc.log("weight_arr=======>",weight_arr)
        //数字比模式，3:5:7，其组成[0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2]
        //百分比模式，元素所占百分比为15%，25%，35%
        var index = new Array();
        var total = 0;
        var len = 0;
        if (perMode) {
            for (let i = 0; i < arr.length; i++) {
                //len表示存储arr下标的数据块长度，已优化至最小整数形式减小索引数组的长度
                len = weight_arr[i];
                for (let j = 0; j < len; j++) {
                    //超过100%跳出，后面的舍弃
                    if (total >= 100) {
                        break;
                    }
                    index.push(i);
                    total++;
                }
            }
            //使用最后一个元素补齐100%
            while (total < 100) {
                index.push(arr.length - 1);
                total++;
            }
        } else {
            for (let i = 0; i < arr.length; i++) {
                //len表示存储arr下标的数据块长度，已优化至最小整数形式减小索引数组的长度
                len = weight_arr[i] / maxNum;
                for (let j = 0; j < len; j++) {
                    index.push(i);
                }
                total += len;
            }
        }
        //随机数值，其值为0-11的整数，数据块根据权重分块
        var rand = Math.floor(Math.random() * total);
        //console.log(index);
        return arr[index[rand]];
    }

    /**
     * 
     * @param str 需要加密的字符
     * @param pwd 加密的密钥
     */
    public static encrypt(str, pwd): string {
        if (pwd == null || pwd.length <= 0) {
            //alert("Please enter a password with which to encrypt the message.");
            return null;
        }
        let prand: any = "";
        for (let i = 0; i < pwd.length; i++) {
            prand += pwd.charCodeAt(i).toString();
        }
        let sPos = Math.floor(prand.length / 5);
        let mult = parseInt(prand.charAt(sPos) + prand.charAt(sPos * 2) + prand.charAt(sPos * 3) + prand.charAt(sPos * 4) + prand.charAt(sPos * 5));
        let incr = Math.ceil(pwd.length / 2);
        let modu = Math.pow(2, 31) - 1;
        if (mult < 2) {
            //alert("Algorithm cannot find a suitable hash. Please choose a different password. \nPossible considerations are to choose a more complex or longer password.");
            return null;
        }
        let salt: any = Math.round(Math.random() * 1000000000) % 100000000;
        prand += salt;
        while (prand.length > 10) {
            prand = (parseInt(prand.substring(0, 10)) + parseInt(prand.substring(10, prand.length))).toString();
        }
        prand = (mult * prand + incr) % modu;
        let enc_chr: any = "";
        let enc_str: any = "";
        for (let i = 0; i < str.length; i++) {
            let temp = (str.charCodeAt(i) ^ Math.floor((prand / modu) * 255)) + ""
            enc_chr = parseInt(temp);
            if (enc_chr < 16) {
                enc_str += "0" + enc_chr.toString(16);
            } else enc_str += enc_chr.toString(16);
            prand = (mult * prand + incr) % modu;
        }
        salt = salt.toString(16);
        while (salt.length < 8) salt = "0" + salt;
        enc_str += salt;
        return enc_str;
    }
    /**
     * 
     * @param str 解密的字符
     * @param pwd 解密的密码
     */
    public static decrypt(str, pwd): string {
        if (str == null || str.length < 8) {
            //alert("A salt value could not be extracted from the encrypted message because it's length is too short. The message cannot be decrypted.");
            return;
        }
        if (pwd == null || pwd.length <= 0) {
            //alert("Please enter a password with which to decrypt the message.");
            return;
        }
        let prand: any = "";
        for (let i = 0; i < pwd.length; i++) {
            prand += pwd.charCodeAt(i).toString();
        }
        let sPos = Math.floor(prand.length / 5);
        let mult = parseInt(prand.charAt(sPos) + prand.charAt(sPos * 2) + prand.charAt(sPos * 3) + prand.charAt(sPos * 4) + prand.charAt(sPos * 5));
        let incr = Math.round(pwd.length / 2);
        let modu = Math.pow(2, 31) - 1;
        let salt = parseInt(str.substring(str.length - 8, str.length), 16);
        str = str.substring(0, str.length - 8);
        prand += salt;
        while (prand.length > 10) {
            prand = (parseInt(prand.substring(0, 10)) + parseInt(prand.substring(10, prand.length))).toString();
        }
        prand = (mult * prand + incr) % modu;
        let enc_chr: any = "";
        let enc_str: any = "";
        for (let i = 0; i < str.length; i += 2) {
            enc_chr = parseInt((parseInt(str.substring(i, i + 2), 16) ^ Math.floor((prand / modu) * 255)) + "");
            enc_str += String.fromCharCode(enc_chr);
            prand = (mult * prand + incr) % modu;
        }
        return enc_str;
    }
    /**
    * 随机生产不同的数组下标
    * @param len 数组的长度
    * @param max 需要生产几个id
    * @param arr 生产的id数组
    */
    public static randomDiffIndex(len: number, max: number, arr: number[]) {
        let idx = this.randomRang(0, len)
        if (this.checkExist(idx, arr)) {
            this.randomDiffIndex(len, max, arr)
        } else {
            arr.push(idx)
            if (arr.length < max) {
                this.randomDiffIndex(len, max, arr);
            }
        }
    }
    private static checkExist(idx: number, arr: number[]): boolean {
        for (let i = 0; i < arr.length; i++) {
            let id = arr[i]
            if (id == idx) {
                return true;
            }
        }
        return false;
    }

    /**
*map转换为json
*/
    public static mapToJson(map: Map<number, number>): string {
        //msp转object
        return this.MapTOJson(map);
    }

    /**
     *json转换为map
     */
    public static jsonToMap(jsonStr): Map<number, number> {
        let obj = JSON.parse(jsonStr)
        let new_map = new Map()
        for (let key of Object.keys(obj)) {
            new_map.set(Number(key), Number(obj[key]))
        }
        return new_map;
    }
    /**
     * Map转json
     * @param m
     * @returns String
     */
    public static MapTOJson(m): string {
        var str = '{';
        var i = 1;
        m.forEach(function (item, key, mapObj) {
            if (mapObj.size == i) {
                str += '"' + key + '":"' + item + '"';
            } else {
                str += '"' + key + '":"' + item + '",';
            }
            i++;
        });
        str += '}';
        return str;
    }

    /**
     * 金币格式转换
     * @param value
     * @returns string
     */
    public static unitGold(value: number){
        let units = ['', '万', '亿', '兆', '京'];
        if (!value) return '0';
        let count = 0;
        for (let i = 0; i < 4; i++) {
            if (value >= 10000) {
                value /= 10000;
                count++;
            }
        }
        let xx = value < 10 ? 2 : value < 100 ? 2 : value < 1000 ? 1 : 0;
        return parseFloat(value.toFixed(xx)) + units[count];
    }

     /**
     * 百分位、千分位数字去零头 4123→4100，364→360
     * @param value
     * @returns string
     */
     public static unitGoldInter(value: number){
        let units = ['', '万', '亿', '兆', '京'];

        if (!value) return '0';
        let count = 0;
        for (let i = 0; i < 4; i++) {
            if (value >= 10000) {
                value /= 10000;
                count++;
            }
        }
        let xx = value < 10 ? 2 : value < 100 ? 2 : value < 1000 ? 1 : 0;
        let number = Math.round(parseFloat(value.toFixed(xx)))
        let length = String(number).length
        let newNumber = number

        if(length == 4){
            newNumber = Math.round(number / 100)*100
        }else if(length == 3){
            newNumber = Math.round(number / 10)*10
        }

        //cc.log("数字1====>",newNumber)
        //cc.log("取余后的整值",newNumber + units[count])

        return newNumber + units[count];
    }

    /**
     * 对象是否为空
     * @returns boolean
     */
    public static isNullObj(obj): boolean {
        if(obj == null || obj == undefined || obj == "" || JSON.stringify(obj) === "{}"){
            return true
        }
        return false
    }

    /**
     * 是否为数字
     * @param value 
     * @returns boolean
     */
    public static isNumber(value: any): boolean {
        return !isNaN(value);
    }
 
    /**
     * 数字是否在数组里
     * @param arr 
     * @param numberToCheck 
     * @returns 
     */
    public static isNumberInArray(arr: number[], numberToCheck: number): boolean {
        return arr.includes(numberToCheck);
    }

     /**
     * 对象数组转成数组
     * @param obj 
     * @returns 
     */
    public static objToArr(obj){
        let arr = []
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                arr.push(obj[key])
            }
        }
        return arr
    }

    /**
     * 深拷贝
     * @param obj 拷贝对象
     * @returns obj
     */
    public static deepClone<T>(obj: T): T {
        // 检查值是否是对象或数组
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
    
        // 检查是否是数组
        if (Array.isArray(obj)) {
            const arrCopy = [] as any[];
            for (const item of obj) {
                arrCopy.push(this.deepClone(item));
            }
            return arrCopy as any as T;
        }
    
        // 处理普通对象
        const objCopy = {} as { [key: string]: any };
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                objCopy[key] = this.deepClone((obj as { [key: string]: any })[key]);
            }
        }
    
        return objCopy as T;
    }
    
    /**
     * 截取字符串长度，超出部分用...代替
     * @param str 
     * @param maxLength 
     * @returns 
     */
    public static subNameStr(str: string, maxLength: number = 7): string {
        if(str == null || str.length == 0) return ""
        if (str.length <= maxLength) {
            return str;
        } else {
            return str.substring(0, maxLength) + "...";
        }
    }
 
    
 


}