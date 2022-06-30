
import parser, { } from './parser'

const TEST_TABLE: Record<string, [string, ...Array<string>]> = {
    "animation": [
        `<single-animation>#
where 
<single-animation> = <time> || <easing-function> || <time> || <single-animation-iteration-count> || <single-animation-direction> || <single-animation-fill-mode> || <single-animation-play-state> || [ none | <keyframes-name> ]

where 
<easing-function> = linear | <cubic-bezier-timing-function> | <step-timing-function>
<single-animation-iteration-count> = infinite | <number>
<single-animation-direction> = normal | reverse | alternate | alternate-reverse
<single-animation-fill-mode> = none | forwards | backwards | both
<single-animation-play-state> = running | paused
<keyframes-name> = <custom-ident> | <string>

where 
<cubic-bezier-timing-function> = ease | ease-in | ease-out | ease-in-out | cubic-bezier(<number [0,1]>, <number>, <number [0,1]>, <number>)
<step-timing-function> = step-start | step-end | steps(<integer>[, <step-position>]?)

where 
<step-position> = jump-start | jump-end | jump-none | jump-both | start | end`,
        ` .5s cubic-bezier(0.1, 0.7, 1.0, 0.1) 1s infinite alternate slidein`
    ],
    "animation-timing-function": [
        `<easing-function>#
where 
<easing-function> = linear | <cubic-bezier-timing-function> | <step-timing-function>

where 
<cubic-bezier-timing-function> = ease | ease-in | ease-out | ease-in-out | cubic-bezier(<number [0,1]>, <number>, <number [0,1]>, <number>)
<step-timing-function> = step-start | step-end | steps(<integer>[, <step-position>]?)

where 
<step-position> = jump-start | jump-end | jump-none | jump-both | start | end`,
        `ease, step-start, cubic-bezier(0.1, 0.7, 1.0, 0.1)`
    ],
    "background": [
        `[ <bg-layer> , ]* <final-bg-layer>
where 
<bg-layer> = <bg-image> || <bg-position> [ / <bg-size> ]? || <repeat-style> || <attachment> || <box> || <box>
<final-bg-layer> = <'background-color'> || <bg-image> || <bg-position> [ / <bg-size> ]? || <repeat-style> || <attachment> || <box> || <box>

where 
<bg-image> = none | <image>
<bg-position> = [ [ left | center | right | top | bottom | <length-percentage> ] | [ left | center | right | <length-percentage> ] [ top | center | bottom | <length-percentage> ] | [ center | [ left | right ] <length-percentage>? ] && [ center | [ top | bottom ] <length-percentage>? ] ]
<bg-size> = [ <length-percentage> | auto ]{1,2} | cover | contain
<repeat-style> = repeat-x | repeat-y | [ repeat | space | round | no-repeat ]{1,2}
<attachment> = scroll | fixed | local
<box> = border-box | padding-box | content-box

where 
<image> = <url> | <image()> | <image-set()> | <element()> | <paint()> | <cross-fade()> | <gradient>
<length-percentage> = <length> | <percentage>

where 
<image()> = image( <image-tags>? [ <image-src>? , <color>? ]! )
<image-set()> = image-set( <image-set-option># )
<element()> = element( <id-selector> )
<paint()> = paint( <ident> (en-US), <declaration-value>? )
<cross-fade()> = cross-fade( <cf-mixing-image> , <cf-final-image>? )
<gradient> = <linear-gradient()> | <repeating-linear-gradient()> | <radial-gradient()> | <repeating-radial-gradient()> | <conic-gradient()>

where 
<image-tags> = ltr | rtl
<image-src> = <url> | <string>
<color> = <rgb()> | <rgba()> | <hsl()> | <hsla()> | <hwb()> | <hex-color> | <named-color> | currentcolor | <deprecated-system-color>
<image-set-option> = [ <image> | <string> ] [ <resolution> || type(<string>) ]
<id-selector> = <hash-token>
<cf-mixing-image> = <percentage>? && <image>
<cf-final-image> = <image> | <color>
<linear-gradient()> = linear-gradient( [ <angle> | to <side-or-corner> ]? , <color-stop-list> )
<repeating-linear-gradient()> = repeating-linear-gradient( [ <angle> | to <side-or-corner> ]? , <color-stop-list> )
<radial-gradient()> = radial-gradient( [ <ending-shape> || <size> ]? [ at <position> ]? , <color-stop-list> )
<repeating-radial-gradient()> = repeating-radial-gradient( [ <ending-shape> || <size> ]? [ at <position> ]? , <color-stop-list> )
<conic-gradient()> = conic-gradient( [ from <angle> ]? [ at <position> ]?, <angular-color-stop-list> )

where 
<rgb()> = rgb( <percentage>{3} [ / <alpha-value> ]? ) | rgb( <number>{3} [ / <alpha-value> ]? ) | rgb( <percentage>#{3} , <alpha-value>? ) | rgb( <number>#{3} , <alpha-value>? )
<rgba()> = rgba( <percentage>{3} [ / <alpha-value> ]? ) | rgba( <number>{3} [ / <alpha-value> ]? ) | rgba( <percentage>#{3} , <alpha-value>? ) | rgba( <number>#{3} , <alpha-value>? )
<hsl()> = hsl( <hue> <percentage> <percentage> [ / <alpha-value> ]? ) | hsl( <hue>, <percentage>, <percentage>, <alpha-value>? )
<hsla()> = hsla( <hue> <percentage> <percentage> [ / <alpha-value> ]? ) | hsla( <hue>, <percentage>, <percentage>, <alpha-value>? )
<hwb()> = hwb( [<hue> | none] [<percentage> | none] [<percentage> | none] [ / [<alpha-value> | none] ]? )
<side-or-corner> = [ left | right ] || [ top | bottom ]
<color-stop-list> = [ <linear-color-stop> [, <linear-color-hint>]? ]# , <linear-color-stop>
<ending-shape> = circle | ellipse
<size> = closest-side | farthest-side | closest-corner | farthest-corner | <length> | <length-percentage>{2}
<position> = [ [ left | center | right ] || [ top | center | bottom ] | [ left | center | right | <length-percentage> ] [ top | center | bottom | <length-percentage> ]? | [ [ left | right ] <length-percentage> ] && [ [ top | bottom ] <length-percentage> ] ]
<angular-color-stop-list> = [ <angular-color-stop> [, <angular-color-hint>]? ]# , <angular-color-stop>

where 
<alpha-value> = <number> | <percentage>
<hue> = <number> | <angle>
<linear-color-stop> = <color> <color-stop-length>?
<linear-color-hint> = <length-percentage>
<angular-color-stop> = <color> && <color-stop-angle>?
<angular-color-hint> = <angle-percentage>

where 
<color-stop-length> = <length-percentage>{1,2}
<color-stop-angle> = <angle-percentage>{1,2}
<angle-percentage> = <angle> | <percentage>
`,
        `center right / contain no-repeat url("../../media/examples/firefox-logo.svg"),
#eee 35% url("../../media/examples/lizard.png")`,
        `center right / contain no-repeat url("../../media/examples/firefox-logo.svg"),
        center no-repeat url("../../media/examples/firefox-logo.svg"),
rgba(20% 30% 40% /0.5)   35% none`,
        `left 5% / 15% 60% repeat-x url("../../media/examples/star.png")`
    ],
    "border": [
        `<line-width> || <line-style> || <color>
where 
<line-width> = <length> | thin | medium | thick
<line-style> = none | hidden | dotted | dashed | solid | double | groove | ridge | inset | outset
<color> = <rgb()> | <rgba()> | <hsl()> | <hsla()> | <hwb()> | <hex-color> | <named-color> | currentcolor | <deprecated-system-color>

where 
<rgb()> = rgb( <percentage>{3} [ / <alpha-value> ]? ) | rgb( <number>{3} [ / <alpha-value> ]? ) | rgb( <percentage>#{3} , <alpha-value>? ) | rgb( <number>#{3} , <alpha-value>? )
<rgba()> = rgba( <percentage>{3} [ / <alpha-value> ]? ) | rgba( <number>{3} [ / <alpha-value> ]? ) | rgba( <percentage>#{3} , <alpha-value>? ) | rgba( <number>#{3} , <alpha-value>? )
<hsl()> = hsl( <hue> <percentage> <percentage> [ / <alpha-value> ]? ) | hsl( <hue>, <percentage>, <percentage>, <alpha-value>? )
<hsla()> = hsla( <hue> <percentage> <percentage> [ / <alpha-value> ]? ) | hsla( <hue>, <percentage>, <percentage>, <alpha-value>? )
<hwb()> = hwb( [<hue> | none] [<percentage> | none] [<percentage> | none] [ / [<alpha-value> | none] ]? )

where 
<alpha-value> = <number> | <percentage>
<hue> = <number> | <angle>`,
        `4mm ridge rgba(211, 220, 50, .6)`
    ],
    "border-radius": [
        `<length-percentage>{1,4} [ / <length-percentage>{1,4} ]?
where 
<length-percentage> = <length> | <percentage>`,
        `50% 20% / 10% 40%`,
        `10px 100px / 120px`
    ],
    "box-shadow": [
        `none | <shadow>#
        where 
        <shadow> = inset? && <length>{2,4} && <color>?
        
        where 
        <color> = <rgb()> | <rgba()> | <hsl()> | <hsla()> | <hwb()> | <hex-color> | <named-color> | currentcolor | <deprecated-system-color>
        
        where 
        <rgb()> = rgb( <percentage>{3} [ / <alpha-value> ]? ) | rgb( <number>{3} [ / <alpha-value> ]? ) | rgb( <percentage>#{3} , <alpha-value>? ) | rgb( <number>#{3} , <alpha-value>? )
        <rgba()> = rgba( <percentage>{3} [ / <alpha-value> ]? ) | rgba( <number>{3} [ / <alpha-value> ]? ) | rgba( <percentage>#{3} , <alpha-value>? ) | rgba( <number>#{3} , <alpha-value>? )
        <hsl()> = hsl( <hue> <percentage> <percentage> [ / <alpha-value> ]? ) | hsl( <hue>, <percentage>, <percentage>, <alpha-value>? )
        <hsla()> = hsla( <hue> <percentage> <percentage> [ / <alpha-value> ]? ) | hsla( <hue>, <percentage>, <percentage>, <alpha-value>? )
        <hwb()> = hwb( [<hue> | none] [<percentage> | none] [<percentage> | none] [ / [<alpha-value> | none] ]? )
        
        where 
        <alpha-value> = <number> | <percentage>
        <hue> = <number> | <angle>`,
        `3px 3px red, -1em 0 .4em olive`,
        `12px 12px 2px 1px rgba(0, 0, 255, .2)`
    ],
    "content": [
        `normal | none | [ <content-replacement> | <content-list> ] [/ [ <string> | <counter> ]+ ]?
where 
<content-replacement> = <image>
<content-list> = [ <string> | contents | <image> | <counter> | <quote> | <target> | <leader()> | <attr()> ]+
<counter> = <counter()> | <counters()>

where 
<image> = <url> | <image()> | <image-set()> | <element()> | <paint()> | <cross-fade()> | <gradient>
<quote> = open-quote | close-quote | no-open-quote | no-close-quote
<target> = <target-counter()> | <target-counters()> | <target-text()>
<leader()> = leader( <leader-type> )
<counter()> = counter( <counter-name>, <counter-style>? )
<counters()> = counters( <counter-name>, <string>, <counter-style>? )

where 
<image()> = image( <image-tags>? [ <image-src>? , <color>? ]! )
<image-set()> = image-set( <image-set-option># )
<element()> = element( <id-selector> )
<paint()> = paint( <ident> (en-US), <declaration-value>? )
<cross-fade()> = cross-fade( <cf-mixing-image> , <cf-final-image>? )
<gradient> = <linear-gradient()> | <repeating-linear-gradient()> | <radial-gradient()> | <repeating-radial-gradient()> | <conic-gradient()>
<target-counter()> = target-counter( [ <string> | <url> ] , <custom-ident> , <counter-style>? )
<target-counters()> = target-counters( [ <string> | <url> ] , <custom-ident> , <string> , <counter-style>? )
<target-text()> = target-text( [ <string> | <url> ] , [ content | before | after | first-letter ]? )
<leader-type> = dotted | solid | space | <string>
<counter-name> = <custom-ident>
<counter-style> = <counter-style-name> | symbols()

where 
<image-tags> = ltr | rtl
<image-src> = <url> | <string>
<color> = <rgb()> | <rgba()> | <hsl()> | <hsla()> | <hwb()> | <hex-color> | <named-color> | currentcolor | <deprecated-system-color>
<image-set-option> = [ <image> | <string> ] [ <resolution> || type(<string>) ]
<id-selector> = <hash-token>
<cf-mixing-image> = <percentage>? && <image>
<cf-final-image> = <image> | <color>
<linear-gradient()> = linear-gradient( [ <angle> | to <side-or-corner> ]? , <color-stop-list> )
<repeating-linear-gradient()> = repeating-linear-gradient( [ <angle> | to <side-or-corner> ]? , <color-stop-list> )
<radial-gradient()> = radial-gradient( [ <ending-shape> || <size> ]? [ at <position> ]? , <color-stop-list> )
<repeating-radial-gradient()> = repeating-radial-gradient( [ <ending-shape> || <size> ]? [ at <position> ]? , <color-stop-list> )
<conic-gradient()> = conic-gradient( [ from <angle> ]? [ at <position> ]?, <angular-color-stop-list> )
<counter-style-name> = <custom-ident>

where 
<rgb()> = rgb( <percentage>{3} [ / <alpha-value> ]? ) | rgb( <number>{3} [ / <alpha-value> ]? ) | rgb( <percentage>#{3} , <alpha-value>? ) | rgb( <number>#{3} , <alpha-value>? )
<rgba()> = rgba( <percentage>{3} [ / <alpha-value> ]? ) | rgba( <number>{3} [ / <alpha-value> ]? ) | rgba( <percentage>#{3} , <alpha-value>? ) | rgba( <number>#{3} , <alpha-value>? )
<hsl()> = hsl( <hue> <percentage> <percentage> [ / <alpha-value> ]? ) | hsl( <hue>, <percentage>, <percentage>, <alpha-value>? )
<hsla()> = hsla( <hue> <percentage> <percentage> [ / <alpha-value> ]? ) | hsla( <hue>, <percentage>, <percentage>, <alpha-value>? )
<hwb()> = hwb( [<hue> | none] [<percentage> | none] [<percentage> | none] [ / [<alpha-value> | none] ]? )
<side-or-corner> = [ left | right ] || [ top | bottom ]
<color-stop-list> = [ <linear-color-stop> [, <linear-color-hint>]? ]# , <linear-color-stop>
<ending-shape> = circle | ellipse
<size> = closest-side | farthest-side | closest-corner | farthest-corner | <length> | <length-percentage>{2}
<position> = [ [ left | center | right ] || [ top | center | bottom ] | [ left | center | right | <length-percentage> ] [ top | center | bottom | <length-percentage> ]? | [ [ left | right ] <length-percentage> ] && [ [ top | bottom ] <length-percentage> ] ]
<angular-color-stop-list> = [ <angular-color-stop> [, <angular-color-hint>]? ]# , <angular-color-stop>

where 
<alpha-value> = <number> | <percentage>
<hue> = <number> | <angle>
<linear-color-stop> = <color> <color-stop-length>?
<linear-color-hint> = <length-percentage>
<length-percentage> = <length> | <percentage>
<angular-color-stop> = <color> && <color-stop-angle>?
<angular-color-hint> = <angle-percentage>

where 
<color-stop-length> = <length-percentage>{1,2}
<color-stop-angle> = <angle-percentage>{1,2}
<angle-percentage> = <angle> | <percentage>`,
        `url(http://www.mozilla.org/favicon.ico) " MOZILLA: "`,
        `counters(section_counter, ".", decimal-leading-zero)`,
        `" (" attr(id) ")"`,
        `image-set("image1x.png" 1x, "image2x.png" 2x)`
    ],
    "filter": [
        `none | <filter-function-list>
where 
<filter-function-list> = [ <filter-function> | <url> ]+

where 
<filter-function> = <blur()> | <brightness()> | <contrast()> | <drop-shadow()> | <grayscale()> | <hue-rotate()> | <invert()> | <opacity()> | <saturate()> | <sepia()>

where 
<blur()> = blur( <length> )
<brightness()> = brightness( <number-percentage> )
<contrast()> = contrast( [ <number-percentage> ] )
<drop-shadow()> = drop-shadow( <length>{2,3} <color>? )
<grayscale()> = grayscale( <number-percentage> )
<hue-rotate()> = hue-rotate( <angle> )
<invert()> = invert( <number-percentage> )
<opacity()> = opacity( [ <number-percentage> ] )
<saturate()> = saturate( <number-percentage> )
<sepia()> = sepia( <number-percentage> )

where 
<number-percentage> = <number> | <percentage>
<color> = <rgb()> | <rgba()> | <hsl()> | <hsla()> | <hwb()> | <hex-color> | <named-color> | currentcolor | <deprecated-system-color>

where 
<rgb()> = rgb( <percentage>{3} [ / <alpha-value> ]? ) | rgb( <number>{3} [ / <alpha-value> ]? ) | rgb( <percentage>#{3} , <alpha-value>? ) | rgb( <number>#{3} , <alpha-value>? )
<rgba()> = rgba( <percentage>{3} [ / <alpha-value> ]? ) | rgba( <number>{3} [ / <alpha-value> ]? ) | rgba( <percentage>#{3} , <alpha-value>? ) | rgba( <number>#{3} , <alpha-value>? )
<hsl()> = hsl( <hue> <percentage> <percentage> [ / <alpha-value> ]? ) | hsl( <hue>, <percentage>, <percentage>, <alpha-value>? )
<hsla()> = hsla( <hue> <percentage> <percentage> [ / <alpha-value> ]? ) | hsla( <hue>, <percentage>, <percentage>, <alpha-value>? )
<hwb()> = hwb( [<hue> | none] [<percentage> | none] [<percentage> | none] [ / [<alpha-value> | none] ]? )

where 
<alpha-value> = <number> | <percentage>
<hue> = <number> | <angle>`,
        `drop-shadow(16px 16px 20px red) invert(75%)`,
        `contrast(175%) brightness(3%)`,
        `url('../../me\\\\dia/exam\\\nples/sh\\'adow.svg#element-id')`
    ],
    "flex": [
        `none | [ <'flex-grow'> <'flex-shrink'>? || <'flex-basis'> ]`,
        `1 1 100px`,
        `2 2 10%`
    ],
    "font": [
        `[ [ <'font-style'> || <font-variant-css21> || <'font-weight'> || <'font-stretch'> ]? <'font-size'> [ / <'line-height'> ]? <'font-family'> ] | caption | icon | menu | message-box | small-caption | status-bar
where 
<font-variant-css21> = [ normal | small-caps ]`,
        `italic 1.2em "Fira Sans", serif`,
        `small-caps bold 24px/1 sans-serif`
    ],
    "margin": [
        `[ <length> | <percentage> | auto ]{1,4}`,
        `10px 50px 20px 0`,
        `10px 50px 20px`,
        `5% 0`
    ],
    "transform": [
        `none | <transform-list>
where 
<transform-list> = <transform-function>+

where 
<transform-function> = <matrix()> | <translate()> | <translateX()> | <translateY()> | <scale()> | <scaleX()> | <scaleY()> | <rotate()> | <skew()> | <skewX()> | <skewY()> | <matrix3d()> | <translate3d()> | <translateZ()> | <scale3d()> | <scaleZ()> | <rotate3d()> | <rotateX()> | <rotateY()> | <rotateZ()> | <perspective()>

where 
<matrix()> = matrix( <number>#{6} )
<translate()> = translate( <length-percentage> , <length-percentage>? )
<translateX()> = translateX( <length-percentage> )
<translateY()> = translateY( <length-percentage> )
<scale()> = scale( <number> , <number>? )
<scaleX()> = scaleX( <number> )
<scaleY()> = scaleY( <number> )
<rotate()> = rotate( [ <angle> | <zero> ] )
<skew()> = skew( [ <angle> | <zero> ] , [ <angle> | <zero> ]? )
<skewX()> = skewX( [ <angle> | <zero> ] )
<skewY()> = skewY( [ <angle> | <zero> ] )
<matrix3d()> = matrix3d( <number>#{16} )
<translate3d()> = translate3d( <length-percentage> , <length-percentage> , <length> )
<translateZ()> = translateZ( <length> )
<scale3d()> = scale3d( <number> , <number> , <number> )
<scaleZ()> = scaleZ( <number> )
<rotate3d()> = rotate3d( <number> , <number> , <number> , [ <angle> | <zero> ] )
<rotateX()> = rotateX( [ <angle> | <zero> ] )
<rotateY()> = rotateY( [ <angle> | <zero> ] )
<rotateZ()> = rotateZ( [ <angle> | <zero> ] )
<perspective()> = perspective( <length> )

where 
<length-percentage> = <length> | <percentage>`,
        `matrix(1, 2, 3, 4, 5, 6)`,
        `scale(0.5) translate(-100%, -100%)`,
        `matrix3d(1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0, 13.0, 14.0, 15.0, 16.0)`,
        `rotate3d(1, 2.0, 3.0, 10deg)`,
        `rotate(0) rotate(20deg)`
    ],
    "transition": [
        `<single-transition>#
where 
<single-transition> = [ none | <single-transition-property> ] || <time> || <easing-function> || <time>

where 
<single-transition-property> = all | <custom-ident>
<easing-function> = linear | <cubic-bezier-timing-function> | <step-timing-function>

where 
<cubic-bezier-timing-function> = ease | ease-in | ease-out | ease-in-out | cubic-bezier(<number [0,1]>, <number>, <number [0,1]>, <number>)
<step-timing-function> = step-start | step-end | steps(<integer>[, <step-position>]?)

where 
<step-position> = jump-start | jump-end | jump-none | jump-both | start | end`,
        `margin-right 2s`,
        `margin-right 2s ease-in-out`,
        `all 1s ease-out`,
        `margin-right 4s ease-in-out 1s`,
        `inherit`
    ]

};

global.test_vds = TEST_TABLE.background[0];
global.test_csv = TEST_TABLE.background[1];
global.vdsParser = parser;

test();
//test();

function test() {

    console.time("test");
    /**
     * data-types 内的的一些公用 pattern 为分析过程中用到则按需编译，
     * 这里包含了 TEST_TABLE 中用到的所有公共 pattern 的编译时，
     * 和结合编译生成的 analyzer 的分析时 
     */
    const RESULT_TABLE = {};
    for (const key in TEST_TABLE) {
        const testCase = TEST_TABLE[key];
        const [syntax] = testCase;
        const input = testCase.slice(1);
        const analyzer = parser(syntax);
        const output = input.map(analyzer);
        const success = output.map(item => item.success).join()
        RESULT_TABLE[key] = {
            syntax,
            input,
            analyzer,
            output,
            success
        }
    }
    console.timeEnd("test");

    console.table(RESULT_TABLE);
}

