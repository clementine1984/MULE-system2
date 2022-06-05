

export function setTab(tab) {
  return {type: 'SET_TAB', payload: tab};
}


export function setName(name) {
  return {type: 'SET_NAME', payload: name};
}


export function setReminder(value) {
  return {type: 'SET_REMINDER', payload: value};
}


export function setAuto(value) {
  return {type: 'SET_AUTO', payload: value};
}


export function setConsent(item, value) {
  let payload = {};
  payload[item] = value;
  return {type: 'SET_CONSENT', payload: payload};

}
