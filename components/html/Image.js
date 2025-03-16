import React from "react";
import classnames from 'classnames';
class Image extends React.Component{
    render(){
        return <img src={this.props.src} uk-image="true" className={classnames(this.props.className)} />;
    }
}

export default Image;