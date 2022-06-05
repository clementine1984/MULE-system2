import React from 'react';
import { OsJsContext } from "./OsJsContext";
import Workstation from "./Workstation";
const App = ({ core, proc, win }) => (
  <OsJsContext.Provider value={{ core, proc, win }}>
    <Workstation />
  </OsJsContext.Provider>
);

export default App;
