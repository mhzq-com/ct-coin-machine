import { useEffect, useState } from "react";

const TemperatureMeter = (props) => {

    const [temperature, setTemperature] = useState(props.resource?.temperature);

    if(props.onTemperatureChange){

        props.onTemperatureChange(props.resource, setTemperature);
    }


    return <>
        <div className="uk-position-absolute uk-transform-center" style={{left: "50%", top:props.top}}>

        <a className="uk-marker uk-transform-center" href="#" uk-marker={true} >
            <i className="fa-solid fa-temperature-three-quarters"></i>
            <span className="temp">{parseFloat(temperature).toFixed(0)}°</span>
        </a>
        <div><span class="uk-label">{props.resource?.code}</span></div>
        </div>
    </>;

};

export default TemperatureMeter;