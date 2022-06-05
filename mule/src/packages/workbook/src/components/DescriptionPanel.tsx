
import { connect } from "react-redux";
import React from "react";

import { withStyles } from "@material-ui/core/styles";



import Frame from "react-frame-component";



import * as State from '../state'















//===================================================================================================================
let DescriptionPanel = null;
{
  let style = theme=>({
    iframeStyle: {
      paddingLeft:0,
      left:0,
      border: "0",
      width: "100%",
      height:"100%"
    },
    innerDiv: {
      marginLeft: theme.spacing.unit*30
    }
  });



  type MyProps = {
    contents: any,
    classes: any,
    path: any,
    open: any,
    workbookContent: any
  }



  class Iframe extends React.Component<MyProps,{}> {
    static propTypes: Object = {
      // onLoad: PropTypes.func,
    };




     getDescription(path,contents)
    {
      try {
        var current=contents;
        var finder=(x)=>{ return (x.title===path[i])}
        for(var i=0;i<path.length;i++)
        {
          current=(current.find(finder))
          if(i<path.length-1) current=current.children;
        }

        console.log("DESCRIPTION:",current.description)
        if((current.description==="")||(current.description==null))
          current.description="This page is blank"
        return {__html: current.description};
      } catch (e) {
        return  {__html:"Nothing to display"}
      }
    }








    componentDidMount() {
      //setInterval(() => { this.props.setIframeContents("hi");},1200);
      //setInterval(() => { this.props.setIframeContents("bye");},1000);
      //let iframe = ReactDOM.findDOMNode(this.refs.iframe)
      //iframe.addEventListener('load', this.props.onLoad);
    }

    render() {
      console.log(this.props.contents);
      const { classes } = this.props;

      if(!this.props.open) return null;
      return (
        <Frame ref="iframe" className={classes.iframeStyle} >
        <link href="https://cdn.muicss.com/mui-0.9.41/css/mui.min.css" rel="stylesheet" type="text/css" />

        <div className={classes.innerDiv} style={{marginLeft: '1em',marginRight:"1em"}} dangerouslySetInnerHTML={this.getDescription(this.props.path,this.props.workbookContent)}></div>
        </Frame>
      );
    }
  }

  let mapStateToProps = (state /*, ownProps*/) => {
    console.log(state);
    return {
      open: state.panels.iframe,
      contents: state.iframe.contents,
      path: state.workbook.selected,
      workbookContent: state.workbook.contents
    };
  };

  let {setIframeContents}=State;
  let mapDispatchToProps = { setIframeContents };

  DescriptionPanel = connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(style)(Iframe));
}

export default DescriptionPanel
