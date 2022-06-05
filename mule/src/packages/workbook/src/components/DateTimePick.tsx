//import { createStore, combineReducers } from "redux";

import { connect } from "react-redux";

import React from "react";

import { withStyles } from "@material-ui/core/styles";

//import MuiPickersUtilsProvider from 'material-ui-pickers/MuiPickersUtilsProvider';
//import DateFnsUtils from 'material-ui-pickers/utils/date-fns-utils';
import DateFnsUtils from "@date-io/date-fns"; 
import {
  DatePicker,
  TimePicker,
  DateTimePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";







//import * as State from '../state'



let DatePick=null

{
  let style = theme=>({
    root: {top: "-6px"} //the material-ui theme pushes the component down by 6px, so we reverse it here
  });







  type MyProps = {
    classes: any
  }




  class MyPanel extends React.Component<MyProps,{}> {
  state = {
    selectedDate: new Date(),
  }

  handleDateChange = (date) => {
    this.setState({ selectedDate: date });
  }

  render() {
    const { selectedDate } = this.state;
    const { classes } = this.props;
    return (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <DateTimePicker
          value={selectedDate}
          onChange={this.handleDateChange}
          className={classes.root}
        />
      </MuiPickersUtilsProvider>
    );
  }
}

  let mapStateToProps = (state /*, ownProps*/) => {
    return {
      open: state.panels.history,
      path: state.workbook.selected,
    };
  };

  let mapDispatchToProps = {  };

  DatePick = connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(style)(MyPanel));

}

export default DatePick
