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
import Modal2 from "./Modal2";



const Production = (props) => {


    var [production, setProduction] = useState(props.production);
    var [controlType, setControlType] = useState(props.production?.controlType);
    var [addedProductionItems, setProductionItems] = useState([]);
    var [addedResources, setProductionResources] = useState([]);

    var [recipes, setRecipes] = useState([]);


    

    // console.log(props);

    useEffect(async () => {
        try {
            var f = await fetch("/api/getProductionElements", {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                headers: {
                    'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                credentials: "include",
                redirect: 'follow', // manual, *follow, error
                referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: JSON.stringify({ production: production }) // body data type must match "Content-Type" header
            });
            var res = await f.json();


            if (f.ok) {
                setProductionItems(res.items);
                setProductionResources(res.resources);
            }




        } catch (error) {

        }

        try {

            var f = await fetch("/api/DI/Recipe", {
                method: "POST"
                ,
                headers: {
                    "Content-Type": "application/json"
                }
                , credentials: "include",
                redirect: 'follow', // manual, *follow, error
                referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: JSON.stringify({ params: {} }) // body data type must match "Content-Type" header

            });

            var res = await f.json();

            if (f.ok) {
                setRecipes(res);
            } else {


            }
        } catch (error) {
            console.log(error);
        }

    }, [])

    const [modalContent, setModalContent] = useState(undefined);

    function onResourceDelete(resource) {
        var f = addedResources.findIndex((o) => {
            return o.id == resource.id;
        })
        if (f > -1) {
            addedResources.splice(f, 1);
        }

        setProductionResources([...addedResources]);
    }

    function onItemDelete(item) {

        var f = addedProductionItems.findIndex((o) => {
            return o.id == item.id;
        })
        if (f > -1) {
            addedProductionItems.splice(f, 1);
        }

        setProductionItems([...addedProductionItems]);
    }

    function onItemChange(item) {
        var f = addedProductionItems.find((o) => {
            return o.id == item.id;
        })
        if (f) {

            f.quantity = item.quantity;
            f.quantityUnit = item.quantityUnit
        }

        setProductionItems([...addedProductionItems]);
    }

    function onProductionItemAdd(item) {

        console.log(item, addedProductionItems);
        if (addedProductionItems.find((o) => {
            return o.id == item.id;
        })
        ) {

            UIkit.notification("Az anyag már hozzá van adva", { status: "danger" });
            return;
        }

        addedProductionItems.push(item);
        setProductionItems([...addedProductionItems]);
    }

    function onResourceAdd(item) {

        if (addedResources.find((o) => {
            return o.id == item.id;
        })
        ) {

            UIkit.notification("A mérőeszköz már hozzá van adva", { status: "danger" });
            return;
        }
        
        if(addedResources.length > 2){
            UIkit.notification("Maximum 3 eszköz rendelhető hozzá!", { status: "danger" });
            return;
            
        }

        addedResources.push(item);
        setProductionResources([...addedResources]);
    }

    async function Save(e) {

        
        production.minTemperature = $(e.target).closest(".uk-modal").find("input[name=minTemperature]").val();
        production.maxTemperature = $(e.target).closest(".uk-modal").find("input[name=maxTemperature]").val();
        production.timeInterval = $(e.target).closest(".uk-modal").find("input[name=timeInterval]").val();
        production.timeCool = $(e.target).closest(".uk-modal").find("input[name=timeCool]").val();

        if(production.controlType == "time"){
            production.timeIntervalUnit = production.timeIntervalUnit?production.timeIntervalUnit:"H";
            production.timeCoolUnit = production.timeCoolUnit?production.timeCoolUnit:"H";
        }

        
        

        var f = await fetch("/api/saveProduction", {
            method: "POST"
            ,
            headers: {
                "Content-Type": "application/json"
            }
            , credentials: "include",
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify({ production: production, items: addedProductionItems, resources: addedResources }) // body data type must match "Content-Type" header

        });

        var res = await f.json();
        if (f.ok) {
            UIkit.notification("Sikeres mentés", { status: "success" });

            props.onBlockChange(res.production, res.items, res.resources);

            UIkit.modal($(e.target).closest(".uk-modal")).hide();

        } else {
            UIkit.notification(`Mentés nem sikerült${res.message}`, { status: "danger" });

        }
    }

    function onControlTypeChange(e) {
        production.controlType = e.target.value;
        setControlType(e.target.value);
    }

    function controlTypeOption() {
        switch (controlType) {
            case "manual":
                return <></>;
                break;
            case "temperatureInterval":
                return <>
                    <div className="uk-flex">
                        <div className="uk-flex-1">
                            <div>
                                <label className="uk-form-label" htmlFor="productionMinTemperature">Alsó hőmérséklet érték</label>
                            </div>
                            <div>
                                <Input className="number" required={true} onChange={(e) => {
                                    production.minTemperature = e.target.value;
                                }} id="productionMinTemperature" name="minTemperature" value={production?.minTemperature}></Input>
                            </div>
                        </div>
                        <div className="uk-flex-1">
                            <div>
                                <label className="uk-form-label" htmlFor="productionMaxTemperature">Felső hőmérséklet érték</label>
                            </div>
                            <div>
                                <Input className="number" required={true} onChange={(e) => {
                                    production.maxTemperature = e.target.value;

                                }} id="productionMaxTemperature" name="maxTemperature" value={production?.maxTemperature}></Input>
                            </div>
                        </div>
                    </div>
                </>;
                break;
            case "time":
                return <>
                    <div className="uk-flex">
                        <div className="uk-flex-1">
                            <div>
                                <label className="uk-form-label" htmlFor="productionTimeInterval">Idő intervallum</label>
                            </div>
                            <div>
                                <Input className="number" required={true} onChange={(e) => {
                                    production.timeInterval = e.target.value;
                                    
                                }} id="productionTimeInterval" name="timeInterval" value={production?.timeInterval}></Input>
                            </div>
                            <div>
                                <select className="uk-select" onChange={(e) => {
                                    production.timeIntervalUnit = e.target.value;
                                    
                                }} name="timeIntervalUnit" id="productionTimeIntervalUnit">
                                    <option value="H" selected={production?.timeIntervalUnit == "H"} >Óra</option>
                                    <option value="m" selected={production?.timeIntervalUnit == "m"} >Perc</option>
                                </select>
                            </div>
                        </div>
                        <div className="uk-flex-1">
                            <div>
                                <label className="uk-form-label" htmlFor="productionTimeCool">Hűtési idő</label>
                            </div>
                            <div>
                                <Input className="number" required={true} onChange={(e) => {
                                    production.timeCool = e.target.value;
                                }} id="productionTimeCool" name="timeCool" value={production?.timeCool}></Input>
                            </div>
                            <div>
                                <select className="uk-select" onChange={(e) => {
                                    production.timeCoolUnit = e.target.value;
                                    
                                }} name="timeCoolUnit" id="productionTimeCoolUnit">
                                    <option value="H" selected={production?.timeCoolUnit == "H"} >Óra</option>
                                    <option value="m" selected={production?.timeCoolUnit == "m"} >Perc</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </>;
                break;
            case "recipe":

                return <>
                    <div className="uk-flex uk-flex-middle uk-padding-small">
                        <select className="uk-select uk-margin-right" onChange={(e) => {
                            production.recipeId = e.target.value;
                        }} name="recipeId" id="productionRecipeId">
                            <option >Válassz!</option>
                            {
                                recipes.map((o) => {
                                    return <option value={o.id} selected={production?.recipeId == o.id}>{o.name}</option>
                                })
                            }
                        </select>

                        {/* <a href="/Recipe"> */}
                        <Button onClick={() => {
                            setModalContent(<Recipe onRecipeSave={(recipe) => {
                                recipes.push(recipe);
                                setRecipes([...recipes]);
                            }} recipe={new Entities.Recipe()}></Recipe>)
                        }}><i className="fa-solid fa-plus"></i></Button>
                        {/* </a> */}
                    </div>
                </>;
                break;
        }
    }

    return <>
        <div>

        </div>
        <div>
            <fieldset className="uk-fieldset">
                <legend className="uk-legend">Általános beállítások</legend>
                <fieldset className="uk-fieldset">
                    <legend className="uk-legend">Mennyiség</legend>
                    <label htmlFor="productionWeight">Súly</label>
                    <div className="uk-flex uk-flex-middle">

                        <Input className="number" name="weight" id="productionWeight" bind={production}  ></Input>
                        <span>kg</span>
                    </div>
                    <label htmlFor="productionVolume">Térfogat (m^3)</label>
                    <div className="uk-flex uk-flex-middle">

                        <Input className="number" name="volume" bind={production} id="productionVolume" ></Input>
                        <span>m^3</span>
                    </div>

                    <label htmlFor="productionMoisture">Nedvességtartalom</label>
                    <div className="uk-flex uk-flex-middle">

                        <Input className="number" name="moisture" bind={production} id="productionMoisture" ></Input>
                        <span>%</span>
                    </div>
                </fieldset>
                <fieldset className="uk-fieldset">
                    <legend className="uk-legend">Vezérlés típusa</legend>
                    <select className="uk-select" onChange={onControlTypeChange} name="controlType" id="productionControlType">
                        <option value="manual" selected={controlType == "manual"} >Manuális</option>
                        <option value="temperatureInterval" selected={controlType == "temperatureInterval"}>Hőmérséklet intervallum</option>
                        <option value="time" selected={controlType == "time"}>Idővezérelt</option>
                        <option value="recipe" selected={controlType == "recipe"}>Receptúra</option>
                    </select>
                    {
                        (controlTypeOption())
                    }

                </fieldset>
            </fieldset>
            <fieldset className="uk-fieldset">

                <legend className="uk-legend">Összetevők</legend>
                <ul id="productionItems" className="uk-list uk-list-striped" >

                    {addedProductionItems && (addedProductionItems.map((o) => {
                        return <ProductionItem item={o} onDelete={onItemDelete} onChange={onItemChange}></ProductionItem>
                    })
                    )
                    }
                </ul>
                <div className="uk-text-right">

                    <Button onClick={() => {
                        setModalContent(<ProductionItemAdd onSubmit={onProductionItemAdd}></ProductionItemAdd>);
                    }}><i className="fa-solid fa-plus"></i></Button>
                </div>
            </fieldset>
            <fieldset className="uk-fieldset">

                <legend className="uk-legend">Mérőeszközök</legend>
                <ul id="productionResources" className="uk-list uk-list-striped" >
                    {addedResources && (addedResources.map((o) => {
                        return <ProductionResource resource={o} onDelete={onResourceDelete}></ProductionResource>
                    })
                    )
                    }
                </ul>
                <div className="uk-text-right">

                    <Button onClick={() => {
                        setModalContent(<ProductionResourceAdd onSubmit={onResourceAdd}></ProductionResourceAdd>);
                    }}><i className="fa-solid fa-plus"></i></Button>
                </div>
            </fieldset>
        </div>
        <div className="uk-margin-small">
            <div className="uk-text-right">
                <Button type="button" onClick={Save}>Mentés</Button>
                {/* <Button className="outline-button uk-margin-left">Mégsem</Button> */}
            </div>
        </div>

        {/* <Modal isOpen={false} >{modalContent}</Modal> */}
        <Modal2>{modalContent}</Modal2>
    </>;

};

export default Production;