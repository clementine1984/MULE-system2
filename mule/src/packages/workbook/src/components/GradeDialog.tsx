
import ReactDOM from "react-dom";
/* eslint-disable react/no-multi-comp */

import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";

import PersonIcon from "@material-ui/icons/Person";
import SchoolIcon from "@material-ui/icons/School";

import CancelIcon from "@material-ui/icons/Cancel";
import Typography from "@material-ui/core/Typography";
import blue from "@material-ui/core/colors/blue";
import NumericInput from "react-numeric-input";
import { connect } from "react-redux";
import CircularProgress from '@material-ui/core/CircularProgress';
import Modal from '@material-ui/core/Modal';

import * as State from '../state'


const styles = {
  avatar: {
    backgroundColor: blue[100],
    color: blue[600]
  },
  selected: {
    backgroundColor: blue[100]
  },
  number: {
    input: { fontSize: "5em", color: "red" }
  }
};


class Spinner extends React.Component {
  render()
  {
    return (
      <div style={{ display: "flex",justifyContent: "center",zIndex:9999,position:"absolute",width:"100%",height:"100%",opacity:0.4,background:"#000000"}}><CircularProgress style={{alignSelf: "center"}}/></div>
    )
  }

}







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
  handleCancel: any


}





class SimpleDialog extends React.Component<MyProps,{}> {


  handleChange(num) {
    this.props.setGradeDialog({
      type: this.props.type,
      grade: num,
      open: this.props.open,
      id: this.props.id
    })
  }

  handleListItemClick = value => {


    console.log("Setting type to:",value)

    let g = this.props.grade;

    g = g < 0 ? 0 : g;
    g = g > 100 ? 100 : g;

    //this.props.setGradeDialog();
    if(value==null) g=null;

    this.props.handleClose({
      type: value,
      grade: g,
      open: this.props.open,
      id: this.props.id
    });
  };

  render() {
    const { classes, onClose, selectedValue/*, ...other */} = this.props;
    //  {{/*...other*/}}
    let spinner=((this.props.open==="locked")?(<Spinner />):null)
    return (
      <Dialog
        onClose={this.props.handleCancel}
        aria-labelledby="simple-dialog-title"
        open={this.props.open}
      >
      {spinner}
        <div style={{ margin: "1em" }}>
          <NumericInput
            style={{
              input: { fontSize: "1.5em", width: "100%", color:"#111111" }
            }}
            min={0}
            max={100}
            value={(this.props.grade?this.props.grade:0)}
            step={1}
            onChange={x => {
              this.handleChange(x);
            }}
            //  onBlur={()=>{console.log(this)}}
            snap
          />
        </div>
        {/* <DialogTitle id="simple-dialog-title">Set backup account</DialogTitle> */}
        <div>
          <List>
            <ListItem
              button
              onClick={() => this.handleListItemClick("ca")}
              key={"CA"}
              className={
                this.props.type === "ca" ? classes.selected : null
              }
            >
              <ListItemAvatar>
                <Avatar className={classes.avatar}>
                  <SchoolIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={"CA Grade"} />
            </ListItem>

            <ListItem
              button
              onClick={() => this.handleListItemClick("personal")}
              key={"Personal"}

              className={
                this.props.type === "personal" ? classes.selected : null
              }
            >
              <ListItemAvatar>
                <Avatar className={classes.avatar}>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={"Personal Grade"} />
            </ListItem>

            <ListItem
              button
              onClick={() => this.handleListItemClick(null)}
              className={this.props.type == null ? classes.selected : null}
            >
              <ListItemAvatar>
                <Avatar>
                  <CancelIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="No Grade" />
            </ListItem>
          </List>
        </div>
      </Dialog>
    );
  }
}

SimpleDialog["propTypes"] = {
  classes: PropTypes.object.isRequired,
  onClose: PropTypes.func,
  handleClose:  PropTypes.func
};

const SimpleDialogWrapped = withStyles(styles)(SimpleDialog);





class GradeDialog extends React.Component<MyProps,{}> {


  handleClickOpen = () => {
    let g=this.props.grade
    this.props.setGradeDialog({
      grade: g,
      type: this.props.type,
      open: true
    });
  };

/*handleClose = value => {
    console.log("state:", value);
    value["open"] = false;
    if (value["gradeType"] == null) value["grade"] = null;
    this.props.setGradeDialog(value);
    //this.setState({ gradeType: value, open: false });
  };*/

  render() {
    return (
      <div>

        <SimpleDialogWrapped
          selectedValue={this.props.type}
          open={this.props.open}
          onClose={()=>{this.props.handleClose}}
          {...this.props}
        />
      </div>
    );
  }
}


let mapStateToProps = (state /*, ownProps*/) => {
  return {
    open: state.history.gradeDialog.open,
    type: state.history.gradeDialog.type,
    grade: state.history.gradeDialog.grade,
    id: state.history.gradeDialog.id
  };
};


let { setGradeDialog }=State

let mapDispatchToProps = { setGradeDialog };

let GradeDialog2 = connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(GradeDialog));


export default GradeDialog2;
