

type IMatchFunc = (env: MatchEnv, isFinal: boolean, arg?: any) => boolean | void;
/**
 * 0 为 DATA_TYPES_MARK 标记或者任意匹配字符串解析数据
 * 1 为 data types 的 key 值，或者匹配目标字符串
 * 2 为匹配目标的结束下标
 */
type IFound = Array<[any, string, number]>;

type IWalker = (next: IMatchFunc) => IMatchFunc;

interface IPattern {
    match?: IMatchFunc,
    walker: IWalker
}

export {
    getRange,
    walker,
    MatchEnv,
    IPattern,
    IFound,
    IMatchFunc,
    IWalker
}


function walker(match: IMatchFunc) {
    return function (next: IMatchFunc): IMatchFunc {
        if (next) {
            return function (env, isFinal, arg) {
                const state = env.store();
                if (match(env, false, arg)) {
                    if (next(env, isFinal)) {
                        return true;
                    }
                    env.restore(state);
                }
            };
        }
        return match;
    }
}

class MatchEnv {
    index: number;
    token: any;
    found: IFound = [];
    success = false;
    constructor(public tokens: Array<any>, public pattern?: IPattern) {
        let index = 0;

        this.token = tokens[index];
        Object.defineProperties(this, {
            index: {
                get() { return index; },
                set(val: number) {
                    index = val;
                    this.token = this.tokens[index];
                }
            }
        });
    }
    store(): [number, number] {
        return [this.index, this.found.length];
    }
    restore([index, length]: [number, number]) {
        this.index = index;
        this.found.length = length;
    }
    next() {
        const { index, tokens } = this;
        if (tokens.length > index) {
            this.index = index + 1;
        }
        return index;
    }
    prev() {
        const index = this.index;
        if (index > 0) {  // 会使 token = undefined
            this.index = index - 1;
        }
        return index;
    }
    compareIndex(index: number = -1) {
        return index - this.index;
    }
    isSuccess(isFinal: boolean, offset: number) {
        return !isFinal || this.index >= this.tokens.length - offset;
    }
}


function isPositiveInteger(value: number) {
    return typeof value === "number" && value >= 0 && !(value % 1);
}

function getRange(tokens: Array<any>) {
    let index = 0;
    let value = tokens[index];
    const range: [number, number] = [value, value];

    do {
        value = tokens[index];
        if (!isPositiveInteger(value)) {
            debugger;
        }
        range[index >> 1] = value;

        index += 2;
        if (index - 1 < tokens.length) {
            if (tokens[index - 1].value !== ",") {
                debugger;
            } else {
                range[index >> 1] = Number.MAX_SAFE_INTEGER;
            }
        }
    } while (index < tokens.length)

    return range;
}
