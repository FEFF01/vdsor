# vdsor

可通过 [Value Definition Syntax](https://drafts.csswg.org/css-values) 生成指定的文本解析器


> `npm install vdsor` -> `npm i && npm run dev` -> `http://localhost:8080/` -> `F12`


#### 利用 `vdsor` 构造一系列复杂 `CSS` 属性值解析器的简单例子：
>* [test.ts](./js/test.ts)


#### 应用
```javascript
import parser,{
    MatchEnv,
    Pattern,
    buildAnalyzer, buildPattern,
    DATA_TYPES_MARK,
    IAnalyzer, 
    IPattern,
    IFound, 
    IMatchFunc,
    IWalker
} from 'vdsor'

const analyzer = parser(`
<length-percentage>{1,4} [ / <length-percentage>{1,4} ]?
where 
<length-percentage> = <length> | <percentage>
`);

for(const value of [
    "30px",
    "25% 10px",
    "10px 100% / 120px"
    ]){
    console.log(value, analyzer(value));
}
/*
    解析返回 MatchEnv 对象的实例，
    其中 found 字段包含解析文本的主要数据,例如 "10px 100px / 120px" 得到：
    [
        [Symbol(DATA_TYPES_MARK), 'length-percentage', 0]
        [Symbol(DATA_TYPES_MARK), 'length', 0]
        [Array(2), '10px', 0]
        [Symbol(DATA_TYPES_MARK), 'length-percentage', 1]
        [Symbol(DATA_TYPES_MARK), 'percentage', 1]
        [Array(2), '100%', 1]
        ['/', '/', 2]
        [Symbol(DATA_TYPES_MARK), 'length-percentage', 3]
        [Symbol(DATA_TYPES_MARK), 'length', 3]
        [Array(2), '120px', 3]
    ]
*/
```