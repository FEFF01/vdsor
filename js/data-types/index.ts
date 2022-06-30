/**
 * 构建基础数据类型匹配器
 * 缓存部分使用频繁的匹配器，使之不必要每次引用都需编译
 */

import {
    getRange,
    walker,
    MatchEnv,
    IPattern,
    IFound,
    IMatchFunc,
    IWalker,
    matchUnits,
    matchManyTimes,
} from '../utils'
import {
    IAnalyzer,
    buildAnalyzer, buildPattern
} from '../parser'

// @ts-ignore
import * as VDS_SYNTAXES from './syntaxes.json'


export {
    getCachePattern,
    setSharingSyntax,
    getSharingAnalyzer
}



const syntaxesContext = (<any>require).context('./sharing', false, /\.ts$/);
const SHARING_SYNTAXES: Array<[string, string]> = [];

const SHARING_DATA_TYPES_ANALYZER_MAP: Record<string, IAnalyzer> = {};


for (const path of syntaxesContext.keys()) {
    SHARING_SYNTAXES.push([
        path.slice(2, -3),
        syntaxesContext(path).default
    ]);
}


const COLOR_VALUE_MAP: Record<string, number> = {
    aliceblue: 0xF0F8FF, antiquewhite: 0xFAEBD7, aqua: 0x00FFFF, aquamarine: 0x7FFFD4, azure: 0xF0FFFF, beige: 0xF5F5DC, bisque: 0xFFE4C4, black: 0x000000, blanchedalmond: 0xFFEBCD, blue: 0x0000FF, blueviolet: 0x8A2BE2, brown: 0xA52A2A, burlywood: 0xDEB887, cadetblue: 0x5F9EA0, chartreuse: 0x7FFF00, chocolate: 0xD2691E, coral: 0xFF7F50, cornflowerblue: 0x6495ED, cornsilk: 0xFFF8DC, crimson: 0xDC143C, cyan: 0x00FFFF, darkblue: 0x00008B, darkcyan: 0x008B8B, darkgoldenrod: 0xB8860B, darkgray: 0xA9A9A9, darkgreen: 0x006400, darkgrey: 0xA9A9A9, darkkhaki: 0xBDB76B, darkmagenta: 0x8B008B, darkolivegreen: 0x556B2F, darkorange: 0xFF8C00, darkorchid: 0x9932CC, darkred: 0x8B0000, darksalmon: 0xE9967A, darkseagreen: 0x8FBC8F, darkslateblue: 0x483D8B, darkslategray: 0x2F4F4F, darkslategrey: 0x2F4F4F, darkturquoise: 0x00CED1, darkviolet: 0x9400D3, deeppink: 0xFF1493, deepskyblue: 0x00BFFF, dimgray: 0x696969, dimgrey: 0x696969, dodgerblue: 0x1E90FF, firebrick: 0xB22222, floralwhite: 0xFFFAF0, forestgreen: 0x228B22, fuchsia: 0xFF00FF, gainsboro: 0xDCDCDC, ghostwhite: 0xF8F8FF, gold: 0xFFD700, goldenrod: 0xDAA520, gray: 0x808080, green: 0x008000, greenyellow: 0xADFF2F, grey: 0x808080, honeydew: 0xF0FFF0, hotpink: 0xFF69B4, indianred: 0xCD5C5C, indigo: 0x4B0082, ivory: 0xFFFFF0, khaki: 0xF0E68C, lavender: 0xE6E6FA, lavenderblush: 0xFFF0F5, lawngreen: 0x7CFC00, lemonchiffon: 0xFFFACD, lightblue: 0xADD8E6, lightcoral: 0xF08080, lightcyan: 0xE0FFFF, lightgoldenrodyellow: 0xFAFAD2, lightgray: 0xD3D3D3, lightgreen: 0x90EE90, lightgrey: 0xD3D3D3, lightpink: 0xFFB6C1, lightsalmon: 0xFFA07A, lightseagreen: 0x20B2AA, lightskyblue: 0x87CEFA, lightslategray: 0x778899, lightslategrey: 0x778899, lightsteelblue: 0xB0C4DE, lightyellow: 0xFFFFE0, lime: 0x00FF00, limegreen: 0x32CD32, linen: 0xFAF0E6, magenta: 0xFF00FF, maroon: 0x800000, mediumaquamarine: 0x66CDAA, mediumblue: 0x0000CD, mediumorchid: 0xBA55D3, mediumpurple: 0x9370DB, mediumseagreen: 0x3CB371, mediumslateblue: 0x7B68EE, mediumspringgreen: 0x00FA9A, mediumturquoise: 0x48D1CC, mediumvioletred: 0xC71585, midnightblue: 0x191970, mintcream: 0xF5FFFA, mistyrose: 0xFFE4E1, moccasin: 0xFFE4B5, navajowhite: 0xFFDEAD, navy: 0x000080, oldlace: 0xFDF5E6, olive: 0x808000, olivedrab: 0x6B8E23, orange: 0xFFA500, orangered: 0xFF4500, orchid: 0xDA70D6, palegoldenrod: 0xEEE8AA, palegreen: 0x98FB98, paleturquoise: 0xAFEEEE, palevioletred: 0xDB7093, papayawhip: 0xFFEFD5, peachpuff: 0xFFDAB9, peru: 0xCD853F, pink: 0xFFC0CB, plum: 0xDDA0DD, powderblue: 0xB0E0E6, purple: 0x800080, red: 0xFF0000, rosybrown: 0xBC8F8F, royalblue: 0x4169E1, saddlebrown: 0x8B4513, salmon: 0xFA8072, sandybrown: 0xF4A460, seagreen: 0x2E8B57, seashell: 0xFFF5EE, sienna: 0xA0522D, silver: 0xC0C0C0, skyblue: 0x87CEEB, slateblue: 0x6A5ACD, slategray: 0x708090, slategrey: 0x708090, snow: 0xFFFAFA, springgreen: 0x00FF7F, steelblue: 0x4682B4, tan: 0xD2B48C, teal: 0x008080, thistle: 0xD8BFD8, tomato: 0xFF6347, turquoise: 0x40E0D0, violet: 0xEE82EE, wheat: 0xF5DEB3, white: 0xFFFFFF, whitesmoke: 0xF5F5F5, yellow: 0xFFFF00, yellowgreen: 0x9ACD32
};
const LENGTH_UNITS = [
    "em", "ex", "ch", "rem", "vw", "vh", "vmin", "vmax",  // Relative Lengths
    "cm", "mm", "Q", "in", "pt", "pc", "px", // Absolute Lengths
    "cap", "ic", "lh", "rlh", "vi", "vb"
];
const PERCENTAGE_UNITS = ["%"];
const ANGLE_UNITS = ["deg", "grad", "rad", "turn"];
const TIME_UNITS = ["s", "ms"];
const FLEX_UNITS = ["fr"];
const FREQUENCY_UNITS = ["Hz", "KhZ"];
const RESOLUTION_UNITS = ["dpi", "dpcm", "dppx", "x"];

const DIMENSION_UNITS = LENGTH_UNITS.concat(
    PERCENTAGE_UNITS,
    ANGLE_UNITS,
    TIME_UNITS,
    FLEX_UNITS,
    FREQUENCY_UNITS.map(unit => unit.toLowerCase()),
    RESOLUTION_UNITS
);


const DATA_TYPES_PATTERN_MAP: Record<string, IPattern> = {
    "an-plus-b": wrapPattern(),
    "angle": valuesPattern(ANGLE_UNITS),

    "custom-ident": pickStringPattern(function (name) {
        /**
         * https://drafts.csswg.org/css-values/#identifier-value
         * 标准中有些关于 custom-ident 的自动并且扩散的 non-greedy 特性仅为肉眼理解便利，
         * 实现中并不科学和造成冗余，
         * 并且如果需要 non-greedy 特性可以通过简单的语法声明灵活支持，
         * 这里决定不支持这些
         * 
         * 例如将：
         `[ <family-name> | <generic-family> ]#
where 
<family-name> = <string> | <custom-ident>+
<generic-family> = serif | sans-serif | cursive | fantasy | monospace`

        * 第一行改成 ：[ <generic-family> | <family-name> ]#
        *
        */

        if (/^(_|\\|[a-zA-Z])(\w|-|\\)*/.test(name)) {   // 非标准
            return name;
        }
    }),
    //  https://developer.mozilla.org/docs/Web/CSS/dimension
    "dimension": valuesPattern(DIMENSION_UNITS, false, true),
    "flex": valuesPattern(FLEX_UNITS),
    "frequency": valuesPattern(FREQUENCY_UNITS),
    "ident": wrapPattern(),
    "integer": pickStringPattern(function (value, range: [number, number]) {
        const num = Number(value);
        if (num % 1 === 0 && checkRange(num, range)) {
            return num;
        }
    }),
    "length": valuesPattern(LENGTH_UNITS, true),
    "number": pickStringPattern(function (value, range: [number, number]) {
        const num = Number(value);
        if (num === num && checkRange(num, range)) {
            return num;
        }
    }),
    "percentage": valuesPattern(PERCENTAGE_UNITS, true),
    "ratio": lazyInitPattern("ratio", `<number [0,+∞]> / <number [0,+∞]>`),
    "resolution": valuesPattern(RESOLUTION_UNITS),
    "string": pickArrayPattern(function (tokens: Array<string>) {
        const hack = tokens[0];
        if (hack === `"` || hack === `'`) {
            return tokens[1] || "";
        }
    }),
    "time": valuesPattern(TIME_UNITS),
    //https://developer.mozilla.org/docs/Web/CSS/timing-function
    "timing-function": lazyInitPattern(
        "timing-function",
        `ease | ease-in | ease-out | ease-in-out | <easing-function>`
    ),
    "url": pickArrayPattern(function (tokens: Array<string>) {
        const hack = tokens[0];
        if (hack === "url(") {
            return tokens.slice(1, -1);
        }
    }),

    "zero": pickStringPattern(function (token) {
        if (token === "0") {
            return token;
        }
    }),
    "hex-color": pickStringPattern(function (token) {
        // https://drafts.csswg.org/css-color-4/#typedef-hex-color
        if (token[0] === "#") {
            let value = token.slice(1);

            switch (value.length) {
                case 3:
                    value += "f";
                case 4:
                    value = value.replace(/(\S)/g, "$1$1");
                    break;
                case 6:
                    value += "ff"
                case 8:
                    break;
                default:
                    return;
            }
            const color = parseInt(value.slice(0, -2), 16);
            const opacity = parseInt(value.slice(-2), 16);
            if (color === color && opacity === opacity) {
                return [color, opacity];
            }
        }
    }),
    "named-color": pickStringPattern(function (name) {
        return COLOR_VALUE_MAP[name.toLowerCase()];
    }),
    "system-color": lazyInitPattern(
        "system-color",
        VDS_SYNTAXES["deprecated-system-color"].syntax
    ),
    "hash-token": wrapPattern(),
    "declaration-value": wrapPattern(),
    "lab()": wrapPattern(),
    "lch()": wrapPattern(),
    "attr-name": pickStringPattern(function (name) {
        return name;
    }),
    "type-or-unit": wrapPattern(),
    "attr-fallback": wrapPattern(),
}

for (const [name, syntax] of SHARING_SYNTAXES) {


    setSharingSyntax(name, syntax);
}
function getSharingAnalyzer(name: string) {
    return SHARING_DATA_TYPES_ANALYZER_MAP[name];
}
function setSharingSyntax(name: string, syntax: string) {
    let pattern: IPattern;
    function getPattern() {
        if (!pattern) {
            pattern = buildPattern(syntax);
        }
        return pattern;
    }

    DATA_TYPES_PATTERN_MAP[name] = wrapPattern(function (next) {
        const pattern = DATA_TYPES_PATTERN_MAP[name] = getPattern();

        return pattern.walker(next);
    });

    let analyzer: IAnalyzer;
    return SHARING_DATA_TYPES_ANALYZER_MAP[name] = function (env) {
        if (!analyzer) {
            analyzer = buildAnalyzer(getPattern());
            SHARING_DATA_TYPES_ANALYZER_MAP[name] = analyzer;
        }
        return analyzer(env);
    }
}

function wrapPattern(walker: IWalker = function () { return function () { } }): IPattern {
    return { walker };
}

function checkRange(value: number, range: [number, number]) {
    return !range || range[0] <= value && range[1] >= value;
}

function getCachePattern(name: string) {
    return DATA_TYPES_PATTERN_MAP[name]
        || (DATA_TYPES_PATTERN_MAP[name] = lazyInitPattern(name));
}

function valuesPattern(units: Array<string>, optionalUnit?: boolean, ignoreCase?: boolean) {
    const unitSet = new Set(units);
    return pickStringPattern(
        function (value) {
            const res = getValue(value, unitSet, optionalUnit, ignoreCase);
            if (res) {
                return res;
            }
        }
    );
}

function lazyInitPattern(
    name: string,
    syntax?: string
): IPattern {

    if (syntax === undefined) {
        if (VDS_SYNTAXES[name]) {
            syntax = VDS_SYNTAXES[name].syntax;
        }
        /* IFDEBUG */
        else {
            debugger;
        }
        /* FIDEBUG */
    }
    let pattern: IPattern;

    return {
        walker(next) {
            return (
                pattern || (pattern = buildPattern(syntax))
            ).walker(next);
        }
    };

}


function pickArrayPattern(match: (token: Array<any>, arg?: any) => any) {
    return wrapPattern(
        walker(function (env, isFinal, arg) {
            const value = env.token;
            if (value instanceof Array) {
                const found = match(value, arg);
                if (found !== undefined && env.isSuccess(isFinal, 1)) {
                    env.found.push([found, join(value), env.next()]);
                    return true;
                }
            }
        })
    )
    function join(list: Array<any>) {
        let text = "";
        for (let item of list) {
            text += item instanceof Array ? join(item) : item;
        }
        return text;
    }
}
function pickStringPattern(match: (token: string, arg?: any) => any) {
    return wrapPattern(
        walker(function (env, isFinal, arg) {
            const value = env.token;
            if (typeof value === "string") {
                const found = match(value, arg);
                if (found !== undefined && env.isSuccess(isFinal, 1)) {
                    env.found.push([found, value, env.next()]);
                    return true;
                }
            }
        })
    )
}



function getValue(
    text: string,
    unitSet: Set<string>,
    optionalUnit?: boolean,
    ignoreCase?: boolean
) {

    let value: number, unit: string;
    let found = text.match(/^(\+|-)?\d*(\.\d+)?/)[0];
    if (
        found
        && !isNaN(value = parseFloat(found))
    ) {
        if (!optionalUnit || value !== 0 || found.length !== text.length) {
            unit = text.slice(found.length);
            ignoreCase && (unit = unit.toLowerCase());
            if (!unitSet.has(unit)) {
                return;
            }
        }
        return [value, unit];
    }
}