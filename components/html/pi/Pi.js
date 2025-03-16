import React from "react";
import Card from "../Card"
import Image from "../Image";
class PiCard extends React.Component{
    render(){
        return <Card><div uk-grid="true">
                <div className="uk-width-1-3">
                <Image src="/assets/img/piscetch.png"></Image>
                </div>
                <div className="uk-width-2-3">Raspberry infók</div>
            </div>
            </Card>;
    }
}

export default PiCard;