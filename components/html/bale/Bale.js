import React from "react";
import Card from "../Card"
import Image from "../Image";
class Bale extends React.Component{

    constructor(props){
        super(props);


    }

    render(){
        return <Card id={   this.props.item?.id} cardTitle={this.props.item?.name} className="uk-text-center bale" onClick={this.props.onClick?.bind(this)}>
            <div  >
                <div className="uk-width-1-3 uk-align-center">
                <Image src={this.props.item?.image} className="uk-height-max-small "></Image>
                </div>
                <div className=""><span>HAK kód: </span>{this.props.item?.hakCode}</div>
                
                <div className="uk-padding-small uk-position-right uk-width-auto"><input type="checkbox" className="uk-checkbox" name={this.props.checkboxName} value={this.props.item?.id}/></div>
            </div>
            </Card>;
    }
}

export default Bale;