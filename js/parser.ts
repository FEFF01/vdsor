
import { Token, IPosition, unwrapTokens } from "astry"


import vdsTokenizer from './vds-tokenizer'
import cavTokenizer from './cav-tokenizer'
import { getCachePattern } from './data-types'
import {
    getRange,
    walker,
    MatchEnv,
    IPattern,
    IFound,
    IMatchFunc,
    IWalker
} from './utils'

export {
    Pattern,
    buildAnalyzer, buildPattern,
    DATA_TYPES_MARK,
    IAnalyzer
}
export default buildAnalyzer;





const DATA_TYPES_MARK = Symbol("DATA_TYPES_MARK");

type ITokens = Array<any>;
type IAnalyzer = (env: string | ITokens | MatchEnv) => MatchEnv;


const UNARY_OPERATOR_SET = new Set(["{}", "*", "+", "?", "#", "!"]);
const BINARY_OPERATOR_LIST = ["=", "|", "||", "&&", ""/*, "[]"*/];  // 包含顺序信息（结合优先级）的列表
const SPECIFIC_CASE_SET = new Set(["inherit", "initial", "unset"]);


const POLYFILL_WALK_FUNC: IMatchFunc = function (env, isFinal) {
    return env.isSuccess(isFinal, 0);
}




function buildAnalyzer(syntax: string | IPattern): IAnalyzer {

    const pattern = typeof syntax === "string"
        ? buildPattern(syntax)
        : syntax;

    const match = pattern.walker(null);

    return function (input: string | ITokens) {

        const env = new MatchEnv(
            typeof input === "string" ?
                unwrapTokens(cavTokenizer.scan(input).tokens)
                : input,
            pattern
        );

        if (env.tokens.length === 1 && SPECIFIC_CASE_SET.has(env.token)) {
            env.found = [
                [DATA_TYPES_MARK, "specific-case", 1],
                [env.token, env.token, env.next()]
            ];
            env.success = true;
            return env;
        }
        env.success = !!match(env, true) && !env.token;
        return env;
    }
}

function buildPattern(syntax: string): Pattern {
    const tokens = vdsTokenizer.scan(syntax).tokens;
    const map: Map<string, Pattern> = new Map();


    for (let i = tokens.length - 1; i >= 0; i -= 1) {
        parseStatement(tokens[i], map);
    }
    return map.get("");
}

function parseStatement(
    statement: Array<any>,
    map: Map<string, IPattern>
): IPattern {
    if (
        statement.length === 1
        && statement[0] instanceof Token
    ) {
        return;
    }
    let pattern = parsePattern(statement, map);

    if (!(pattern instanceof EqualSign)) {
        const id = "";
        if (map.has(id)) {
            pattern = new SingleBar(
                new ExclamationPoint(map.get(id))
            ).add(pattern);
        }
        map.set(id, pattern);
    }

    return pattern;
}

function getQuotesLiteral(tokens: any): [string, IPosition, IPosition] {
    if (tokens instanceof Array) {
        const hack: Token = tokens[0];

        const hackEnd: Token = tokens[tokens.length - 1];
        return [
            tokens.slice(1, -1).join(""),
            hack.loc.start,
            hackEnd.loc.end
        ]
    }
}

function parsePattern(
    tokens: Array<any>,
    patternMap: Map<string, IPattern>
): IPattern {
    const units: [IPattern?, ...any] = [];
    let pattern: IPattern
    for (let index = 0, length = tokens.length; index < length; index += 1) {
        let token = tokens[index];

        let adhesive = getQuotesLiteral(token);

        if (adhesive) {
            // https://drafts.csswg.org/css-values-3/#component-types
            // 处理可能出现的不作为特殊标记使用的 '+' '*' 'xxx' 等情况
            let isAdjacent = 1;
            while (true) {
                let [value, start, end] = adhesive;
                if (pattern instanceof Value && pattern.end.offset === start.offset) {
                    pattern.data += value;
                    pattern.end = end;
                } else {
                    if (pattern) {
                        units.push(
                            pattern,
                            ["", BINARY_OPERATOR_LIST.indexOf("")]
                        );
                    }
                    pattern = new Value(new Token(value, start, end));
                }

                if (isAdjacent-- && index + 1 < length) {
                    token = tokens[index + 1]
                    adhesive = getQuotesLiteral(token);
                    if (adhesive) {
                        isAdjacent = 1;
                    } else if (
                        token instanceof Token
                        && token.loc.start.offset === end.offset
                        && !isUnaryOperator(token.value)
                        && !isBinaryOperator(token.value)
                    ) {
                        adhesive = [token.value, token.loc.start, token.loc.end];
                    } else {
                        break;
                    }
                } else {
                    break;
                }
                index += 1;
            }

        } else if (!pattern) {
            pattern = parseUnitPattern(token, patternMap);
        } else {
            let op = token.value;
            if (isUnaryOperator(op)) {
                pattern = parseUnaryPattern(pattern, op, token.content);
            } else {
                if (!isBinaryOperator(op)) {
                    op = "";
                    index -= 1;
                }
                units.push(pattern, [op, BINARY_OPERATOR_LIST.indexOf(op)]);
                pattern = null;
            }
        }
    }
    pattern && units.push(pattern);

    while (units.length > 1) {
        let index = units.length - 2, maxp: number = -1, maxi = index;
        do {
            let precedence: number = units[index][1]
            if (precedence >= maxp) {
                maxp = precedence;
                maxi = index;
            }
            index -= 2;
        } while (index > 0)

        do {
            units.splice(
                maxi - 1, 3,
                parseBinaryPattern(
                    <Pattern>units[maxi - 1],
                    units[maxi][0],
                    <Pattern>units[maxi + 1],
                    patternMap
                )
            );
            //maxi -= 2;
        } while (maxi < units.length - 1 && units[maxi][1] === maxp)
    }
    return units[0];
}

function isUnaryOperator(op: string) {
    return UNARY_OPERATOR_SET.has(op);
}
function isBinaryOperator(op: string) {
    return BINARY_OPERATOR_LIST.includes(op);
}


abstract class Pattern implements IPattern {
    match(env: MatchEnv, isFinal: boolean, arg: any) {
        return false;
    }
    walker(next: IMatchFunc): IMatchFunc {
        return walker(this.match.bind(this))(next);
    }
}



class BinaryPattern extends Pattern {
    units: Array<IPattern>;
    constructor(pattern: IPattern) {
        super();
        this.units = [pattern];
    }
    add(pattern: IPattern) {
        this.units.push(pattern);
        return this;
    }
}


class Separate extends BinaryPattern {
    // https://drafts.csswg.org/css-values-3/#component-types
    units: [IPattern, Value, IPattern];
    walker(next: IMatchFunc): IMatchFunc {

        const [left, separator, right] = this.units;

        let pattern: Juxtaposition;
        if (left) {
            pattern = new Juxtaposition(new ExclamationPoint(left));
            pattern.add(separator);
        }

        if (right) {
            pattern = new Juxtaposition(pattern ? new QuestionMark(pattern) : separator);
            pattern.add(new ExclamationPoint(right));
        }

        return new QuestionMark(pattern).walker(next);

    }
}

class Juxtaposition extends BinaryPattern {
    // https://drafts.csswg.org/css-values-3/#component-types

    add(pattern: IPattern) {
        const units = this.units;
        const prev = units[units.length - 1];


        if (pattern instanceof Value && pattern.data === ",") {
            switch (true) {
                case prev instanceof QuestionMark:
                case prev instanceof Separate && prev.units.length >= 3:
                    /*case prev instanceof CurlyBraces:
                    case prev instanceof Asterisk:*/
                    pattern = new Separate(pattern);
                    (<Separate>pattern).units.unshift(units.pop());
                    break;
            }
        } else {
            switch (true) {
                case pattern instanceof QuestionMark:
                    if (prev instanceof Value && prev.data === ",") {
                        pattern = new Separate(pattern);
                        (<Separate>pattern).units.unshift(null, units.pop());
                    } else if (prev instanceof Separate && prev.units.length <= 3) {
                        prev.add(pattern);
                        pattern = units.pop();
                    }
                    break;
            }
        }
        units.push(pattern);

        return this;
    }

    walker(next: IMatchFunc) {
        return this.units.reduceRight(
            function (walk, pattern) { return pattern.walker(walk) },
            next
        );
    }
}

class DoubleAmpersand extends BinaryPattern {
    walker(next: IMatchFunc) {
        return matchUnits(next, this.units, true);
    }
}
class DoubleBar extends BinaryPattern {
    walker(next: IMatchFunc) {
        return matchUnits(next, this.units, false);
    }
}
function matchUnits(next: IMatchFunc, patterns: Array<IPattern>, useMatchAll: boolean): IMatchFunc {

    const matches = patterns.map(pattern => pattern.walker(null));
    const indexs = matches.map((_, index) => index);

    const comMatches = next && patterns.map(pattern => pattern.walker(next));

    return function (env: MatchEnv, isFinal: boolean) {
        let maxIndex: number;
        let maxRecord: IFound;
        const res = env.found;
        env.found = [];

        walk(indexs);
        env.found = res;
        if (maxRecord) {
            res.push(...maxRecord);
            env.index = maxIndex;
            return true;
        }

        function walk(indexs: Array<number>) {
            const state = env.store();
            const length = indexs.length;
            for (let i = 0; i < length; i += 1) {
                const index = indexs[i];

                if (!matches[index](env, false)) {
                    continue;
                }
                if (length > 1 && walk(indexs.slice(0, i).concat(indexs.slice(i + 1)))) {
                    return true;
                }

                if ((useMatchAll && length > 1)) {
                    env.restore(state);
                    continue;
                }
                if (comMatches || isFinal) {
                    env.restore(state);
                    if (!(comMatches || matches)[index](env, isFinal)) {
                        continue;
                    }
                }

                if (env.compareIndex(maxIndex) < 0) {
                    maxRecord = env.found.slice();
                    maxIndex = env.index;
                    if (env.isSuccess(true, 0)) {
                        return true;
                    }
                }
                env.restore(state);
            }
        }
    }
}


class SingleBar extends BinaryPattern {
    constructor(pattern: IPattern) {
        super(pattern);
    }
    values: Set<string>;
    add(pattern: IPattern) {
        const units = this.units;

        if (pattern instanceof Value) {
            // 多个 互斥 值使用 Set 查找匹配降低消耗
            if (!this.values) {
                const prev = units[0];
                if (prev instanceof Value) {
                    units[0] = new Values(
                        this.values = new Set([prev.data, pattern.data])
                    );
                    return;
                }
                units.unshift(pattern);
            } else {
                this.values.add(pattern.data);
            }
        } else {
            units.push(pattern);
        }
        return this;
    }
    walker(next: IMatchFunc): IMatchFunc {

        const matches = this.units.map(pattern => pattern.walker(next));
        return function (env, isFinal) {
            const index = env.index;
            let maxIndex: number;
            let maxRecord: IFound;
            const res = env.found;
            for (let i = 0; i < matches.length; i += 1) {

                env.found = [];
                if (matches[i](env, isFinal)) {
                    if (env.compareIndex(maxIndex) < 0) {
                        maxIndex = env.index;
                        maxRecord = env.found;
                        if (env.isSuccess(true, 0)) {
                            break;
                        }
                    }
                    env.index = index;
                }
            }
            env.found = res;
            if (maxRecord) {
                res.push(...maxRecord);
                env.index = maxIndex;
                return true;
            }
        };
    }

}
class EqualSign extends BinaryPattern {
    constructor(public pattern: Pattern, private map: Map<string, IPattern>) {
        super(pattern);
    }
    private getIdent(pattern: IPattern) {
        if (pattern instanceof Refer) {
            return pattern.name;
        }
        debugger;
    }
    add(pattern: IPattern) {
        const units = this.units;
        const map = this.map;
        for (const id of units) {
            map.set(this.getIdent(id), pattern);
        }
        units.push(pattern);
        return this;
    }
    walker(next: IMatchFunc) { //   让 [] 中可以存在赋值表达式  
        const units = this.units;
        return units[units.length - 1].walker(next);
    }
}

const BINARY_PATTERN_MAP = {
    "|": SingleBar,
    "||": DoubleBar,
    "&&": DoubleAmpersand,
    "": Juxtaposition,
    "=": EqualSign
}
function parseBinaryPattern(
    left: IPattern | BinaryPattern,
    op: string,
    right: IPattern,
    map: Map<string, IPattern>
) {
    const Wrapper = BINARY_PATTERN_MAP[op];
    if (!(left instanceof Wrapper)) {
        left = new Wrapper(left, map);
    }
    (<BinaryPattern>left).add(right);
    return left;
}

class UnaryPattern extends Pattern {
    constructor(public pattern: IPattern, arg2?: any) { super(); }
}
class Asterisk extends UnaryPattern {
    walker(next: IMatchFunc) {
        return matchManyTimes(next, this.pattern, 0, Number.MAX_SAFE_INTEGER);
    }
}
class PlusSign extends UnaryPattern {
    walker(next: IMatchFunc) {
        return matchManyTimes(next, this.pattern, 1, Number.MAX_SAFE_INTEGER);
    }
}
class QuestionMark extends UnaryPattern {
    walker(next: IMatchFunc) {
        return matchManyTimes(next, this.pattern, 0, 1);
    }
}

class CurlyBraces extends UnaryPattern {
    constructor(pattern: IPattern, public range: [number, number]) {
        super(pattern);
        if (pattern instanceof HashMark) {
            pattern.range = range;
            return pattern;
        }
    }
    walker(next: IMatchFunc) {
        return matchManyTimes(next, this.pattern, this.range[0], this.range[1]);
    }
}
function matchManyTimes(
    next: IMatchFunc,
    pattern: IPattern,
    min: number,
    max: number
): IMatchFunc {
    const match = pattern.walker(null);

    if (next) {
        const comMatch = pattern.walker(next);
        return function (env, isFinal) {

            return walk(0);

            function walk(step: number) {
                const state = env.store();
                if (step < max) {
                    if (match(env, false)) {
                        if (
                            walk(step + 1)
                            || (
                                env.restore(state)
                                , step >= min - 1
                                && comMatch(env, isFinal)
                            )
                        ) {
                            return true;
                        }
                    }
                }
                if (step >= min && next(env, isFinal)) {
                    return true;
                }
            }
        }
    } else {
        return function (env, isFinal) {
            return walk(0);

            function walk(step: number) {
                if (step < max) {
                    const state = env.store();
                    if (match(env, false)) {
                        if (
                            walk(step + 1)
                            || (
                                env.restore(state),
                                isFinal
                                && step >= min - 1
                                && match(env, true)
                            )
                        ) {
                            return true;
                        }
                    }
                }
                if (step >= min && env.isSuccess(isFinal, 0)) {
                    return true;
                }
            }
        }

    }



}

class HashMark extends UnaryPattern {
    range: [number, number] = [1, Number.MAX_SAFE_INTEGER];
    walker(next: IMatchFunc) {
        const [min, max] = this.range;
        if (max >= 1) {

            const pattern = new Juxtaposition(this.pattern)
                .add(
                    new CurlyBraces(
                        new Juxtaposition(
                            new Value(new Token(",", null, null))
                        ).add(this.pattern),
                        [min - 1, max - 1]
                    )
                );
            return (min >= 1 ? pattern : new QuestionMark(pattern)).walker(next);
        } else {
            return next || POLYFILL_WALK_FUNC;
        }
    }
}
class ExclamationPoint extends UnaryPattern {
    walker(next: IMatchFunc) {
        let index: number;
        const match = this.pattern.walker(function (env: MatchEnv, isFinal: boolean) {
            if (env.compareIndex(index) < 0) {
                return next ? next(env, isFinal) : env.isSuccess(isFinal, 0);
            }
        });
        return function (env: MatchEnv, isFinal: boolean) {
            index = env.index;
            return match(env, isFinal);
        }

    }
}

const UNARY_PATTERN_MAP = {
    "*": Asterisk,
    "+": PlusSign,
    "?": QuestionMark,
    "{}": function (pattern: IPattern, tokens: Array<any>) {
        return new CurlyBraces(pattern, getRange(tokens));
    },
    "#": HashMark,
    "!": ExclamationPoint,
}
function parseUnaryPattern(pattern: IPattern, op: string, content?: Array<string>): Pattern {
    return new UNARY_PATTERN_MAP[op](pattern, content);
}

class Refer extends Pattern {
    pattern: IPattern;
    name: string;
    range?: [number, number];
    useQuote?: boolean;
    constructor(
        { name, range, useQuote }: {
            name: string,
            range?: [number, number],
            useQuote?: boolean
        },
        patternMap: Map<string, IPattern>
    ) {
        super();

        let pattern = !useQuote && patternMap.get(name);
        if (pattern) {
            this.pattern = pattern;
        } else {
            Object.defineProperty(this, "pattern", {
                get() {
                    return pattern || (pattern = getCachePattern(name));
                }
            });
        }

        this.range = range;
        this.useQuote = useQuote;
        this.name = name;
    }
    walker(next: IMatchFunc): IMatchFunc {
        // https://drafts.csswg.org/css-values-3/#numeric-ranges

        const { pattern, range, name } = this;
        //const id = this.useQuote ? `'${name}'` : name;

        /**
         * 不能直接在这里获得 match 方法，
         * 这样会导致直接构造所有分支（可能存在循环引用的分支）
         */
        let match: IMatchFunc;
        let right: number;

        return function (env: MatchEnv, isFinal: boolean) {
            /**
             * 这里按需 ( 按实际输入内容深度 ) 构造下一个该出现的分支
             */
            if (!match) {
                next || (next = POLYFILL_WALK_FUNC);
                match = pattern.walker(
                    function (env, isFinal) {
                        /**
                         * 一个 right 变量可能会被处于不同环境的同一个 match 方法嵌套使用
                         * 这里使用 end 中间变量使之作用周期不冲突
                         */
                        const end = env.index;
                        if (next(env, isFinal)) {
                            right = end - 1;
                            return true;
                        }
                    }
                );
            }

            let length = env.found.length;
            if (match(env, isFinal, range)) {
                if (env.found.length > length) {
                    env.found.splice(length, 0, [DATA_TYPES_MARK, name, right])
                }
                return true;
            }
        }


    }

}
class Group extends Pattern {
    pattern: IPattern;
    constructor(
        { content }: { content: Array<any> },
        patternMap: Map<string, IPattern>
    ) {
        super();
        this.pattern = parsePattern(content, patternMap);
    }
    walker(next: IMatchFunc) {
        return this.pattern.walker(next);
    }
}
class Value extends Pattern {
    data: string;
    /**
     * 保留位置信息用于在编译期可能出现的上下文相关处理
     */
    start: IPosition;
    end: IPosition;
    constructor({ value: data, loc: { start, end } }: Token) {
        super();
        this.data = data;
        this.start = start;
        this.end = end;
    }
    match(env: MatchEnv, isFinal: boolean) {
        const { token } = env;
        if (token === this.data && env.isSuccess(isFinal, 1)) {
            env.found.push([token, token, env.next()]);
            return true;
        }
    }
}
class Values extends Pattern {
    constructor(public data: Set<string>) { super() }
    match(env: MatchEnv, isFinal: boolean) {
        const { token } = env;
        if (env.isSuccess(isFinal, 1) && this.data.has(token)) {
            env.found.push([token, token, env.next()]);
            return true;
        }
    }
}
function parseUnitPattern(token: any, patternMap: Map<string, IPattern>): Pattern {
    switch (token.type) {
        case "DataTypes":
            return new Refer(token, patternMap);
        case "Brackets":
            return new Group(token, patternMap);
        default:
            return new Value(token);
    }
}
