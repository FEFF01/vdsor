/**
 * 构建基础数据类型匹配器
 * 缓存部分使用频繁的匹配器，使之不必要每次引用都需编译
 */
import { MatchEnv, IPattern } from '../utils';
import { IAnalyzer } from '../parser';
export { getCachePattern, setSharingSyntax, getSharingAnalyzer };
declare function getSharingAnalyzer(name: string): IAnalyzer;
declare function setSharingSyntax(name: string, syntax: string): (env: string | any[] | MatchEnv) => MatchEnv;
declare function getCachePattern(name: string): IPattern;
