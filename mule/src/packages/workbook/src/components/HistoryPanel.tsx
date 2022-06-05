//import { createStore, combineReducers } from "redux";

import { connect } from "react-redux";

import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";



import Button from "@material-ui/core/Button";

//import InboxIcon from "@material-ui/icons/MoveToInbox";
///import MailIcon from "@material-ui/icons/Mail";
//import Divider from "@material-ui/core/Divider";

//import CssBaseline from "@material-ui/core/CssBaseline";
import Paper from "@material-ui/core/Paper";
//import ListSubheader from "@material-ui/core/ListSubheader";
//import Avatar from "@material-ui/core/Avatar";
//import AddIcon from "@material-ui/icons/Add";
//import SearchIcon from "@material-ui/icons/Search";
//import MoreIcon from "@material-ui/icons/MoreVert";

//import DraftsIcon from "@material-ui/icons/Drafts";
//import SendIcon from "@material-ui/icons/Send";

//import StarBorder from "@material-ui/icons/StarBorder";



//import { composeWithDevTools } from 'redux-devtools-extension';

// pick utils


//import TimePicker from "material-ui-pickers/TimePicker";
//import DatePicker from "material-ui-pickers/DatePicker";





import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';




//import * as State from '../state'
import GradeDialog from './GradeDialog'
import * as State from '../state'



type MyProps = {
  setGradeDialog: any,
  type: any,
  open: any,
  id: any,
  grade: any,
  handleClose:any,
  onClose:any,
  selectedValue: any,
  classes: any,
  handleCancel: any,
  updateGrade:any,
  rows:any,
  launchEditor:any,
  dialog:any,
  rights:any,
  contents:any,
  qid: any
}



let MyTable=null

{
  const CustomTableCell = withStyles(theme => ({

  head: {
    backgroundColor: theme.palette.grey["900"],
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto' as 'auto',
  },
  title: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.common.white,
    textAlign: "center" as "center",
    fontSize: theme.typography.h6.fontSize
  },
  table: {
    minWidth: 700,
  },
  row: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
  },
});





class CustomizedTable extends React.Component<MyProps,{}> {
  static propTypes: Object = {
    classes: PropTypes.object.isRequired,
  };




  async handleClose(result)
  {
    result.open="locked";
    this.props.setGradeDialog(result);
    await this.props.updateGrade({id:result.id,type:result.type,grade:result.grade})
    this.props.setGradeDialog({open:false}); //TODO: is this the right place to close the dialog?
  }


  handleCancel()
  {
    console.log("CANCELLING")

    this.props.setGradeDialog({open:false});
    //now try and save the details
    //this.props.updateGrade({id:result.id,type:result.type,grade:result.grade})
  }






render() {


  const { classes,rows } = this.props;
  var dialog=null;
  let launchEditor=this.props.launchEditor

  if(this.props.dialog.open) dialog=(<GradeDialog handleCancel={this.handleCancel.bind(this)}            handleClose={this.handleClose.bind(this)}/>);
  console.log("PROPS in HISTORY:",this.props)



  //convert rows has to array and sort
  var order=[]
  var keys=Object.keys(rows)
  keys.forEach((k)=>{
      order.push(rows[k])
  })
  order.sort((a,b) => {return b.order-a.order });

  let isAdmin=this.props.rights.edit

  return (
    <Paper className={classes.root}>
      {dialog}
      <Table className={classes.table}>
        <TableHead className={classes.title}>
          <TableRow ><TableCell className={classes.title} colSpan={10}>Saved Attempts</TableCell></TableRow>
          <TableRow>
            <CustomTableCell>Date</CustomTableCell>
            <CustomTableCell /*numeric*/>Grade</CustomTableCell>
            <CustomTableCell /*numeric*/>Grade Type</CustomTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {order.map(row => {
          //  let row=rows[_row];
            let clickHandler=()=>{this.props.setGradeDialog({"id":row.id,"open":true,"type":row.type,"grade":row.grade})};
            let launcher=()=>{launchEditor({id:row.id})};
            return (
              <TableRow hover className={classes.row} key={row.id}>
                <CustomTableCell


                onClick={launcher} component="th" scope="row">
                  {row.created}
                </CustomTableCell>
                <CustomTableCell /*numeric*/ onClick={((isAdmin)?clickHandler:()=>{})}>{row.grade}</CustomTableCell>
                <CustomTableCell /*numeric*/ onClick={((isAdmin)?clickHandler:()=>{})}>{row.type}</CustomTableCell>

              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
}
}




  let mapStateToProps = (state /*, ownProps*/) => {
    return {
      open: state.panels.history,
      path: state.workbook.selected,
      rows: state.history.table,
      dialog: state.history.gradeDialog,
      rights: state.workbook.rights
    };
  };

  let { setGradeDialog }=State

  let mapDispatchToProps = { setGradeDialog };



  MyTable = connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(CustomizedTable));

}

//===================================================================================================================
let HistoryPanel=null

{
  let style = theme=>({
    adminPanel: {
      width: "100%",
    },
    innerDiv: {
      marginLeft: theme.spacing.unit*30
    }
  });

  class MyPanel extends React.Component<MyProps,{}> {
    static propTypes: Object = {
      // onLoad: PropTypes.func,
    };






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
        <div  >

          <Button variant="contained" style={{float: "right",marginTop:"1em",marginBottom:"1em"}} className={classes.buttonRight} /* color="accent"*/ onClick={this.props.launchEditor}>New Attempt</Button>

          <MyTable launchEditor={this.props.launchEditor} updateGrade={this.props.updateGrade}/>



        </div>

      );
    }
  }

  let { getQid }=State



  let mapStateToProps = (state /*, ownProps*/) => {
    console.log(state);
    return {
      qid: getQid(state),
      open: state.panels.history,
      path: state.workbook.selected,
    };
  };





  let mapDispatchToProps = { getQid };


  HistoryPanel = connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(style)(MyPanel));

}

export default HistoryPanel
