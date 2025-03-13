import { LogMgr } from "../manager/LogMgr";

export class TimeUtils {
    /**获取当前的秒数 */
    public static GetTimeBySecond(): number {
        let date = new Date;
        let datetime = Math.floor(date.getTime() / 1000);
        return datetime;
    }
    public static GetTimeByHours(): string {
        let date = new Date();
        let Hours = date.getHours();
        let Hourstr = Math.floor(Hours / 10).toString() + Hours % 10;
        let Minutes = date.getMinutes();
        let Minutestr = Math.floor(Minutes / 10).toString() + Minutes % 10;
        return Hourstr + ":" + Minutestr;
    }
    /**格式化时间 格式：00：00：00 (时：分：秒)*/
    public static SecondToHours(second_num: number): string {
        let Seconds: any = second_num % 60;
        Seconds = Math.floor(Seconds / 10).toString() + Seconds % 10;
        let Minutes: any = Math.floor(second_num / 60) % 60;
        Minutes = Math.floor(Minutes / 10).toString() + Minutes % 10;
        let Hours: any = Math.floor(second_num / 60 / 60);
        Hours = Math.floor(Hours / 10).toString() + Hours % 10;
        return Hours + ":" + Minutes + ":" + Seconds;
    }

    /**格式化时间 格式：00：00 (分：秒)*/ 
    public static SecondToSeconds(second_num: number): string {
        let Seconds: any = second_num % 60;
        Seconds = Math.floor(Seconds / 10).toString() + Seconds % 10;
        let Minutes: any = Math.floor(second_num / 60) % 60;
        Minutes = Math.floor(Minutes / 10).toString() + Minutes % 10;
        return Minutes + "：" + Seconds;
    }

    /**格式化时间 格式：00：00 (时：分)*/ 
    public static SecondToMinutes(second_num: number): string {
        let Minutes: any = Math.floor(second_num / 60) % 60;
        Minutes = Math.floor(Minutes / 10).toString() + Minutes % 10;
        let Hours: any = Math.floor(second_num / 60 / 60);
        Hours = Math.floor(Hours / 10).toString() + Hours % 10;
        return Hours + ":" + Minutes
    }

      /**格式化时间 格式：00：00 (分：秒：毫秒)*/
      public static SecondToMilliSecond(millisecond: number): string {
        let milliseconds: any = millisecond % 1000;
        let second_num: any = Math.floor(millisecond / 1000);
        let Seconds: any = second_num % 60;
        Seconds = Math.floor(Seconds / 10).toString() + Seconds % 10;
        let Minutes: any = Math.floor(second_num / 60) % 60;
        Minutes = Math.floor(Minutes / 10).toString() + Minutes % 10;
        return Minutes + "：" + Seconds + "." + milliseconds;
    }

    /**格式化时间 格式：2021-10-10 */
    public static FormatDate2(time: number): string {
        let now = new Date(time);
        let _month = (10 > (now.getMonth() + 1)) ? '0' + (now.getMonth() + 1) : now.getMonth() + 1;
        let _day = (10 > now.getDate()) ? '0' + now.getDate() : now.getDate();
        return now.getFullYear() + '-' + _month + '-' + _day;
    }

    /**格式化时间 年/月/日 */
    public static FormatDate1(time: number, split: string = "/"): string {
        let data = new Date(time)
        return data.getFullYear() + split + (data.getUTCMonth() + 1) + split + data.getUTCDate()
    }
    /**获取过去了多少时间 30分钟前 */
    public static BeforeTime(time) {
        if (time == null) {
            return "";
        }
        let date = new Date;
        let datetime = Math.floor(date.getTime() / 1000);
        let second_num = datetime - time;
        if (second_num <= 0) {
            second_num = 1;
        }
        let time_str;
        if (Math.floor(second_num / 60 / 60 / 24) > 0) //天
        {
            time_str = Math.floor(second_num / 60 / 60 / 24) + "天前";
        } else if (Math.floor(second_num / 60 / 60) > 0) //小时
        {
            time_str = Math.floor(second_num / 60 / 60) + "小时前";
        } else if (Math.floor(second_num / 60) > 0) //分钟
        {
            time_str = Math.floor(second_num / 60) + "分钟前";
        } else //秒 
        {
            time_str = Math.floor(second_num) + "秒前";
        }
        return time_str;
    }

    /**比较是否是当天 */
    public static compareIsToday(time: number): boolean {
        let src = new Date(time * 1000)
        let src_year = src.getFullYear()
        let src_mo = src.getUTCMonth()
        let src_day = src.getUTCDay()
        let cur = new Date(this.GetTimeBySecond() * 1000)
        let cur_year = cur.getFullYear()
        let cur_mo = cur.getUTCMonth()
        let cur_day = cur.getUTCDay()
        if (src_year == cur_year && src_mo == cur_mo && src_day == cur_day) {
            return true;
        }
        return false;
    }
    /**超出几天 以当天开始时间比较的*/
    public static overDay(time: number): number {
        let src = new Date(time)
        let cur = new Date(this.dayStart())
        return Math.floor((cur.getTime() - src.getTime()) / (1000 * 60 * 60 * 24))
    }


    /**获取今天开始时间 */
    public static dayStart(): number {
        let daySart = new Date(new Date(new Date().toLocaleDateString()).getTime())
        return daySart.getTime()
    }
    /**获取今天结束时间 */
    public static dayEnd(): number {
        let dayEnd = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1)
        return dayEnd.getTime();
    }
    /**相差了几个小时 */
    public static getDiffHours(time: number): number {
        let curDate = new Date()
        let chours = curDate.getHours()
        let srcDate = new Date(time * 1000)
        let srcHours = srcDate.getHours()

        return chours - srcHours
    }
    /**得到指定时间 */
    public static getSplaceTime(hour: number, min: number): number {
        let date = new Date()
        //需要得到第二天的
        if (date.getHours() >= hour) {
            date.setHours(hour + 24)
        } else {
            date.setHours(hour)
        }
        date.setMinutes(min)
        date.setSeconds(0)
        return Number((date.getTime() / 1000).toFixed(0))
    }

    /**
     * 判断是否为当月的最后一天
     */
    public static isLastDayOfMonth(time: number): boolean {
        let flag: boolean = false;
        let date = new Date(time);
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let today = date.getDate();
        let new_year = year; //取当前的年份
        let new_month = month++;//取下一个月的第一天，方便计算（最后一天不固定）
        if (month > 12) {//如果当前大于12月，则年份转到下一年
            new_month -= 12; //月份减
            new_year++; //年份增
        }
        let new_date = new Date(new_year, new_month, 1); //取当年当月中的第一天

        let month_last_day = (new Date(new_date.getTime() - 1000 * 60 * 60 * 24)).getDate();
        if (today == month_last_day) {
            flag = true;
        }
        return flag;
    }


    /**时间转成文本显示 */
    public static timeToStr(time) {
        if (time == null || time < 0) {
            return "";
        }        
        let time_str;
        if (Math.floor(time / 60 / 60 / 24) > 0) //天
        {
            time_str = Math.floor(time / 60 / 60 / 24) + "天";
        } else if (Math.floor(time / 60 / 60) > 0) //小时
        {
            time_str = Math.floor(time / 60 / 60) + "小时";
        } else if (Math.floor(time / 60) > 0) //分钟
        {
            time_str = Math.floor(time / 60) + "分钟";
        } else //秒 
        {
            time_str = Math.floor(time) + "秒";
        }
        return time_str;
    }
}