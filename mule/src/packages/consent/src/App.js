import React from "react";
//import logo from './about.png' //OSJS not bundling images by default through proc.resource - this will force the webpack bundling

import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import Checkbox from "@material-ui/core/Checkbox";

import FormControlLabel from "@material-ui/core/FormControlLabel";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import { createStore } from "redux";
import { Provider, connect } from "react-redux";
import reducer from "./reducers";
import { setTab, setName, setConsent, setAuto,setReminder } from "./actions/consentActions";

var store = createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

const mapStateToProps = (state, ownProps) => {
  console.log("STATE IS:", state);
  return state.consentReducer;
};

const mapDispatchToProps = {
  setTab,
  setName,
  setConsent,
  setAuto,
  setReminder
};

function connectWithStore(store, WrappedComponent, ...args) {
  let ConnectedWrappedComponent = connect(...args)(WrappedComponent);
  return function(props) {
    return <ConnectedWrappedComponent {...props} store={store} />;
  };
}












class App extends React.Component {
  constructor(props) {
    super(props);
    console.log(props)
    this.props.setName(this.props.user.name);





    for (const key in this.props.dbconsents)
    {
      this.props.setConsent(key,this.props.dbconsents[key])
    }

    if(this.props.autoLaunch===true) 
    {
      this.props.setAuto(true)
      if(this.fullyConsented()) { return this.props.proc.destroy()}
      this.clearReminder()
    }
  }

  setCloseable(state)
  {
    var display=(state?'block':'none')
    console.log("Setting closeable to ",display)
    this.props.proc.windows[0].$header.querySelector(`.osjs-window-button[data-action=close]`).style.display = display;
    this.props.proc.windows[0].$header.querySelector(`.osjs-window-icon`).style.display = display;
  }


  setReminder()
  {
    if(this.fullyConsented()) { return this.props.proc.destroy()}
    this.props.setReminder(true)
    this.props.proc.windows[0].setDimension({width:640,height:170})    
    this.props.proc.windows[0].attributes.resizable=false
  }

  clearReminder()
  {
    this.props.setReminder(false)
    this.props.proc.windows[0].setDimension({width:640,height:480})
    this.props.proc.windows[0].attributes.resizable=true
  }



  async submitChoices()
  {
    console.log(this.props.consents)
    await this.props.proc.request('/consent',{method: 'post', body: {consents: this.props.consents}})
    for (const key in this.props.consents)
    {
      this.props.dbconsents[key]=this.props.consents[key]
    }
    this.setReminder()
  }


  async reviewChoices()
  {
    this.clearReminder()
  }




  toggleBox(box) {
    this.props.setConsent(box, !this.props.consents[box]);
  }

  tabChange(event, value) {
    this.props.setTab(value);
  }


  fullyConsented()
  {
    //TODO: this is an ugly (deliberate) side-effect!
    var ans=(Object.values(this.props.dbconsents).indexOf(false)==-1)
    this.setCloseable(ans)
    return ans
  }



  render() {

    this.fullyConsented() //forces close button to disappear if not fully consented (see side effect)


    return (
      <Provider store={store}>
        <div
          style={{
            position: "absolute",
            top: "0",
            bottom: "0",
            width: "100%",
            overflow: "auto"
          }}
        >

        { this.props.reminder && 
            <span id="consent-reminder" style={{ padding: "1.5em", display: "block" }}>
              <img style={{ marginRight: "0.5em", float: "left" }} src={ this.props.theme.icon("dialog-warning") } />
              You are using Mule, but have not consented fully to data usage.
              Please click review to review your choices. Contact us at
              mule@mu.ie if you have any questions.
              <br />
              <Button
                  style={{ marginTop:"0.5em", float: "right" }}
                  variant="contained"
                  onClick={this.reviewChoices.bind(this)}
                >
                  Review Choices
                </Button>
            </span>
          }








          { !this.props.reminder && 


          <div>

          <AppBar position="static">
            <Tabs
              value={this.props.activeTab}
              onChange={this.tabChange.bind(this)}
            >
              <Tab label="Consent Form" />
              <Tab label="Information Sheet" />
            </Tabs>
          </AppBar>

          <table
            style={{ background: "#dcdcdc", width: "100%", padding: "1em" }}
          >
            <tbody>
              <tr>
                <td style={{ width: "10em" }}>Research Project:</td>
                <td>MULE - Maynooth University Learning Environment</td>
              </tr>
              <tr>
                <td>Researchers:</td>
                <td>
                  Dr Kevin Casey, Natalie Culligan, Department of Computer
                  Science, Maynooth University, Maynooth, Co. Kildare
                </td>
              </tr>
              <tr>
                <td>Contact details:</td>
                <td>Email natalie.culligan@mu.ie</td>
              </tr>
            </tbody>
          </table>
         
          

          <div>
            {this.props.activeTab === 1 && (
              <div>
                <p>
                  <b>The Purpose</b>
                </p>
                <p>
                  The purpose of this study is to gather data on how students
                  are using the MULE system. MULE (Maynooth University Learning
                  Environment) is a web-browser based system where students can
                  edit, compile, and run their program. There are two categories
                  of data gathered by the system: research data and academic
                  data. Research data will be used in improving future versions
                  of the tool and in research (and subsequent publication) as to
                  how useful the tool is and the usage patterns that students
                  with different abilities have, and if it is possible to detect
                  stress from behavioural data. Academic data is used to provide
                  reports on student performance and is necessary for the system
                  to function in its role as a module content delivery platform.
                </p>
                <p>
                  <b>The Participant</b>
                </p>
                <p>
                  The participant mentioned throughout this information sheet,
                  refers to a student who is participating in a programming
                  module.
                </p>
                <p>
                  <b>The Data Gathering</b>
                </p>
                <p>
                  Participants will complete their module as normal using the
                  MULE software system. The system will gather research data and
                  academic data. The system gathers the users' interaction data,
                  user profile data, feedback and all code written by the user
                  that is saved, compiled, executed, or evaluated. Periodically,
                  a fully anonymised copy of the existing dataset is made to
                  allow early-stage research.
                </p>
                <p>
                  <b>Non-participation and exit from the study</b>
                </p>
                <p>
                  In accordance with the new GDPR guidelines, there is no
                  requirement to participate in this study and the participant
                  may still use the system. If a user chooses to opt out,
                  academic data will still be gathered on the student, to
                  provide reports to the course co-ordinator, but their data
                  will not be used in the study. A participant may choose to
                  exit the study at any time up until the end of the academic
                  year. The participant must send their request in writing to
                  the researcher, and all research-related data collected that
                  has not yet been fully anonymised will be destroyed.
                </p>
                <p>
                  <b>Anonymity and security of data</b>
                </p>
                <p>
                  {" "}
                  As soon as the data is collected, it will be encoded with a
                  unique identity key, to allow for separate sessions of use to
                  be associated with a user. At the end of the academic year,
                  the data will be fully anonymised. No records of the
                  participant's identity will be stored for the purpose of our
                  study, but the course co-ordinator will be able to review some
                  aspects of the data. It must be recognized that, in some
                  circumstances, confidentiality of research data and records
                  may be overridden by courts in the event of litigation or in
                  the course ofinvestigation by lawful authority. In such
                  circumstances the University will take all reasonable steps
                  within law to ensure that confidentiality is maintained to the
                  greatest possible extent. The data will be stored only on a
                  secure server located in Ireland. Only the above-named
                  researchers will have access to it. The data will be kept for
                  10 years and will be destroyed thereafter.
                </p>
                <p>
                  <b>Access to your data</b>
                </p>
                <p>
                  The subject is able to request a copy of their data that is
                  stored for research by contacting the researcher, up until the
                  data is fully anonymised. Questions: If you have any further
                  questions, please contact the researcher using the above
                  contact details.
                </p>
              </div>
            )}

            {this.props.activeTab === 0 && (
              <div>
                <p>
                  The data gathered will be used by the researcher to improve
                  the MULE system and the findings may be published in suitable
                  conferences and journals.
                </p>
                <p>
                  Some data will be accessible by the course co-ordinator to
                  evaluate progress.
                </p>
                <p>I can access my data at my discretion.</p>
                <p>
                  I have received assurance from the researcher that the
                  information that I will share will remain strictly
                  confidential and that no information that discloses my
                  identity will be released or published. However, I recognize
                  that, in some circumstances, confidentiality of research data
                  and records may be overridden by courts in the event of
                  litigation or during investigation by lawful authority. In
                  such circumstances the University will take all reasonable
                  steps within law to ensure that confidentiality is maintained
                  to the greatest possible extent I am free to withdraw from the
                  study up until the end of the academic year.
                </p>
                <p>
                  I can refuse to answer any of the questions asked or to
                  participate in any of the exercises.
                </p>
                <p>
                  All research-related data gathered will bestored in a secure
                  manner and only the above-named researchers will have access
                  to it.
                </p>
                <p>
                  If I have any questions about the research project, I may
                  contact Natalie Culligan at the contact details provided.
                </p>
                <p>
                  I also understand that if I choose not to participate in the
                  study, data will still be gathered by the system to provide
                  reports for the course co-ordinator, but the data will not be
                  used for research.
                </p>
                <p>
                  If during your participation in this study you feel the
                  information and guidelines that you were given have been
                  neglected or disregarded in any way, or if you are unhappy
                  about the process, please contact the Secretary of the
                  Maynooth University Ethics Committee at
                  research.ethics@nuim.ie or +353 (0)1 708 6019. Please be
                  assured that your concerns will be dealt with in a sensitive
                  manner.
                </p>

                <hr />
                <p>
                  I,&nbsp;<span id="name">{this.props.name}</span>, agree to
                  participate in the research project being carried out by Dr
                  Kevin Casey and Natalie Culligan to gather data on how
                  students use the Mule system. I consent to the automatic
                  gathering, by the Mule system of the following:
                </p>

                <FormGroup style={{margin:"0.5em"}}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="primary"
                        checked={this.props.consents.interaction}
                        onChange={this.toggleBox.bind(this, "interaction")}
                        value="0"
                        disabled={this.props.dbconsents.interaction}
                      />
                    }
                    label="user interaction data"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        color="primary"
                        checked={this.props.consents.performance}
                        onChange={this.toggleBox.bind(this, "performance")}
                        value="0"
                        disabled={this.props.dbconsents.performance}
                      />
                    }
                    label="performance"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        color="primary"
                        checked={this.props.consents.feedback}
                        onChange={this.toggleBox.bind(this, "feedback")}
                        value="0"
                        disabled={this.props.dbconsents.feedback}
                      />
                    }
                    label="feedback"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        color="primary"
                        checked={this.props.consents.code}
                        onChange={this.toggleBox.bind(this, "code")}
                        value="0"
                        disabled={this.props.dbconsents.code}
                      />
                    }
                    label="code"
                  />
                </FormGroup>

                <Button
                  style={{margin:"0.5em"}}
                  variant="contained"
                  onClick={this.submitChoices.bind(this)}
                >
                  I Agree
                </Button>

                <p />
                <p />
              </div>
            )}

            
          </div></div>}
        </div>
      </Provider>
    );
  }
}

/*export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App)
*/

export default connectWithStore(
  store,
  App,
  mapStateToProps,
  mapDispatchToProps
);
