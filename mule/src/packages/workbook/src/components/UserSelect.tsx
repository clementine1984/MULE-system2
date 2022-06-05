//import { createStore, combineReducers } from "redux";

import { connect } from "react-redux";

import React from "react";

import { withStyles } from "@material-ui/core/styles";



import ReactAutocomplete from "react-autocomplete";
//import { composeWithDevTools } from 'redux-devtools-extension';






import * as State from '../state'









let DropDown=null

{



  let style = theme=>({
    root: {}
  });



  let menuStyle = {

      borderRadius: "3px",
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
      background: 'rgba(255, 255, 255, 0.9)',
      padding: '2px 0',
      fontSize: '90%',
      left: '0px',
      top: '0px',
      position: 'relative',
      overflow: 'auto',
      maxHeight: '50%', // TODO: don't cheat, let it flow to the bottom
      zIndex: 9999 //clear other panels
  };

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
    items: any,
    value: any,
    selectUser:any
  }
  
  type MyState=
  {
    value:any
  }
  

  class MyInput extends React.Component<MyProps,MyState> {

  constructor (props) {
    super(props)
    this.state = {
        value:""//props.value
    }
  }
  /*static getDerivedStateFromProps(props, state){
    return {
        value:""//props.value
    }

  }*/

  render() {
    const { classes } = this.props;
    console.log("ITEMS:",this.props.items);
    var items=Object.values(this.props.items)




    return (

      <ReactAutocomplete
        className={classes.root}
        dataSelected={this.props.value}
        items={items}
        shouldItemRender={(item, value) => item.username.toLowerCase().indexOf(value.toLowerCase()) > -1}
        getItemValue={item => item.username}
        menuStyle={menuStyle}
        renderItem={(item, highlighted) =>
          <div
            key={item.id}
            style={{ backgroundColor: highlighted ? '#eee' : 'transparent'}}
          >
            {item.username}
          </div>
        }
        value={this.state.value}
        onChange={e => { this.setState({ value: e.target.value }) }}
        onSelect={value=>{
          this.setState({ value });

          var obj=items.find((o)=>{return o["username"]===value})
          console.log("SETTING USER TO ",obj)

          this.props.selectUser(obj)}
        }
      />

    )
  }
}


  let mapStateToProps = (state /*, ownProps*/) => {
    console.log(state);
    return {
      open: state.panels.history,
      path: state.workbook.selected,
      //value: state.workbook.selectedUser.username,
      items: state.workbook.users
    };
  };

  let {selectUser}=State;
  let mapDispatchToProps = { selectUser };

  DropDown = connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(style)(MyInput));

}

export default DropDown
