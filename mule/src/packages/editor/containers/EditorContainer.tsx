import * as React from 'react';
import { connect } from 'react-redux';
import MonacoEditor from 'react-monaco-editor';
//import '@convergencelabs/monaco-collab-ext/css/monaco-collab-ext.min.css';
import { EditorBroadcast } from '../editorBroadcast';
//import { initEditorBroadcastListeners } from '../editorUtils';
import { stopRecording, setEditorContent, setLang, addModel, setTab, setTheme } from '../store/editor/actions';
import { AppState } from '../store';
import { EditorState } from '../store/editor/types';
var MyEditor=require("./MyEditor.jsx").default
import store from '../store';
import {  Tabs, Tab  } from '@material-ui/core';




interface EditorProps {
  broadcast: any,
  setLang: typeof setLang,
  setTheme: typeof setTheme,
  setTab: typeof setTab,
  stopRecording: typeof stopRecording,
  setEditorContent: typeof setEditorContent,
  addModel: typeof addModel,
  editor: EditorState,
  logger: any,
  triggerBehaviour: any,
  editorBehaviour:any
}








//var monokai=require('monaco-themes/themes/Monokai.json')













class Editor extends React.Component<EditorProps> {
  constructor(props: any) {
    super(props); 

    this.editorDidMount = this.editorDidMount.bind(this);
    this.handleEditorChange = this.handleEditorChange.bind(this);
  }

  editorDidMount(monaco: any, editor: any) {
    this.props.editorBehaviour.setEditor(editor)

    const model = editor.getModel();
    model.onDidChangeContent(() => {
      this.props.triggerBehaviour.edit();
    })
    this.props.addModel(model, model.getAlternativeVersionId());

    // console.log('layout info', editor.getLayoutInfo());
    // console.log('tippity top', editor.getTopForLineNumber(4));

    // Remove all /** comments from editor
    const editorContent = model.getLinesContent().join('\n');
    this.props.setEditorContent(editorContent.replace(/(\/\*\*[^*]*\*\/)/g, ''));


    console.log("PROPS ARE:",this.props)




    {
      var context = require["context"]('monaco-themes/themes/', true, /\.(json)$/);
      var files={};
    
    
    
      context.keys().forEach((filename)=>{
        var key=filename
        if(key.startsWith("./")) key=key.substring(2)
        files[key] = context(filename);
    
    
    
    
    
    
    
      });
    
      var themeList=files["themelist.json"]
      delete files["themelist.json"]
    
    
      Object.keys(themeList).forEach((tname)=>
    {
      monaco.editor.defineTheme(tname, files[themeList[tname]+".json"]);
    })
    
      //Add in the theme names for the default themes
      var builtIn={
        "vs":"Visual Studio",
        "vs-dark": "Visual Studio Dark",
        "hc-black": "HC Black",
      }
    
    var themeArray=[]

    Object.keys(builtIn).forEach((k)=>
    {
      //console.log("!!!!!!!!!!!!!!!!-")
      //console.log(k);
      themeList[k]=builtIn[k]
      
    })
    
    Object.keys(themeList).forEach(k=>{
      themeArray.push({name:themeList[k],value:k})
    })

    

    console.log(themeArray);
    console.log("Loaded themes")
    this.props.editorBehaviour.setThemes(themeArray) 
    /*if(this.props.editor.theme=="")
    {
      this.props.editor.theme="vs"
    }*/
    
      /*if(key!="themelist.json")
      {
        console.log(key)
        monaco.editor.defineTheme(key, files[key]);
      }*/
    }



    //setInterval(()=>{ console.log(monaco.editor); monaco.editor.setTheme("dark")},2000)


















    //initEditorBroadcastListeners(editor, this.props.broadcast, this.props.peerId); //TODO: re-enable 
    editor.focus();
    EditorBroadcast.setSelection = (startLine, startColum, endLine, endColumn) => {
      editor.setSelection(new monaco.Range(startLine , startColum, endLine, endColumn));
    }

    monaco.editor.setTheme(this.props.editor.theme);

  }

  handleEditorChange(newValue: string){


    console.log(this.editorRef)


    this.props.setEditorContent(newValue);
  }

 /* componentDidUpdate(oldProps) {
    console.log("OLD STATE!!!!!!!!!!!!!!",oldProps,this.props)
    const newProps = this.props
    if(oldProps.editorBehaviour.title !== newProps.editorBehaviour.title) {
      this.setState({})
    }
  }*/



  componentWillUnmount(){
    const editorContent = EditorBroadcast.getData();
    this.props.stopRecording(editorContent);
  }

  private editorRef = React.createRef<MonacoEditor>();

  render() {
    const options = {
      selectOnLineNumbers: true,
      minimap: { enabled: false },
        automaticLayout: true,
        wordBasedSuggestions: false,
        quickSuggestions: false,
        contextmenu: false,
        theme: this.props.editor.theme//,
      // language: "java"
    };
    const style: React.CSSProperties = {
      //float: 'left'
      width:"100%",
      height: "100%"
    }

    const didLoad = () => {
      console.log("DidLoad");
    };
    
    const didMount = editor => {
      console.log("DidMount", editor);
    };





    //var selectedTab=0

    const handleChange = (event, newValue) => {
      this.props.setTab(newValue);
    };

    //TODO: this isn't nice. userFiles only exists in workbook mode
    var tabs=this.props.editorBehaviour.getEditorFilenames()
  
    //if(tabs==null) tabs=["editor"]

    



    return ( 
      <div style={style}>
        {/* Only render tabs if more than one */}
        { ((tabs.length>0)? <Tabs value={this.props.editor.activeTab} onChange={handleChange} >
        { tabs.map(t=><Tab label={t} style={{ textTransform:"none" }} />)}
        </Tabs> : null) } 
        <MyEditor
        didLoad={didLoad} didMount={this.editorDidMount}
        editorBehaviour={this.props.editorBehaviour}
          //ref={this.editorRef}
         // width="100%"
         // height="100%"
          language={this.props.editor.lang}
          theme={this.props.editor.theme}
          tabs={tabs}
          activeTab={this.props.editor.activeTab}
          ///value={this.props.editor.code}
         // onChange={this.handleEditorChange}
          options={options}
         // editorDidMount={this.editorDidMount}
        />
      </div>
    );
  }
}

const mapStateToProps = (store: AppState) => {
  return{
    editor: store.editorReducer
  }
}

export default connect(
  mapStateToProps,
  {
    stopRecording,
    setEditorContent,
    setLang,
    addModel,
    setTab,
    setTheme
  }
)(Editor);
