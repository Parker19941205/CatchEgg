export class NetMgr {
    private static instance: NetMgr = null;
    protected constructor() { }
    public static getInstance(): NetMgr {
        if (this.instance == null) {
            this.instance = new NetMgr();
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