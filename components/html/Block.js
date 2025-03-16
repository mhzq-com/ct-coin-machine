import { useContext, useEffect, useState } from "react";
import TemperatureMeter from "./TempearatureMeter";
import ProductionClose from "./ProductionClose";
import Button from "./form/Button";
import classnames from "classnames";

const Block = (props) => {

    //console.log(props);



    const [isVentillation, setVentillation] = useState(props.block?.isVentillation);
    const [ventillationStarted, setVentillationStarted] = useState(props.block?.ventillationStarted);
    const [inDangerTemp, setInDangerTemp] = useState(props.block?.inDangerTemp);
    const [production, setProduction] = useState(props.block?.production);
    const [resources, setResources] = useState(props.block?.resources);
    const [items, setItems] = useState(props.block?.items);



    if (props.onTemperatureChange) {

        props.onTemperatureChange(props.block, (data) => {
            // console.log(data);

            var ind = resources.findIndex((o) => { return o.id == data.resourceId })
            if (ind > -1) {
                resources[ind].setTemperature(data.measurement);
            }
        });
    }

    if (props.onSetVentillationChange) {

        props.onSetVentillationChange(props.block, setVentillation, setVentillationStarted, onBlockChangeCb);
    }

    function onBlockChangeCb(b){
        setInDangerTemp(b.inDangerTemp);
    }   

    var setOnResourceTempChange = (resource, cb) => {
        // console.log(resource, cb);
        var ind = resources.findIndex((o) => { return o.id == resource.id })
        if (ind > -1) {
            resources[ind].setTemperature = cb;
        }
    }

    async function startStopProduction() {

        if ((production.endDate)) {

            try {
                //await UIkit.modal.confirm(`Lezárja a folyamatot?`);

                if (props.setModalContent) {

                    props.setModalContent(<ProductionClose onBlockChange={onBlockChange} block={props.block} production={production}></ProductionClose>);
                }
            } catch (error) {
                console.log(error);
            }
            return;
        } else {

            try {
                await UIkit.modal.confirm(`${production.isRunning ? "Leállítja" : "Elindítja"} a folyamatot?`);
                production.isRunning = production.isRunning ? 0 : 1;
            } catch (error) {
                return;
            }
        }



        var res;
        var f = await fetch("/api/startStopProduction", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify({ production: production }) // body data type must match "Content-Type" header
        });
        res = await f.json();
        if (f.ok) {
            await setProduction(res);
            UIkit.notification(`A folyamat ${res.isRunning ? "elindult" : (res.isActive) ? "leállt" : "lezárult"}!`, { status: "success" });
        } else {
            UIkit.notification(res.message, { status: "danger" });
        }

    }

    function onBlockChange(production, items = [], resources = []) {
        console.log(production);
        setProduction(production);
        setResources(resources);
    }


    function GetControlType(type){
        switch(type){
            case "manual": 
            return "M";
            case "temperatureInterval": 
            return "C°";
            case "time": 
            return "I";
            case "recipe": 
            return "R";
        
        }
    }

    return <>

        <div className={classnames("block ", props.className)}>
            <span className="uk-text-bold fa-2x">{props.block?.name}</span>
            <div>
                <div className="uk-inline uk-dark uk-position-relative">
                    <img className="uk-image" src="/assets/img/block.png" />
                    <div className="controlButtons uk-position-absolute uk-flex" style={{ left: 0, top: 0, right: 0 }}>
                        <div className="uk-flex-1 uk-text-left">

                            {production != undefined && production.isActive > 0 && (
                                <Button onClick={startStopProduction} className={" uk-button-link " + (production?.isRunning ? "success-button" : "")} style={{ margin: "5px", "margin-bottom": "10px", padding: "0px 10px" }}> <i className={"fa-solid " + (production?.endDate ? "fa-eject" : (production?.isRunning ? "fa-play" : "fa-stop"))}></i></Button>
                            )

                            }
                            <Button onClick={() => {
                                props.onSetBlock(production, onBlockChange);
                            }} className="uk-button-link " style={{ padding: "0px 10px" }} > <i className="fa-solid fa-gear"></i></Button>
                        </div>
                        <div className="uk-flex-1">
                            <Button onClick={() => {
                                props.onSetVentillation(props.block, !isVentillation);
                            }} className={"fan uk-position-relative uk-button-link " + (isVentillation ? "success-button" : "")} style={{ padding: "0px 10px" }}> 
                            <i className={"animate__animated fa-2x fa-solid fa-fan uk-position-relative" + (isVentillation ? " bh-rotate" : "")}></i>
                            <i className={`fa-circle-dot fa-solid uk-position-absolute ${ventillationStarted ? " uk-text-background" : ""}`} style={{fontSize: "12px", left: "1px", top:"1px"}}></i>
                            <span className="uk-position-absolute uk-position-bottom-right controlType uk-text-secondary">{GetControlType(production.controlType)}</span>
                            </Button>
                        </div>
                        <div className="uk-flex-1 uk-text-right">
                            {production != undefined && production.isActive > 0 && (
                                <Button onClick={() => { props.onChartClick(production) }} className={" uk-button-link "} style={{ margin: "5px", padding: "0px 10px" }}> <i className={"fa-solid fa-chart-line"}></i></Button>
                            )}
                            {production != undefined && production.isActive > 0 && inDangerTemp &&(
                                <Button className={" uk-button-link uk-button-secondary"} style={{ margin: "5px", padding: "0px 10px", backgroundColor:"white" }}> <i class="animate__animated animate__fadeOut uk-text-danger fa-solid fa-temperature-high" style={{animationIterationCount: "infinite"}}></i></Button>
                            )}
                        </div>

                    </div>
                    {production.isActive == 1 && resources != undefined && (

                        resources.map((resource, i) => {

                            return <TemperatureMeter className="uk-flex-1 uk-text-center" resource={resource} onTemperatureChange={setOnResourceTempChange} top={(1 + i) * ((100) / resources.length) - (((100) / resources.length) / 2) + 2 + "%"} ></TemperatureMeter>
                        }
                        )
                    )}

                </div>
            </div>
        </div>
    </>;

};

export default Block;