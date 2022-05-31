export default
    `none | [ <'grid-template-rows'> / <'grid-template-columns'> ] | [ <line-names>? <string> <track-size>? <line-names>? ]+ [ / <explicit-track-list> ]?
where 
<line-names> = '[' <custom-ident>* ']'
<track-size> = <track-breadth> | minmax( <inflexible-breadth> , <track-breadth> ) | fit-content( [ <length> | <percentage> ] )
<explicit-track-list> = [ <line-names>? <track-size> ]+ <line-names>?

where 
<track-breadth> = <length-percentage> | <flex> | min-content | max-content | auto
<inflexible-breadth> = <length> | <percentage> | min-content | max-content | auto

where 
<length-percentage> = <length> | <percentage>`