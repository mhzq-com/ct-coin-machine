import React, {useState} from "react";
import classnames from "classnames";
export default function Button(props){
    
    var inputDom = undefined;
    var searchString, setSearchString;
    
    searchString = props.value;
    [searchString, setSearchString] = useState(props.value);


    return <button id={props.id || ""} type={props.type?props.type:"button"} onClick={(e) => {props.onClick?props.onClick(e):(()=>{})}} ref={element => inputDom = element} className={classnames("primary-button uk-button uk-button-primary ", props.className)} style={props.style?props.style:undefined} >{props.children}</button>;
    
}