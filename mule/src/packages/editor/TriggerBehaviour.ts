import store from './store';
import { enableItem, disableItem } from './store/menu/actions';

class TriggerBehaviour {
  core: any
  editorBehaviour: any;

  constructor(core: any, editorBehaviour: any){
    this.core = core;
    this.editorBehaviour = editorBehaviour;
  }

  // enables/disables menu options
  applyOptions(options: any){
    console.log("******************", options)

    //clear the disabled state
    // store.dispatch(resetMenu());

    for (let item of Object.keys(options)) {
      console.log('item', item);
      options[item] === false ?
        store.dispatch(disableItem(item)) :
        store.dispatch(enableItem(item));
    }
  }

  edit(){
    this.editorBehaviour.stateChange("EDITED", this.applyOptions);
  }

  async save(){
    await this.editorBehaviour.saveBehaviour();
    const models = store.getState().editorReducer.models;
    models.forEach( ( model: any ) => {
      // AlternativeVersionId is a number made my monaco which increments
      // every time a change is made in the editor
      model.lastSavedVersionId = model.model.getAlternativeVersionId();
    })
    this.editorBehaviour.stateChange("SAVED", this.applyOptions);
  }

  // checks for unsaved changes in editor
  isDirty(){
    return new Promise((resolve, reject) => {
      const models = store.getState().editorReducer.models;
      models.forEach( ( model: any ) => {
        console.log('model', model);
        console.log('lastSavedVersionId', model.lastSavedVersionId);
        console.log('AlternativeVersionId', model.model.getAlternativeVersionId());
        if(model.lastSavedVersionId !== model.model.getAlternativeVersionId())
          resolve(true);
      })
      resolve(false);
    })
  }

  async compile(){
    try {
      const editorState = store.getState().editorReducer;
      const socket = await this.editorBehaviour.compileBehaviour(editorState.code, editorState.lang);

      socket.onmessage = (d) => {
        console.log(d.data);
        const gradeExtractor = /^compiled\:\s\=\=\>\strue$/gm
        const match = gradeExtractor.exec(d.data);
        console.log(match);
        if (match != null)
          this.editorBehaviour.stateChange('COMPILED', this.applyOptions);
      };
      this.core.run('terminal', {
        'interactiveCheck': false,
        'WebSocket': socket,
        'function': 'Compile',
        'Title': 'Compile'
      });
    } catch (err) {
      console.log(err);
      alert("compile:" + err);
    }
  }

  async run(){
    console.log('run');
    try{
      const editorState = store.getState().editorReducer;
      const socket = await this.editorBehaviour.runBehaviour(editorState.code, editorState.lang);
      this.core.run('terminal', {
        'interactiveCheck': false,
        'WebSocket': socket,
        'function': 'Run',
        'Title': 'Run'
      });
      this.editorBehaviour.stateChange('RAN', this.applyOptions);
    } catch (err) {
      console.log(err);
      alert("run: " + err);
    }
  }

  async evaluate(){
    console.log('eval');
    const socket = await this.editorBehaviour.evaluateBehaviour();
    try {
      //TODO: urgent -check if success
      this.editorBehaviour.stateChange('EVALUATED', this.applyOptions);
    } catch (err) {
      alert("eval:" + err);
      console.log(err);
    }
  }
}

export default TriggerBehaviour;
