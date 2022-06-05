//import { createStore, combineReducers } from "redux";
import { connect } from "react-redux";
import React from "react";
import { withStyles } from "@material-ui/core/styles";

import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";


import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';



import * as State from '../state'
import DateTimePick from "./DateTimePick"
import UserSelect from "./UserSelect"
import { any } from "prop-types";






let AdminPanel=null

{
  let style = theme=>({
    root: {
      paddingLeft:0,
      left:0,
      border: "0",
      width: "100%",
      height:"100%",
      margin: 0
    },
    heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  buttonRight: {
    marginLeft: theme.spacing.unit*2
  },
  expansionPanel: {expanded: { margin:'0 0' }}
  });



/*

  class panelItem extends React.Component {
    render(
      <ExpansionPanel expanded={expanded === {this.props.key}} >
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className={classes.heading}>{heading}</Typography>
          <Typography className={classes.secondaryHeading}>{secondaryHeading}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Typography>
            {details}
          </Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    )
  }




*/




  type MyPanelProps = {
  compileWorkbook: any,
  open: any,
  path: any,
  classes: any,
  downloadGrades: any,
  selectUser:any

}


  class MyPanel extends React.Component<MyPanelProps,{}> {
  state = {
    expanded: null,
  };

  handleChange = panel => (event, expanded) => {
    this.setState({
      expanded: expanded ? panel : false,
    });
  };

  render() {
    if(!this.props.open) return null;

    const { classes } = this.props;
    const { expanded } = this.state;



    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",this.props)





    return (
      <div className={classes.root}>
        <ExpansionPanel style={{margin:'0 0'}} expanded={expanded === 'panel0'} onChange={this.handleChange('panel0')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.heading}>Compile Workbook</Typography>
            <Typography className={classes.secondaryHeading}>(re)Compile Workbook</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{flexDirection: 'column'}}>
          <Toolbar style={{alignItems: "center",justifyContent: "space-between",paddingLeft:0,paddingRight:0}}>
            <Button onClick={this.props.compileWorkbook} variant="contained" className={classes.buttonRight} /*color="accent"*/>(re)Compile</Button>
            </Toolbar>
            <Typography style={{textAlign:"center",display: 'block',marginTop:"1em",fontSize:"0.8em",fontStyle: "italic"}}>You may need to restart the workbook after compilation</Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel style={{margin:'0 0'}} expanded={expanded === 'panel1'} onChange={this.handleChange('panel1')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.heading}>Download CA Grades</Typography>
            <Typography className={classes.secondaryHeading}>Get CA grades for the currently selected branch</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{flexDirection: 'column'}}>
          <Toolbar style={{alignItems: "center",justifyContent: "space-between",paddingLeft:0,paddingRight:0}}>
            <Typography style={{display: 'block'}}>
              Current branch is: {this.props.path.join("/")}
            </Typography >
            <Button onClick={()=>{this.props.downloadGrades('ca')}}  variant="contained" className={classes.buttonRight} /* color="accent"*/>Download</Button>
            </Toolbar>
            <Typography style={{textAlign:"center",display: 'block',marginTop:"1em",fontSize:"0.8em",fontStyle: "italic"}}>You can change the current path with the navigation drawer. If you select a user, only the grades for that user are downloaded.</Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>


        <ExpansionPanel style={{margin:'0 0'}} expanded={expanded === 'panel2'} onChange={this.handleChange('panel2')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.heading}>Download Personal Grades</Typography>
            <Typography className={classes.secondaryHeading}>Get grades for the currently selected branch</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{flexDirection: 'column'}}>
          <Toolbar style={{alignItems: "center",justifyContent: "space-between",paddingLeft:0,paddingRight:0}}>
            <Typography style={{display: 'block'}}>
              Current branch is: {this.props.path.join("/")}
            </Typography >
            <Button onClick={()=>{this.props.downloadGrades('personal')}}  variant="contained" className={classes.buttonRight} /* color="accent"*/>Download</Button>
            </Toolbar>
            <Typography style={{textAlign:"center",display: 'block',marginTop:"1em",fontSize:"0.8em",fontStyle: "italic"}}>You can change the current path with the navigation drawer. If you select a user, only the grades for that user are downloaded.</Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>



        

        <ExpansionPanel style={{margin:'0 0'}} expanded={expanded === 'panel3'} onChange={this.handleChange('panel3')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.heading}>Users</Typography>
            <Typography className={classes.secondaryHeading}>
              Become a user (for exploring workbook entries)
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{flexDirection: 'column'}}>
            <Toolbar style={{alignItems: "center",justifyContent: "space-between",paddingLeft:0,paddingRight:0}}>
            <Typography component={'div'}>
              Choose a user to become: &nbsp; <UserSelect /></Typography>

            <Button variant="contained" className={classes.buttonRight} /* color="accent" */ onClick={ ()=>{this.props.selectUser("")} }>Revert</Button></Toolbar>
            <Typography style={{textAlign:"center",display: 'block',marginTop:"1em",fontSize:"0.8em",fontStyle: "italic"}}>You can then navigate to the student history and make changes.</Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel style={{margin:'0 0'}} expanded={expanded === 'panel4'} onChange={this.handleChange('panel4')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.heading}>Re-Evaluate All</Typography>
            <Typography className={classes.secondaryHeading}>
              Regrade previously graded programs in the current branch
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{flexDirection: 'column'}}>
            <Toolbar style={{alignItems: "center",justifyContent: "space-between",paddingLeft:0,paddingRight:0}}>
              <Typography component={'div'}>
              Current branch is: {this.props.path.join("/")}<br /><br />
              Regrade attempts from: <DateTimePick /> To: <DateTimePick />
            </Typography><br/>
            <Button variant="contained" className={classes.buttonRight} /* color="accent"*/>re-evaluate</Button></Toolbar>
            <Typography style={{textAlign:"center",display: 'block',marginTop:"1em",fontSize:"0.8em",fontStyle: "italic"}}>Only atempts which have previously been graded will be regraded.</Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel style={{margin:'0 0'}} expanded={expanded === 'panel5'} onChange={this.handleChange('panel5')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.heading}>Auto Evaluate</Typography>
            <Typography className={classes.secondaryHeading}>
              Evaluate saved attempts which have not yet been evaluated
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{flexDirection: 'column'}}>
          <Toolbar style={{alignItems: "center",justifyContent: "space-between",paddingLeft:0,paddingRight:0}}>
            <Typography component={'div'}>
            Current branch is: {this.props.path.join("/")}<br /><br />
            Auto Evaluate last ungraded attempt from: <DateTimePick /> To: <DateTimePick />
            </Typography>
            <Button variant="contained" className={classes.buttonRight} /* color="accent"*/>auto-grade</Button></Toolbar>
            <Typography style={{textAlign:"center",display: 'block',marginTop:"1em",fontSize:"0.8em",fontStyle: "italic"}}>Only the last saved, ungraded attempt in the range will be evaluated.</Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    );
  }
}

  let mapStateToProps = (state /*, ownProps*/) => {
    console.log(state);
    return {
      open: state.panels.admin,
      path: state.workbook.selected,
    };
  };
  let {selectUser}=State;
  let mapDispatchToProps = { selectUser };

  AdminPanel = connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(style)(MyPanel));

}

export default AdminPanel
