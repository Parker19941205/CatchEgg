export class Listener {
    public mListener: Function;
    public get listener(): Function {
        return this.mListener;
    }
    public mtarget: any;
    public get target() {
        return this.mtarget;
    }
    constructor(target: any, listener: Function) {
        this.mListener = listener;
        this.mtarget = target;
    }
}

export class EventMgr {
    private static instance: EventMgr = null;
    public static getInstance(): EventMgr {
        if (this.instance == null) {
            this.instance = new EventMgr();
        }
        return this.instance;
    }
    private global_event_list: Array<any>;

    private constructor() {
        this.global_event_list = new Array()
    }

    public on(event_type: string, target: any, function_call_back: Function, canMultile: boolean = false) {
        if (event_type == null || function_call_back == null) {
            console.error("RegistEvent Error");
            return;
        }
        if (this.global_event_list[event_type] == null) {
            this.global_event_list[event_type] = new Array();
        }
        if (!canMultile) {
            if (this.global_event_list[event_type]) {
                for (var i = 0; i < this.global_event_list[event_type].length; i++) {
                    if (this.global_event_list[event_type][i].listener == function_call_back
                        && this.global_event_list[event_type][i].target == target) {
                        return;
                    }
                };
            }
        }
        let listener = new Listener(target, function_call_back);
        this.global_event_list[event_type].push(listener);
    }
    public off(event_type: string, target: any, function_call_back: Function) {
        if (event_type == null || function_call_back == null) {
            return;
        };

        if (this.global_event_list[event_type] == null) {
            return;
        }

        for (var i = 0; i < this.global_event_list[event_type].length; i++) {
            if (this.global_event_list[event_type][i].listener == function_call_back
                && this.global_event_list[event_type][i].target == target) {
                this.global_event_list[event_type].splice(i, 1);
            }
        };

    }
    public removeAll() {
        this.global_event_list = new Array();
    }
    public emit(event_type: string, parame1?: any, parame2?: any, parame3?: any, parame4?: any, parame5?: any, parame6?: any) {
        if (event_type == null) {
            console.error("FireEvent Error");
            return;
        }
        if (this.global_event_list[event_type] == null) {
            return;
        }
        for (var i = 0; i < this.global_event_list[event_type].length; i++) {
            var call_function = this.global_event_list[event_type][i];
            if (call_function) {
                call_function.listener.call(call_function.target, parame1, parame2, parame3, parame4, parame5, parame6);
            }
        };
    }
}