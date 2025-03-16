import React from "react";
class Grid extends React.Component{
    render(){
        return <div className={this.props.className} uk-grid="true" style={this.props.style}>{this.props.children}</div>;
    }
}

export default Grid;