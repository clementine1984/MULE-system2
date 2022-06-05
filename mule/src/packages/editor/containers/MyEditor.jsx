import React, { Component } from "react";
import PropTypes from "prop-types";
import { updatePartiallyEmittedExpression } from "typescript";

class MyEditor extends React.Component {

  // @todo: Use typescript to handle propTypes via monaco.d.ts
  // (https://github.com/Microsoft/monaco-editor/blob/master/monaco.d.ts):
  static propTypes = {
    // Styles props:
    style: PropTypes.object,
    className: PropTypes.string,
    height: PropTypes.string,
    width: PropTypes.number,

    // Preferences props:
    language: PropTypes.string,
    theme: PropTypes.string,
    options: PropTypes.any,
    // theme: PropTypes.oneOf([
    //   'vs',
    //   'vs-dark',
    //   'hc-black'
    // ]),

    // Lifecycle props:
    didLoad: PropTypes.func,
    didMount: PropTypes.func
  };
  static defaultProps = {
    // width: 600, // auto
    height: "100%",
    //language: "javascript",
    theme: "vs-dark",
    didLoad: () => {},
    didMount: () => {}
  };

  componentDidMount() {
    this.handleLoad();
  }

  containerDidMount = ref => {
    this.ref = ref;
  };

  handleLoad() {
    // @note: safe to not check typeof window since it'll call on componentDidMount lifecycle:
    if (!window.require) {
      const loaderScript = window.document.createElement("script");
      loaderScript.type = "text/javascript";
      // @note: Due to the way AMD is being used by Monaco, there is currently no graceful way to integrate Monaco into webpack (cf. https://github.com/Microsoft/monaco-editor/issues/18):
      loaderScript.src = "/apps/editor/monaco-editor/min/vs/loader.js";
      loaderScript.addEventListener("load", this.didLoad);
      window.document.body.appendChild(loaderScript);
    } else {
      this.didLoad();
    }
  }
  //https://github.com/react-monaco-editor/react-monaco-editor/blob/master/src/editor.js
  componentDidUpdate(prevProps) {
    const editor = this.editor;
    const { value, language, theme, height, options, width } = this.props;
    var rerender=false

    //console.log("#################@@@#############",this)
   ////console.log("#################",prevProps)
   // console.log(this)
    const model = editor.getModel();

    if (this.props.value != null && this.props.value !==model.getValue()) 
    {
      this.__prevent_trigger_change_event = true;
      this.editor.pushUndoStop();
      model.pushEditOperations([],[{
            range: model.getFullModelRange(),
            text: value
          }]);
      this.editor.pushUndoStop();
      this.__prevent_trigger_change_event = false;
      rerender=true
    }
    
    //if (prevProps.theme !== theme) {
      //console.log("SETTING THEME TO:",theme)
      monaco.editor.setTheme(theme);
    //}






    if (editor && (width !== prevProps.width || height !== prevProps.height)) {
      editor.layout();
      rerender=true
    }
    if (prevProps.options !== options) {
      editor.updateOptions(options);
      rerender=true
    }

    if (prevProps.language !== language) {
      monaco.editor.setModelLanguage(model, language);
    }


    return rerender

  }







  handleMount() {


 


    //console.log("##############################",this.props)


    const { language, value, options, theme } =this.props

    //console.log("THEME",theme)

    var mytheme=(theme ? theme : "vs-dark")




    this.editor = window.monaco.editor.create(this.ref, {
      value,
      language,
      theme:mytheme,
      model: null,
      ...options
      
    });


    this.props.editorBehaviour.createModels()
    this.models=this.props.editorBehaviour.getModels()

    /*this.models=[]
    var editorFiles=[]
    for(var i of this.props.tabs)
    {
      var m=window["monaco"].editor.createModel(i)
      this.models.push(m)
      editorFiles.push(new editorFiles({

      }))
    }*/


    var ed=this.editor
    this.editor.setModel(window["monaco"].editor.createModel("dummy"))

    //this.props.editorBehaviour.models=this.models

    //this.props.editorBehaviour.editorFiles=editorFiles


    //this.editor.onDidPaste(this.props.editorBehaviour.onPaste.bind(this.props.editorBehaviour))

    /*this.editor.onDidCopy((e)=>
    {
      alert("COPY!")
    })*/

   //window.monaco.editor.setTheme(mytheme)

   this.props.editorBehaviour.setEditor(this.editor)
    this.didMount(this.editor);

    return this.editor;
  }

  didMount = editor => {
    //console.log("DID MOUNT")
    const { didMount } = this.props;


  


    didMount(window.monaco,editor);
  };

  didLoad = e => {
    const { didLoad } = this.props;
    window.require.config({
      //paths: { vs: "/apps/editor/monaco-editor/dev/vs" } TODO: use this for dev mode
      paths: { vs: "/apps/editor/monaco-editor/min/vs" } //TODO: use this for prod mode

    });
    
    window.require(["vs/editor/editor.main"], () => {
      this.handleMount();
    });

    didLoad();

    if (e) {
      e.target.removeEventListener("load", this.didLoad);
    }
  };




  shouldComponentUpdate()
  {
    //console.log("SHOULD?")
    //console.log(this.models)
    return (this.editor!=null)
  }





  render() {

   // console.log("RERENDERING!")
   // console.log(window.monaco)
    if((this.editor)&&(!this.models[this.props.activeTab]._isDisposed))
    {
    //  console.log("Setting model to:",this.props.activeTab,this.props.tabs,this.models)
      this.editor.setModel(this.models[this.props.activeTab])
    }
    

    const { className, style, width, height } = this.props;

    return (
      <div
        ref={this.containerDidMount}
        className={className}
        style={{
          height,
          width,
          ...style
        }}
      />
    );
  }
}

export default MyEditor;
