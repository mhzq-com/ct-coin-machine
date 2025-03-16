import { useEffect, useState } from "react";
import Input from "./form/Input";
import Button from "./form/Button";

const RecipeItem = (props) => {

    var dom = undefined;
    var item = props.item;

    // console.log(props.item.minTemperature);

    function onDelete(){
        // $(dom).remove();
        props.onDelete(props.item);
    }

    useEffect(() => {
        item.dom = dom;
        // props.onChange(item);
    }, [])

    function change(){
        item.timeInterval = $(dom).find("input[name=interval]").val();
        item.minTemperature = $(dom).find("input[name=minTemperature]").val();
        item.maxTemperature = $(dom).find("input[name=maxTemperature]").val();
        // props.onChange(item);
    }

    return <>

        <li ref={(element) => {dom = element}} className="">
            <div className="uk-flex uk-flex-middle">
                <div className="uk-hidden uk-flex-1">
                    <div>Intervallum</div>
                    <div>
                        <span><Input onChange={change} name="interval" value={props.item?.timeInterval}></Input></span>
                    </div>
                </div>
                <div className="uk-flex-1">
                    <div>Alsó hőmérséklet</div>
                    <div>
                        <span><Input onChange={change} name="minTemperature" value={props.item?.minTemperature}></Input></span>
                    </div>
                </div>
                <div className="uk-flex-1">
                    <div>Felső hőmérséklet</div>
                    <div>
                        <span><Input onChange={change} name="maxTemperature" value={props.item?.maxTemperature}></Input></span>
                    </div>
                </div>
                <Button  onClick={onDelete}><i className="fa-regular fa-trash-can"></i></Button>
                <i className="fas fa-bars uk-padding-small"></i>
            </div>
        </li>
    </>;

};

export default RecipeItem;