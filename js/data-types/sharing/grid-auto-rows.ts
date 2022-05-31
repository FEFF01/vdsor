export default
    `<track-size>+
where 
<track-size> = <track-breadth> | minmax( <inflexible-breadth> , <track-breadth> ) | fit-content( [ <length> | <percentage> ] )

where 
<track-breadth> = <length-percentage> | <flex> | min-content | max-content | auto
<inflexible-breadth> = <length> | <percentage> | min-content | max-content | auto

where 
<length-percentage> = <length> | <percentage>`