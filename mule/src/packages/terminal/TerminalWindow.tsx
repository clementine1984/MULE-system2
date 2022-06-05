import * as React from 'react';
import './css/xterm.css';

interface TerminalProps {
  term: any
}

class TerminalWindow extends React.Component<TerminalProps>{
  myRef: any;
  constructor(props: any){
    super(props);
    this.myRef = React.createRef();
  }


 


  componentDidMount(){
    const term = this.props.term;
    term.open(this.myRef.current);
    term.write('\r\n');
    term.focus();
    term.fit()
    term._initialized = true;
  }
  render(){
    console.log("/")


    //let spinner=((this.props.locked.state)?(<Spinner />):null)
    return(
<div style={{height:"100%"}}>
      
      <div ref={this.myRef} style={{width:"100%",height:"100%",backgroundColor:"#000"}}/>
    
        </div>
    )
  }
}














export default TerminalWindow;
