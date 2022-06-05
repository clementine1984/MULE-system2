
import React from "react";

import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import AppBar  from "@material-ui/core/AppBar";
import { connect } from "react-redux";




  let style = theme => ({
    text: {
      paddingTop: theme.spacing.unit * 2,
      paddingLeft: theme.spacing.unit * 2,
      paddingRight: theme.spacing.unit * 2
    },
    appBarWarning: {
      top: "auto",
      bottom: 0,
      backgroundColor: theme.palette.secondary.dark
    },
    appBar: {
      top: "auto",
      bottom: 0

    },
    toolbar: {
      alignItems: "center",
      justifyContent: "space-between",

    },
    typography:
    {
      fontSize: theme.typography.h6.fontSize
    },
    username:
    {

    }
  });



  function displayBest(type,table)
  {
    var best=-1;
    Object.keys(table).map((x)=>
    {
      if(table[x].type===type)
      {
        if(table[x].grade>best) best=table[x].grade
      }
    })
    if(best!=-1) return best+"%"
    else return null
  }



  function BottomAppBar(props) {
    const { classes } = props;
    let bestCA=displayBest("ca",props.table)
    if(bestCA!=null) bestCA="CA: "+bestCA
    let bestPersonal=displayBest("personal",props.table)
    if(bestPersonal!=null) bestPersonal="Personal Best: "+bestPersonal
    return (
      <React.Fragment>
        <AppBar position="relative" /*"inherit"*/ color="primary" className={(props.selectedUser!==""? classes.appBarWarning:classes.appBar)}>
          <Toolbar className={classes.toolbar}>
            {/* <IconButton color="inherit" aria-label="Open drawer">
            <MenuIcon />
          </IconButton> */}
            <Typography color="inherit" className={classes.typography} >{bestCA}</Typography>
            <Typography color="inherit" className={classes.typography}>{props.selectedUser.username}</Typography>
            <Typography color="inherit" className={classes.typography}>{bestPersonal}</Typography>
          </Toolbar>
        </AppBar>
      </React.Fragment>
    );
  }

  BottomAppBar.propTypes = {
    classes: PropTypes.object.isRequired
  };


  let mapStateToProps = (state /*, ownProps*/) => {
    return {
      selectedUser: state.workbook.selectedUser,
      bestCA: state.workbook.bestCA,
      bestPersonal: state.workbook.bestPersonal,
      table: state.history.table
    };
  };

  let mapDispatchToProps = {  };



const  AppBottomBar = connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(style)(BottomAppBar));

export default AppBottomBar
