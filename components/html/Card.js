import React from "react";
import classnames from 'classnames';
class Card extends React.Component{
    render(){
        return <div id={this.props.id} className={classnames("uk-card uk-card-default uk-card-body uk-width-1-3@m", this.props.className)} onClick={this.props.onClick}>
        <h3 className="uk-card-title uk-text-center">{this.props.cardTitle}</h3>
        {this.props.children}
    </div>;
    }
}

export default Card;