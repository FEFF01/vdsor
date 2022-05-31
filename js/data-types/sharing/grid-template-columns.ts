export default
    `none | <track-list> | <auto-track-list> | subgrid <line-name-list>?
where 
<track-list> = [ <line-names>? [ <track-size> | <track-repeat> ] ]+ <line-names>?
<auto-track-list> = [ <line-names>? [ <fixed-size> | <fixed-repeat> ] ]* <line-names>? <auto-repeat>
[ <line-names>? [ <fixed-size> | <fixed-repeat> ] ]* <line-names>?
<line-name-list> = [ <line-names> | <name-repeat> ]+

where 
<line-names> = '[' <custom-ident>* ']'
<track-size> = <track-breadth> | minmax( <inflexible-breadth> , <track-breadth> ) | fit-content( [ <length> | <percentage> ] )
<track-repeat> = repeat( [ <integer [1,∞]> ] , [ <line-names>? <track-size> ]+ <line-names>? )
<fixed-size> = <fixed-breadth> | minmax( <fixed-breadth> , <track-breadth> ) | minmax( <inflexible-breadth> , <fixed-breadth> )
<fixed-repeat> = repeat( [ <integer [1,∞]> ] , [ <line-names>? <fixed-size> ]+ <line-names>? )
<auto-repeat> = repeat( [ auto-fill | auto-fit ] , [ <line-names>? <fixed-size> ]+ <line-names>? )
<name-repeat> = repeat( [ <integer [1,∞]> ] | auto-fill ], <line-names>+ )

where 
<track-breadth> = <length-percentage> | <flex> | min-content | max-content | auto
<inflexible-breadth> = <length> | <percentage> | min-content | max-content | auto
<fixed-breadth> = <length-percentage>

where 
<length-percentage> = <length> | <percentage>`