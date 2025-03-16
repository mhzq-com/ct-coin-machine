import { useEffect, useState, ReactDOM } from "react";
import Button from "./form/Button";
import ProductionResource from "./ProductionResource";
import ProductionItem from "./ProductionItem";
import ProductionItemAdd from "../ProductionItemAdd";

import Modal from './Modal';
import ProductionResourceAdd from "../ProductionResourceAdd";
import Input from "./form/Input";
import RecipeItem from "./RecipeItem";
import Entities from "../../System/Db/Entities";


const Recipe = (props) => {


    var [recipe, setRecipe] = useState(props.recipe);
    var [items, setItems] = useState([]);

    useEffect(async () => {
        try {
            var f = await fetch("/api/DI/Recipe_Item", {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                headers: {
                    'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                credentials: "include",
                redirect: 'follow', // manual, *follow, error
                referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: JSON.stringify({ params: {documentId: recipe.id }, orderby: { sort: "ASC" } }) // body data type must match "Content-Type" header
            });
            var res = await f.json();


            if (f.ok) {
                setItems(res);
            }




        } catch (error) {

        }


    }, [])

    function onItemDelete(item) {

        var f = items.findIndex((o) => {
            return o.id == item.id;
        })
        if (f > -1) {
            items.splice(f, 1);
        }
        console.log(items);
        
        setItems([...items]);
    }

    // function onItemChange(item) {
        
    //     var f = items.find((o) => {
    //         return o.id == item.id;
    //     })
    //     if (f) {

    //         f.timeInterval = item.timeInterval;
    //     }

    //     setItems([...items]);
    // }


    async function Save() {

        var itemsToSave = items.map((o) => {
            var ret = Object.assign({}, o);
            ret.sort = $(ret.dom).index() + 1;
            delete ret.dom;
            return ret;

        });

        console.log(itemsToSave);
        

        var f = await fetch("/api/saveRecipe", {
            method: "POST"
            ,
            headers: {
                "Content-Type": "application/json"
            }
            , credentials: "include",
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify({ recipe: recipe, items: itemsToSave }) // body data type must match "Content-Type" header

        });

        var res = await f.json();
        if (f.ok) {
            UIkit.notification("Sikeres mentés", { status: "success" });
            recipe.id = res.recipe.id;
            
            setItems([...res.items]);
            props.onRecipeSave?props.onRecipeSave(recipe):undefined;

        } else {
            UIkit.notification(`Mentés nem sikerült${res.message}`, { status: "danger" });

        }
    }


    return <>
        <div>

        </div>
        <div>
            <fieldset className="uk-fieldset">
                <legend className="uk-legend">Receptúra beállítások</legend>
                <div>
                    <label className="uk-form-label" htmlFor="productionMinTemperature">Megnevezés</label>
                </div>
                <div>
                    <Input required={true} onChange={(e) => {
                        recipe.name = e.target.value;
                    }} id="recipeName" name="name" value={recipe?.name}></Input>
                </div>
            </fieldset>
            <fieldset className="uk-fieldset">

                <legend className="uk-legend">Napok</legend>
                <div className="uk-text-right">

                    <Button className="uk-margin-small" onClick={() => {
                        items.push(new Entities.Recipe_Item());
                        setItems([...items]);
                    }}><i className="fa-solid fa-plus"></i></Button>
                </div>
                <ul id="items" className="bh-counter uk-nav uk-nav-default bh-striped"  uk-sortable="cls-custom: uk-box-shadow-small uk-background" >

                    {items && (items.map((o, i) => {
                        return <RecipeItem key={"a" + o.id} item={o} onDelete={onItemDelete} 
                        // onChange={onItemChange}
                        ></RecipeItem>
                    })
                    )
                    }
                </ul>
                
            </fieldset>
            
        </div>
        <div className="uk-margin-small">
            <div className="uk-text-right">
                <Button type="button" onClick={Save}>Mentés</Button>
            </div>
        </div>

        {/* <Modal isOpen={false} >{modalContent}</Modal> */}
    </>;

};

export default Recipe;