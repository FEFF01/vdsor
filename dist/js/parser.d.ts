import { MatchEnv, IPattern, IMatchFunc } from './utils';
export { Pattern, IAnalyzer, DATA_TYPES_MARK, buildAnalyzer, buildPattern };
export default buildAnalyzer;
declare const DATA_TYPES_MARK: unique symbol;
declare type ITokens = Array<any>;
declare type IAnalyzer = (env: string | ITokens | MatchEnv) => MatchEnv;
declare function buildAnalyzer(syntax: string | IPattern, outMap?: Map<string, Pattern>): IAnalyzer;
declare function buildPattern(syntax: string, outMap?: Map<string, Pattern>): Pattern;
declare abstract class Pattern implements IPattern {
    match?(env: MatchEnv, isFinal: boolean, arg: any): boolean | void;
    walker(next: IMatchFunc): IMatchFunc;
}
