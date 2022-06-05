import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import PropTypes from "prop-types";
import {withStyles} from "@material-ui/core/styles";
import {connect} from "react-redux";
import Collapse from "@material-ui/core/Collapse";
import Drawer from "@material-ui/core/Drawer";
import ArrowRight from "@material-ui/icons/ArrowRight";

import * as State from '../state'

//https://stackoverflow.com/questions/40093655/how-do-i-add-attributes-to-existing-html-elements-in-typescript-jsx/56109822#56109822
declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // extends React's HTMLAttributes
    open?:any;
    onClose?: any;
  }
}








//=========================================================================================================
let MyNestedList = null;
{
  let style = theme => ({
    root: {
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper
    },
    nested: {
      paddingLeft: theme.spacing.unit * 2,
      paddingRight: 0

    },
    list: {
      paddingLeft: theme.spacing.unit / 2,
      paddingRight: theme.spacing.unit * 2,
      paddingTop: 0,
      paddingBottom: 0,
      height: "100%",

    },
    selected: {
      paddingLeft: theme.spacing.unit / 2,
      paddingRight: theme.spacing.unit * 2,
      paddingTop: 0,
      paddingBottom: 0,
      background: "#0000EE22"
    },
    listText: {
      paddingLeft: 0,
      paddingRight: 0,
      fontSize: "0.8rem"
    },
    listIcon: {
      marginLeft: 0,
      marginRight: theme.spacing.unit / 2
    },
    expandIcon: {
      marginLeft: theme.spacing.unit
    }
  });



  type MyPropTypes = {
    workbookSelectItem: any,
    open: any,
    toggleNavList: any,
    toggleDrawer: any,
    classes: any,
    contents:any,
    prefix:any,
    selected:any,
    openIframe: any
  }
  
  




  class NestedList extends React.Component<MyPropTypes,{}> {
    state = {
      open: {}
    };

    handleClick = (list, idx, prefix) => {

      this.props.workbookSelectItem(prefix)

      if (list[idx].children) {
        let newOpenState = JSON.parse(JSON.stringify(this.state.open));

        console.log("PROPS:", this.props.open)

        this.props.toggleNavList(prefix)

        newOpenState[idx] = !newOpenState[idx];
        this.setState({open: newOpenState});
      }
      else this.props.toggleDrawer()
      //var x=list[idx]

      //this.props.openIframe()
    };

    render() {
      const {classes, contents, prefix} = this.props;
      console.log("INNER:", this.props)

      //  console.log("Contents are: "+contents)

      //let newState=JSON.parse(JSON.stringify(this.state))
      ///contents.forEach((x, idx) => {
      //if (!(idx in this.state.open)) newState.open[idx] = false;
      //});
      //  this.setState(newState)

      return (<div className={classes.root}>
        <List className={classes.list}>
          {/* <ListSubheader component="div" className={classes.list} /> */}

          {
            contents.map((x, idx) => {
              let thisKey = (
                prefix
                ? prefix.concat([x.title])
                : [x.title])
              console.log("key:", thisKey)
              return (<List className={classes.list}>
                <ListItem button onClick={() => {
                    this.handleClick(contents, idx, thisKey);
                  }} key={thisKey} className={(
                    this.props.selected.join(".") === thisKey.join(".")
                    ? classes.selected
                    : classes.list)}>
                  <ListItemIcon className={classes.listIcon}>
                    <ArrowRight/>
                  </ListItemIcon>
                  <ListItemText inset={true} primary={x.title} classes={{primary:classes.listText}} /> {
                    x.children
                      ? (
                        this.props.open[thisKey.join(".")] != null && this.state.open[thisKey.join(".")]
                        ? (<ExpandLess className={classes.expandIcon}/>)
                        : (<ExpandMore className={classes.expandIcon}/>))
                      : ("")
                  }
                </ListItem>

                {
                  x.children
                    ? (<Collapse in={this.props.open[thisKey.join(".")]} timeout="auto" unmountOnExit={true}>
                      <NestedList classes={classes} prefix={thisKey} contents={x.children} toggleDrawer={this.props.toggleDrawer} open={this.props.open} selected={this.props.selected} workbookSelectItem={this.props.workbookSelectItem} toggleNavList={this.props.toggleNavList} openIframe={this.props.openIframe}/>
                    </Collapse>)
                    : ("")
                }
              </List>);
            })
          }
        </List>
      </div>);
    }
  }

  NestedList["propTypes"] = {
    classes: PropTypes.object.isRequired
  };

  let mapStateToProps = (state/* , ownProps */) => {
    console.log(state);
    return {contents: state.workbook.contents, open: state.navlist.expanded, selected: state.workbook.selected};
  };

  let {setWorkbookContents, workbookSelectItem, toggleNavList, openIframe,toggleDrawer} = State;
  let mapDispatchToProps = {
    setWorkbookContents,
    workbookSelectItem,
    toggleNavList,
    openIframe,
    toggleDrawer
  }

  MyNestedList = connect(mapStateToProps, mapDispatchToProps)(withStyles(style)(NestedList));
}

//===================================================================================
let AppDrawer = null;
{
  let style = theme => ({
    root: {
      height: "100%",
      backgroundColor: "white",
      overflowY: 'auto' as 'auto', //https://github.com/emotion-js/emotion/issues/1179
      position: "absolute" as "absolute",
      zIndex: 3201,
      left: 0
    },
    list: {
      width: 'auto',
      height: "100%",
      minWidth: theme.spacing.unit * 30,
      paddingBottom: theme.spacing.unit * 3,
      paddingTop: theme.spacing.unit * 2
    }
  });




  type MyPropTypes = {
    workbookSelectItem: any,
    open: any,
    toggleNavList: any,
    toggleDrawer: any,
    classes: any,
    contents:any,
    prefix:any,
    selected:any,
    openIframe: any
  }
  


  

  class MyDrawer extends React.Component<MyPropTypes,{}> {
    state = {};

    render() {
      const {classes} = this.props;

      return (<div>
        <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 3200,
            right: 0,
            opacity: 0.3,
            backgroundColor: "black"
          }} onClick={this.props.toggleDrawer}></div>

        <div className={classes.root} style={{top:0}} open={this.props.open} onClose={this.props.toggleDrawer}>

          <div className={classes.list} tabIndex={0} role="button">

            <MyNestedList />

          </div>

        </div>
      </div>);
    }
  }

  MyDrawer["propTypes"] = {
    classes: PropTypes.object.isRequired
  };

  let mapStateToProps = (state/* , ownProps */) => {
    console.log("STATE IS:", state);
    return {open: state.panels.drawer};
  };

  let {openDrawer, closeDrawer, toggleDrawer} = State;
  let mapDispatchToProps = {
    openDrawer,
    closeDrawer,
    toggleDrawer
  };

  AppDrawer = connect(mapStateToProps, mapDispatchToProps)(withStyles(style)(MyDrawer));
}

export default AppDrawer
