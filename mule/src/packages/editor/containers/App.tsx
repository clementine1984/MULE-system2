import * as React from 'react';
import * as Peer from 'peerjs';
import { connect } from 'react-redux';
import axios from 'axios';
import Editor from './EditorContainer';
import CommentsContainer from './CommentsContainer';
import MainMenuBar from './MainMenuBar';
import PeerConnectForm from '../components/PeerConnectForm';
import PlaybackForm from '../components/PlaybackForm';
import { EditorBroadcast } from '../editorBroadcast';
import { startRecording, setTargetId, setPlaybackSpeed,setTheme } from '../store/editor/actions';
import { EditorState } from '../store/editor/types';
import { AppState } from '../store';
import { Operation, OperationType } from '../operation';
import { EditorBehaviour } from '../EditorBehaviour';
import CircularProgress from '@material-ui/core/CircularProgress';
import CssBaseline from '@material-ui/core/CssBaseline';

class Spinner extends React.Component {
  render()
  {
    return (
      <div style={{ display: "flex",pointerEvents: "none",justifyContent: "center",zIndex:99999,position:"absolute",width:"100%",height:"100%",opacity:0.6,background:"#FFFFFF"}}><CircularProgress style={{alignSelf: "center"}}/></div>
    )
  }

}
interface AppProps {
  logger: any,
  menu: any,
  locked: boolean,
  triggerBehaviour: any,
  startRecording: typeof startRecording,
  setTargetId: typeof setTargetId,
  setPlaybackSpeed: typeof setPlaybackSpeed,
  editor: EditorState,
  editorBehaviour:any
}

class App extends React.Component<AppProps>{
  constructor(props:any){
    super(props);

    this.recordSession = this.recordSession.bind(this);
    this.replaySession = this.replaySession.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleIdChange = this.handleIdChange.bind(this);
    this.handlePlaybackChange = this.handlePlaybackChange.bind(this);
    this.broadcast = this.broadcast.bind(this);
    
  }
  recordSession(){
    const editorContent = EditorBroadcast.getData();
    this.props.startRecording(editorContent);
  }

  // TODO: move this to an action
  async replaySession(){
    const initState = await axios.get('http://localhost:3000/initState');
    EditorBroadcast.setData(initState.data.code);

    const res = await axios.get('http://localhost:3000/ops');

    for( let i = 0; i < res.data.length; i++){
      if(i > 0){
        const delay: number = res.data[i].time - res.data[i-1].time;
        await this.timeout(Math.round(delay / this.props.editor.playbackSpeed));
      }
      EditorBroadcast.performOp(res.data[i]);
    }
  }

  timeout(delay: number){
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  broadcast(op: Operation){
    console.log('op', op);
    if(this.props.editor.recording) {
      // axios.post('http://localhost:3000/ops', {
      //   ...op,
      //   localEdit: false,
      //   time: new Date().getTime()
      // });
      this.props.logger.log({...op, remoteEdit: false});
    }
  }
  handleIdChange(event: React.FormEvent<HTMLInputElement>){
    this.props.setTargetId(event.currentTarget.value);
  }

  handlePlaybackChange(event: React.FormEvent<HTMLInputElement>){
    this.props.setPlaybackSpeed(parseFloat(event.currentTarget.value));
  }

  handleSubmit(event: React.FormEvent<HTMLInputElement>){
    event.preventDefault();
  }

  /*  /> */

  render(){
    let spinner=((this.props.locked)?(<Spinner />):null)
   
    return(
      <React.Fragment>
      <CssBaseline />
      <div style={{height:"100%"}}>
         {spinner}
        <MainMenuBar editorBehaviour={this.props.editorBehaviour} triggerBehaviour={this.props.triggerBehaviour}/>
        {/*<PeerConnectForm
          handleSubmit={this.handleSubmit}
          handleIdChange={this.handleIdChange}
          targetID={this.props.editor.targetID}
        />*/}
        {/*<PlaybackForm
          recordSession={this.recordSession}
          replaySession={this.replaySession}
          handlePlaybackChange={this.handlePlaybackChange}
          playbackSpeed={this.props.editor.playbackSpeed}
        />*/}
        <Editor
          logger={this.props.logger}
          broadcast={this.broadcast}
          triggerBehaviour={this.props.triggerBehaviour}
          editorBehaviour={this.props.editorBehaviour} 
          
        />
        {/*<CommentsContainer broadcast={this.broadcast} />*/}
      </div>
      </React.Fragment>
    )
  }
}

const mapStateToProps = (store: AppState) => {
  return{
    editor: store.editorReducer,
    menu: store.menuReducer,
    locked: store.editorReducer.locked
  }
}

export default connect(
  mapStateToProps,
  {
    startRecording,
    setTargetId,
    setPlaybackSpeed,
    setTheme
  }
)(App);
