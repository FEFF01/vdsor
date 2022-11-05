# vdsor

可通过 [Value Definition Syntax](https://drafts.csswg.org/css-values) 生成指定的文本解析器，内部实现类似正则引擎，保证结果最左最长，匹配信息可追溯

> `npm install vdsor` -> `npm i && npm run dev` -> `http://localhost:8080/` -> `F12`

> [Test Demo](https://feff01.github.io/vdsor/dist/)

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
<bg-size>#
where 
<bg-size> = [ <length-percentage> | auto ]{1,2} | cover | contain

where 
<length-percentage> = <length> | <percentage>
`);

for(const value of [
    "contain",
    "200px 100%",
    "200px,cover,100% 100%"
]){
    console.log(value, analyzer(value));
}
/*
    解析返回 MatchEnv 对象的实例，
    其中 found 字段包含解析文本的主要数据,
    例如 "200px,cover,100% 100%" 将得到：
    [
        [Symbol(DATA_TYPES_MARK), 'bg-size', 0]
        [Symbol(DATA_TYPES_MARK), 'length-percentage', 0]
        [Symbol(DATA_TYPES_MARK), 'length', 0]
        [Array(2), '200px', 0]
        [',', ',', 1]
        [Symbol(DATA_TYPES_MARK), 'bg-size', 2]
        ['cover', 'cover', 2]
        [',', ',', 3]
        [Symbol(DATA_TYPES_MARK), 'bg-size', 5]
        [Symbol(DATA_TYPES_MARK), 'length-percentage', 4]
        [Symbol(DATA_TYPES_MARK), 'percentage', 4]
        [Array(2), '100%', 4]
        [Symbol(DATA_TYPES_MARK), 'length-percentage', 5]
        [Symbol(DATA_TYPES_MARK), 'percentage', 5]
        [Array(2), '100%', 5]
    ]
*/
```
> 例如可根据第三个绿框的内容生成分析器，该分析器可通过第一绿框的输入内容得出第二绿框的结果，第二绿框的结果为一个树状内容的数组方式表达，所有指定的属性值可以在该树状内容的某个分支下的叶子节点中找到
![image](https://feff01.github.io/static/img/vdsor_1.png)
