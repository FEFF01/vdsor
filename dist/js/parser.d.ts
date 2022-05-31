import { MatchEnv, IPattern, IFound, IMatchFunc, IWalker } from './utils';
export { MatchEnv, Pattern, buildAnalyzer, buildPattern, DATA_TYPES_MARK, IAnalyzer, IPattern, IFound, IMatchFunc, IWalker };
export default buildAnalyzer;
declare const DATA_TYPES_MARK: unique symbol;
declare type ITokens = Array<any>;
declare type IAnalyzer = (env: string | ITokens | MatchEnv) => MatchEnv;
declare function buildAnalyzer(syntax: string | IPattern): IAnalyzer;
declare function buildPattern(syntax: string): Pattern;
declare abstract class Pattern implements IPattern {
    match(env: MatchEnv, isFinal: boolean, arg: any): boolean;
    walker(next: IMatchFunc): IMatchFunc;
}
