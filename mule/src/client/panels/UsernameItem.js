import {PanelItem} from '@osjs/panels';
import {h} from 'hyperapp';

export class UsernameItem extends PanelItem {

  // You can set your own state and actions by overriding the init method
  init() {
    super.init({
      // State
    }, {
      // Actions
    })
  }

  // Renders the interface
  render(state, actions) {
    var user=this.core.make('osjs/auth').user().username
    //console.log("USER:",user)
    return super.render('username-item', [
      h('span', {style:{"fontSize":"1.1em"}},user )
    ]);
  }
}