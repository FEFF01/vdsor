import {
    Scanner, OPERATIONS, HOOK_MODE, IScanEnv,
    IPattern, Token,
    IPosition, ISourceLocation, UseKey,
} from 'astry'


const {
    FINISH,
    WRAP, UNWRAP, UNWRAP_ALL,
    OPTION,
    SPLIT,
    NO_COLLECT, NO_CAPTURE,
    MARK_AS_ROOT, FORK_IN_PARENT, FORK_IN_ROOT,
    END, END_ON_LEFT,
    useKey,
    node, key, pick, hook, pipe, prev, merge,

    MATCH_BEGIN,
    MATCH_END,
    MATCH_EOF,
    MERGE_ALL_TOKENS
} = OPERATIONS;
const MATCH_WHITE_SPACE_CHARACHER: IPattern = [` `, `\t`];  // 换行在这里作为断句符单独处理
const CLEAR_WHITE_SPACE_CHARACHER: IPattern = [
    [NO_COLLECT, MATCH_WHITE_SPACE_CHARACHER]
];

const THROW_TOKEN_ERROR = hook(function (env, start, end) {
    console.log("Invalid or unexpected token", start, end);
}, HOOK_MODE.RESOLVE);


const MATCH_QUOTES = [
    ["'", WRAP, "'", UNWRAP]
];

const MATCH_RANGE_DEFINITION_NOTATION = [
    [
        NO_COLLECT, "[", WRAP,
        [
            [pipe(parseNumber), NO_COLLECT, ","],
            [pipe(parseNumber), NO_COLLECT, "]", UNWRAP]
        ],

    ]
];
const MATCH_DATA_TYPES = [
    [
        node("DataTypes"),
        NO_COLLECT, "<", WRAP,
        pipe(function (token: Token) {
            return useKey("name", token.value);
        }),
        [
            [">", pipe(function () { return useKey("value", "<>"); }), UNWRAP],
            [CLEAR_WHITE_SPACE_CHARACHER],
            [
                pick(function (range: Array<number>) {
                    return useKey("range", range)
                }),
                MATCH_RANGE_DEFINITION_NOTATION
            ],
            [pick(function (tokens: Array<Token>) {
                const token = tokens.slice(1, -1)[0];
                if (token) {
                    return [
                        useKey("name", token.value),
                        useKey("useQuote", true),
                    ]
                }
            }), MATCH_QUOTES]
        ]

    ]
];
const MATCH_BRACKETS = [
    [
        node(
            "Brackets",
            function ([tokens]: [Array<Token[]>]) {
                return [useKey("content", tokens), useKey("value", "[]")];
            }
        ),
        NO_COLLECT, "[", WRAP,
        FORK_IN_ROOT,
        NO_COLLECT, "]", UNWRAP
    ]
];
const MATCH_CURLY_BRACES = [
    [
        node(
            "CurlyBraces",
            function ([tokens]: [Array<Token[]>]) {
                return [useKey("content", tokens), useKey("value", "{}")];
            }
        ),
        NO_COLLECT, "{", WRAP,
        [
            [CLEAR_WHITE_SPACE_CHARACHER],
            [pipe(parseNumber), ","],
            [pipe(parseNumber), NO_COLLECT, "}", UNWRAP]
        ]
    ]
];

const MATCH_STATEMENT_END = [
    "\n",
    [MATCH_EOF]
];


export default new Scanner([
    [CLEAR_WHITE_SPACE_CHARACHER],
    [
        pick(function (tokens: Array<Token>) {
            if (tokens.length) {
                return tokens;
            }
        }),
        MATCH_BEGIN, WRAP,
        MARK_AS_ROOT,
        [
            [NO_COLLECT, MATCH_STATEMENT_END, UNWRAP],
            [CLEAR_WHITE_SPACE_CHARACHER],
            [MATCH_QUOTES],
            [MATCH_DATA_TYPES],
            [MATCH_BRACKETS],
            [MATCH_CURLY_BRACES],
            "*",
            "+",
            "?",
            "!",
            [
                [
                    ",",
                    "&&",
                    "||",
                    "|",
                    "=",
                ],
                NO_COLLECT,
                OPTION,
                [
                    [
                        [` `, `\t`, `\n`],
                        FORK_IN_PARENT
                    ]
                ]
            ]


        ]
    ],

]);

function parseNumber({ value }: Token) {
    if (value === "∞" || value === "+∞") {
        return Number.POSITIVE_INFINITY;
    }
    if (value === "−∞") {
        return Number.NEGATIVE_INFINITY;
    }
    return Number(value);
}

