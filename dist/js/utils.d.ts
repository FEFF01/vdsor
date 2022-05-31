declare type IMatchFunc = (env: MatchEnv, isFinal: boolean, arg?: any) => boolean | void;
/**
 * 0 为 DATA_TYPES_MARK 标记或者任意匹配字符串解析数据
 * 1 为 data types 的 key 值，或者匹配目标字符串
 * 2 为匹配目标的结束下标
 */
declare type IFound = Array<[any, string, number]>;
declare type IWalker = (next: IMatchFunc) => IMatchFunc;
interface IPattern {
    match?: IMatchFunc;
    walker: IWalker;
}
export { getRange, walker, MatchEnv, IPattern, IFound, IMatchFunc, IWalker };
declare function walker(match: IMatchFunc): (next: IMatchFunc) => IMatchFunc;
declare class MatchEnv {
    tokens: Array<any>;
    pattern?: IPattern;
    index: number;
    token: any;
    found: IFound;
    success: boolean;
    constructor(tokens: Array<any>, pattern?: IPattern);
    store(): [number, number];
    restore([index, length]: [number, number]): void;
    next(): number;
    prev(): number;
    compareIndex(index?: number): number;
    isSuccess(isFinal: boolean, offset: number): boolean;
}
declare function getRange(tokens: Array<any>): [number, number];
