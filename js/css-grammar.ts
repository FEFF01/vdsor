import {
    Scanner, OPERATIONS, HOOK_MODE, IScanEnv,
    IPattern, Token,
    IPosition, ISourceLocation,
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
    MERGE_ALL_TOKENS,
    UNFOLD
} = OPERATIONS;



const MATCH_WHITE_SPACE_CHARACHER: IPattern = [` `, `\n`, `\t`];
const CLEAR_COMMENT: IPattern = [
    [
        NO_COLLECT,
        [
            ["//", WRAP, ["\n", [MATCH_EOF]], UNWRAP],
            ["/*", WRAP, ["*/", [MATCH_EOF]], UNWRAP],
        ],
    ]
]

const CLEAR_WHITE_SPACE_CHARACHER: IPattern = [
    [NO_COLLECT, MATCH_WHITE_SPACE_CHARACHER]
];

const THROW_TOKEN_ERROR = hook(function (env, start, end) {
    console.log("Invalid or unexpected token", start, end);
}, HOOK_MODE.RESOLVE);

const MATCH_STRING: IPattern = [
    [
        `"`, WRAP,
        [
            [THROW_TOKEN_ERROR, `\n`],
            [`\\`, [`\\`, `\n`, `"`]],
            [`"`, UNWRAP]
        ]

    ],
    [
        `'`, WRAP,
        [
            [THROW_TOKEN_ERROR, `\n`],
            [`\\`, [`\\`, `\n`, `'`]],
            [`'`, UNWRAP]
        ]
    ],
]

// 不包含 '' "" 的 url 地址可能会包含断义字符 / 影响判别，这里通过单独匹配给出结果
const MATCH_URL: IPattern = [
    [
        MATCH_BEGIN, "url(", WRAP,
        [
            [MATCH_STRING],
            [CLEAR_WHITE_SPACE_CHARACHER],
            [")", UNWRAP]
        ],
    ]
];

const MATCH_CSS_ATTRIBUTE_VALUE: IPattern = [
    [
        MARK_AS_ROOT,
        [
            [MATCH_STRING],
            [MATCH_URL],
            [
                // 使能在 ( 后被断句
                // 这里没做额外检验允许括号前的空格
                MERGE_ALL_TOKENS,  
                prev(null, true), "("
            ],
            ")",
            [CLEAR_WHITE_SPACE_CHARACHER],
            [CLEAR_COMMENT],
            [
                MERGE_ALL_TOKENS,
                prev(null, true),
                "%"
            ],
            "/",
            ","
        ]
    ]
]

export {
    MATCH_CSS_ATTRIBUTE_VALUE,
}
