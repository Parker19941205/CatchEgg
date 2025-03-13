export default class Logger {

    private static level: number = 0;

    private static DEBUG: number = 0;
    private static INFO: number = 1;
    private static ERROR: number = 2;
    private static PROGRESS: number = 3;

    private static _logLimit: 50
    private static _logCache: any[] = []

    public static init(level: any) {
        Logger.level = level;
    }

    static realLog(msg: string | any, ...subst: any[]) {
        cc.log(msg, subst);
    }

    public static markLog(msg: string | any, ...subst: any[]) {
        // if (this._logCache.length > this._logLimit) {
        //     this._logCache.pop()
        // }
        // this._logCache.push({ msg: msg, subst: subst })
    }

    public static getLogCache() {
        return this._logCache
    }

    /**
     * DEBUG级别的日志`
     * @param msg
     * @param subst
     */
    public static debug(msg: string | any, ...subst: any[]): void {
        if (Logger.level == Logger.DEBUG) {
            Logger.realLog("debug::" + msg, subst);
        }
        this.markLog(msg, subst)
    }

    /**
     * INFO级别的日志
     * @param msg
     * @param subst
     */
    public static info(msg: string | any, ...subst: any[]): void {
        if (Logger.level <= Logger.INFO) {
            Logger.realLog("info::" + msg, subst);
        }
        this.markLog(msg, subst)
    }

    /**
     * ERROR级别的日志
     * @param msg
     * @param subst
     */
    public static error(msg: string | any, ...subst: any[]): void {
        if (Logger.level <= Logger.ERROR) {
            Logger.realLog("error::" + msg, subst);
        }
        this.markLog(msg, subst)
    }

    /**
     * 游戏进程级别的日志
     * @param msg
     * @param subst
     */
    public static process(msg: string | any, ...subst: any[]): void {
        if (Logger.level <= Logger.PROGRESS) {
            Logger.realLog("process::" + msg, subst);
        }
        this.markLog(msg, subst)
    }

    /**
     * 打印对应平台的native日志
     * @param msg
     * @param subst
     */
    public static native(msg: string | any, ...subst: any[]) {
        cc.log(msg, subst);
    }

}