import { useEffect, useState } from "react";
import Input from "./form/Input";
import Button from "./form/Button";

const ProductionResource = (props) => {

    var inputDom = undefined;

    function onDelete(e){
        console.log(e);
        // $(inputDom).remove();
        props.onDelete(props.resource);
    }

    return <>

        <li ref={element => inputDom = element} >
            <div className="uk-flex uk-flex-middle" >
                <div className="uk-flex-1">
                    <span className="uk-padding-small">{props.resource?.code}</span>
                    <span>{props.resource?.name}</span>
                </div>
                <Button  onClick={onDelete}><i className="fa-regular fa-trash-can"></i></Button>
            </div>
        </li> 
    </>;

};

export default ProductionResource;