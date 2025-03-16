import { useEffect, useState, ReactDOM } from "react";
import Button from "./form/Button";
import ProductionResource from "./ProductionResource";
import ProductionItem from "./ProductionItem";
import ProductionItemAdd from "../ProductionItemAdd";

import Modal from './Modal';
import ProductionResourceAdd from "../ProductionResourceAdd";
import Input from "./form/Input";
import Entities from "../../System/Db/Entities";
import Recipe from "./Recipe";


const ProductionClose = (props) => {


    var [production, setProduction] = useState(props.production);
    useEffect(async () => {

    }, [])


    async function Save(e) {
        
       
        var f = await fetch("/api/startStopProduction", {
            method: "POST"
            ,
            headers: {
                "Content-Type": "application/json"
            }
            , credentials: "include",
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify({ production: production }) // body data type must match "Content-Type" header

        });

        var res = await f.json();
        if (f.ok) {
            UIkit.notification("Sikeres zárás", { status: "success" });

            props.onBlockChange(res);
            UIkit.modal($(e.target).closest(".uk-modal")).hide();

        } else {
            UIkit.notification(`Zárás nem sikerült${res.message}`, { status: "danger" });

        }
    }

    return <>
        <div>
            <h2>{props.block?.name} Komposztálás lezárása</h2>
        </div>
        <div>
            <label htmlFor="productionWeight">Mért súly</label>
            <div className="uk-flex uk-flex-middle">

                <Input  className="number" name="measuredWeight" id="productionMeasuredWeight" bind={production}  ></Input>
                <span>kg</span>
            </div>
        </div>
        <div className="uk-margin-small">
            <div className="uk-text-right">
                <Button type="button" onClick={Save}>Lezárás</Button>
            </div>
        </div>
    </>;

};

export default ProductionClose;