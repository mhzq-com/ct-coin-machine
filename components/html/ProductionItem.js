import { useEffect, useState } from "react";
import Input from "./form/Input";
import Button from "./form/Button";

const ProductionItem = (props) => {

    var dom = undefined;
    var item = props.item;
    function onDelete(){
        // $(dom).remove();
        props.onDelete(props.item);
    }

    function change(){
        item.quantity = $(dom).find("input[name=quantity]").val();
        item.quantityUnit = $(dom).find("input[name=quantityUnit]").val();
        props.onChange(item);
    }

    return <>

        <li ref={(element) => {dom = element}}>
            <div className="uk-flex uk-flex-middle">
                <div className="uk-flex-1">
                    <div className="uk-grid">

                    <span>{props.item?.hakCode}</span>
                    <span>{props.item?.code}</span>
                    <span>{props.item?.name}</span>
                    </div>
                </div>
                    {/* <span><Input className="number" onChange={(e) => {  }} name="" value={props.item?.quantity}></Input></span> */}
                    <span><Input className="number" onChange={change} name="quantity" value={props.item?.quantity}></Input></span>
                <span>{props.item?.quantityUnit}</span>
                <Button  onClick={onDelete}><i className="fa-regular fa-trash-can"></i></Button>
            </div>
        </li>
    </>;

};

export default ProductionItem;