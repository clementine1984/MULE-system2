import React from 'react';
import logo from './about.png' //OSJS not bundling images by default through proc.resource - this will force the webpack bundling 

export default class App extends React.Component {
  
  render() {
    const logo = this.props.proc.resource('./about.png');
    console.log("*****************",this.props.logo)
    return (
      <div>
      <h1>MULE</h1>
  
      <div>
        Created by Kevin Casey, Natalie Culligan, Alexandru-Bogdan Cumpanici, Rian Gallagher,  Katie Brugha, Ruiqi Li, Vanush "Misha" Paturyan
      </div>
  
      <div>
        <img src={logo} alt="Logo" />
      </div>
  
      <div>
  
      </div>
    </div>
    );
  }
}
