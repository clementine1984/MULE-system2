import * as React from 'react';
import { connect } from 'react-redux';
import {Menu, MenuItem, Menubar} from "react-desktop-menus";
import { disabledOptions } from '../store/menu/types';
import { AppState } from '../store';
import { enableItem, disableItem } from '../store/menu/actions';
import * as _ from 'lodash/string';
import { EditorBehaviour } from '../EditorBehaviour';
var fastdeepequal = require('fast-deep-equal');

interface MenuProps {
  triggerBehaviour: any,
  //disabledOptions: disabledOptions,
  enableItem: typeof enableItem,
  disableItem: typeof disableItem,
  menu: any,
  editorBehaviour:any
}

class MainMenuBar extends React.Component<MenuProps>{
  menubar: any;
  constructor(props: any){
    super(props);
    this.action = this.action.bind(this);


    function patch()
    {

      const { node } = this
      const dim = node.getBoundingClientRect()
      const subNode = this.submenu.node
  
      if (!subNode) return
  
      let left = node.offsetWidth
      let top = node.offsetTop
  
      if (dim.right + subNode.offsetWidth > window.innerWidth) left = -subNode.offsetWidth
  
      if (dim.bottom + subNode.offsetHeight > window.innerHeight) {
  
        top = node.offsetTop + node.offsetHeight - subNode.offsetHeight
  
      }
  
      //todo - this is quite hacky - tidy it up (set height based on window, for example)
      if(subNode.clientHeight>300)
      {
        top="0px"
        subNode.style["overflow-y"]="auto"
        subNode.style["max-height"]="500px"
      }
      
      this.setState({ submenuPosition : { left, top } })
  
    }

    
    MenuItem.prototype.setSubmenuPosition=patch 

    //console.log(MenuItem)
  }



 
  








  action = (action: string) => () => {
    this.dispatch(action);
  }

  async dispatch(action: string){
    await this.props.editorBehaviour.trigger(action)
   
    this.menubar.close()
  }


  //only update if the menu has changed
  shouldComponentUpdate(nextProps, nextState) {
    return !fastdeepequal(nextProps.menu,this.props.menu)
  }



  generateMenuItems(items: any[]){
    return items.map((item) => {
      //console.log("Adding2 ",item.name)
      //key={item.name}

      let submenu;

      if(item.children)
      {
        submenu=<Menu style={{ul:{maxHeight:"500px"}}} >
          { this.generateMenuItems(item.children) }
        </Menu>
      }

      var core=this.props.editorBehaviour.core
      const theme = core.make('osjs/theme');

      var menuitem=<MenuItem
      action={this.action(item.action)}
      label={item.name}
        disabled={!item.enabled} 
        icon={ (item.themeIcon? <img src = { theme.icon(item.themeIcon)} />:null) }
        key={item.name}
        
        >
        { submenu }
        </MenuItem>
 
      //console.log(menuitem)
      return (menuitem)
          
        
      
    })
  }


  generateMenuBar(items: any[]){
    return items.map((item) => {
      var submenu=this.generateMenuItems(item.children)
      //console.log(submenu)
      return (
            <Menu label={item.name} style={{zIndex: "10000",maxHeight:"500px"}} key={item.name} disabled={!item.enabled} >
              {submenu}
            </Menu>
      )
    })
  }


  render(){
    return (
      <Menubar ref={ elmt => this.menubar = elmt } 
      style={{
        border: "1px solid #eee",
        zIndex: "100000"
      }}>    
      {this.generateMenuBar(this.props.menu)}
      </Menubar>
    )
  }
}

const mapStateToProps = (store: AppState) => {
  return{
    //disabledOptions: store.menuReducer.disabledOptions,
    menu: store.menuReducer.menu
  }
}

export default connect(
  mapStateToProps,
  {
    enableItem,
    disableItem
  }
)(MainMenuBar);
