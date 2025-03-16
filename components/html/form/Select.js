import React, {useContext, useEffect, useRef, useState} from "react";
import classnames from "classnames";


export default function Select(props){
    
    var inputDom = useRef();
    var inputName = props.name || "";
    var bindValue = (props.bind && Object.keys(props.bind).find((o) => { return o == inputName; })) ? props.bind[inputName] : undefined;
    const [selectedValue, setSelectedValue] = useState(props.value || bindValue);


    function handleChange(e){
       
        setSelectedValue(e.target.value);

        if(props.bind && Object.keys(props.bind).find((o) => { return o == inputName; })){
            props.bind[inputName] = e.target.value;
        }

        if(props.onChange){
            props.onChange(e);
        }

    }

    function handleFocus(e){
        if(props.onFocus){
            props.onFocus(e);
        }
    }



    return <select id={props.id || ""} accept={props.accept || "*"} readOnly={props.readOnly} value={selectedValue}  onChange={handleChange} ref={inputDom} className={classnames("uk-input ", props.className)} type={props.type || "text"} name={inputName} placeholder={props.placeholder} required={props.required?true:false} onKeyDown={props.onKeyDown} onFocus={handleFocus} disabled={props.disabled?true:false} >
    {props.children}
  </select>
    
}