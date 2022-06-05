const defaultState = {
  consents: 
  { 
    interaction: false,
    performance: false,
    feedback: false,
    code: false
  },
  activeTab:0,
  name: "FIRSTNAME LASTNAME",
  reminder: false,
  auto: false
}
  
  export default function consentReducer(state=defaultState, action) {
    switch(action.type){
      case 'SET_CONSENT': {
        var consents= { ...state.consents, ...action.payload }
        console.log(consents)
        return { ...state, consents: consents}
      }
      case 'SET_NAME': {
        return { ...state, name: action.payload}
      }
      case 'SET_TAB': {
        return { ...state, activeTab: action.payload}
      }
      case 'SET_REMINDER': {
        return { ...state, reminder: action.payload}
      }
      case 'SET_AUTO': {
        return { ...state, auto: action.payload}
      }
    }
    return state;
  }
  