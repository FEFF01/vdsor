declare type IMatchFunc = (env: MatchEnv, isFinal: boolean, arg?: any) => boolean | void;
declare type IFound = Array<[any, string, number]>;
declare type IWalker = (next: IMatchFunc) => IMatchFunc;
interface IPattern {
    match?: IMatchFunc;
    walker: IWalker;
}
export { getRange, walker, MatchEnv, IPattern, IFound, IMatchFunc, IWalker, matchUnits, matchManyTimes, };
declare function matchUnits(next: IMatchFunc, patterns: Array<IPattern>, useMatchAll: boolean): IMatchFunc;
declare function matchManyTimes(next: IMatchFunc, pattern: IPattern, min: number, max: number, nonGreedy?: boolean): IMatchFunc;
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
