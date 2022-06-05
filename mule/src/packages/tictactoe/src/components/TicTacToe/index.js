import Board from "./Board";
import { useSquares } from "./utils";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import "./index.css";

import victory from"../../sound/victory.mp3"
import defeat from"../../sound/defeat.mp3"

const dict = {
  0: `""`,
  1: `"O"`,
  2: `"X"`,
};

const parseIndex = (idx, bool = false) => {
  const res = bool ? /^"([012])'"$/.exec(idx) : /^"([012])"$/.exec(idx);
  if (!res) {
    return null;
  }
  return Number(res[1]);
};

const parsePlayer = (player) => {
  const res = /^"([xo]?)"$/.exec(player);
  if (!res) {
    return null;
  }
  return res[1];
};

const TicTacToe = forwardRef((props, ref) => {
  const [music, setMusic] = useState("");
  const [line, setLine] = useState([]);
  const [squares, setSquares] = useSquares();

  const handles = {
    handleCommand(command) {
      if (command === "getState") {
        return `[${squares.map((key) => dict[key]).toString()}]`;
      } else if (command === "clear") {
        setLine([]);
        setSquares();
        return "ok";
      } else if (command.startsWith("set ")) {
        const args = command.split(" ");
        if (args.length !== 4) {
          return "error";
        }
        const args_1 = parseIndex(args[1]);
        const args_2 = parseIndex(args[2]);
        const args_3 = parsePlayer(args[3]);
        if (args_1 === null || args_2 === null || args_3 === null) {
          return "error";
        }

        const index = args_1 * 3 + args_2;
        const next = args_3 !== "" ? (args_3 !== "x" ? 1 : 2) : 0;
        setSquares(index, next);
        return "ok";
      } else if (command.startsWith("line ")) {
        const args = command.split(" ");
        if (args.length !== 5) {
          return "error";
        }
        const args_1 = parseIndex(args[1]);
        const args_2 = parseIndex(args[2]);
        const args_3 = parseIndex(args[3], true);
        const args_4 = parseIndex(args[4], true);

        if (
          args_1 === null ||
          args_2 === null ||
          args_3 === null ||
          args_4 === null
        ) {
          return "error";
        }

        const line = [args_1 * 3 + args_2, args_3 * 3 + args_4];
        setLine(line);
        console.log(line);
        return "ok";
      } else if (command.startsWith("play ")) {
        const args = command.split(" ");
        if (args.length !== 2) {
          return "error";
        }

        if (args[1] === "victory") {
          setMusic("");
          setTimeout(() => {
            setMusic("./apps/tictactoe/victory.mp3");
          }, 0);
          return "ok";
        } else if (args[1] === "defeat") {
          setMusic("");
          setTimeout(() => {
            setMusic("./apps/tictactoe/defeat.mp3");
          }, 0);
          return "ok";
        }

        return "error";
      }

      return "error";
    },
  };

  useImperativeHandle(ref, () => handles);

  return (
    <div className="tictoctoe">
      <Board squares={squares} line={line} />
      <audio autoPlay src={music}></audio>
    </div>
  );
});

export default TicTacToe;
