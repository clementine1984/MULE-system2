import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import React from 'react';
import { useRef, useContext, useEffect} from "react";
import { OsJsContext } from "./OsJsContext";

import "./workstation.css";
import TicTacToe from "./components/TicTacToe";

const Workstation = () => {
  const { proc } = useContext(OsJsContext);

  const ref = useRef();
  const socketRef = useRef();

  const handleCommand = (command) => {
    return ref.current.handleCommand(command);
  };

  useEffect(() => {
    // const ws = proc.socket('/socket');
    // ws.on("open", () => {
    //   ws.send("init");
    // })

    // ws.on('message', (ev) => {
    //   const res = handleCommand(ev.data);
    //   ws.send(res);
    // })

    // socketRef.current = ws;
    
    // return () => {
    //   ws.close();
    // }
  }, []);

  const handleClear = () => {
    handleCommand("clear");
    const ws = socketRef.current;
    if (!ws) return;
    ws.send("click: new game");
  };

  return (
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <TicTacToe ref={ref} />
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          <Button sx={{mt:2}} variant="contained" color="primary" onClick={handleClear}>
            New Game
          </Button>
        </Stack>
      </Box>
  );
};

export default Workstation;
