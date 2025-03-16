import React from "react";
class Section extends React.Component{
    render(){
        return <section className={this.props.className} style={this.props.style}>{this.props.children}</section>;
    }
}

export default Section;