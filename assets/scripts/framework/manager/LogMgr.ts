export class LogMgr {
    private static instance: LogMgr = null;
    protected constructor() { }
    public static getInstance(): LogMgr {
        if (this.instance == null) {
            this.instance = new LogMgr();
        }
        return this.instance;
    }

    public debug(str: string, params?: any) {
        if (CC_DEV) {
            console.log(str, params)
        }
    }
    public info(str: string, params?: any) {
        console.log(str, params)
    }
    public error(str: string, params?: any) {
        console.error(str, params)
    }
}