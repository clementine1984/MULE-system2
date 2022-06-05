
import React from "react";

import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";




import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import AppBar  from "@material-ui/core/AppBar";
import { connect } from "react-redux";

import * as State from '../state'



let styles = {
  root: {
    flexGrow: 1,
  },
  grow: {
    flexGrow: 1
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
    color:"white"
  }
};





type ButtonAppBarProps = {
  classes: any,
  toggleDrawer: any,
  openIframe: any,
  qid: any,
  launchEditor: any,
  openHistory:any,
  rights:any,
  openAdmin:any
}






class ButtonAppBar extends React.Component<ButtonAppBarProps,{}>{
  static propTypes: Object = {
    // onLoad: PropTypes.func,
  };

  render() {

    const { classes } = this.props;

    const StyledButton = withStyles({
  root: {
    color: 'white'
  },
  disabled:{
    color: 'white',
    opacity:0.2
  }
})(Button);






  return (
    <div className={classes.root}>

      <AppBar position="static">
        <Toolbar>
          <IconButton
            className={classes.menuButton}
            style={{color:"white"}}
            aria-label="Menu"
            onClick={this.props.toggleDrawer}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h5" color="inherit" className={classes.grow}>
            Workbook
          </Typography>
          { <StyledButton onClick={this.props.openIframe}><Typography variant="subtitle2" style={{color:"white"}} >Description</Typography></StyledButton> }
          { <StyledButton disabled={this.props.qid==null} onClick={()=>{ this.props.launchEditor({id:State.getMostRecentAttempt()})}}><Typography variant="subtitle2"  style={{color:"white"}} >Launch</Typography></StyledButton> }
          { <StyledButton disabled={this.props.qid==null} onClick={this.props.openHistory}><Typography variant="subtitle2"  style={{color:"white"}} >History</Typography></StyledButton> }
          { ((this.props.rights.edit===true)?(<StyledButton onClick={this.props.openAdmin}><Typography variant="subtitle2"  style={{color:"white"}} >Admin</Typography></StyledButton>):null) }
        </Toolbar>
      </AppBar>
    </div>
  );
  }
}





ButtonAppBar.propTypes = {
  classes: PropTypes.object.isRequired
};

let { openDrawer, closeDrawer, toggleDrawer,openAdmin,openHistory,openIframe,getQid }=State

let mapStateToProps = (state /*, ownProps*/) => {
  return {
    qid: getQid(state),
    rights: state.workbook.rights
  };
};




let mapDispatchToProps = { openDrawer, closeDrawer, toggleDrawer,openAdmin,openHistory,openIframe, getQid };
const MyAppBar = connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(ButtonAppBar));

export default MyAppBar
