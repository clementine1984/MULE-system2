import React, { useRef, useEffect } from "react";
import Square from "./Square";
import "./board.css";

const NUM = 3;
const Iters = new Array(NUM).fill(0);

const Board = ({ squares, line }) => {
  const canvasRef = useRef();

  useEffect(() => {
    const theCanvas = canvasRef.current;
    const ctx = theCanvas.getContext("2d");
    const { width, height } = theCanvas.getBoundingClientRect();
    theCanvas.width = width;
    theCanvas.height = height;
    ctx.clearRect(0, 0, width, height);

    const [start, to] = line;
    const x1 = 0.5 + (start % 3);
    const y1 = 0.5 + parseInt(start / 3);
    const x2 = 0.5 + (to % 3);
    const y2 = 0.5 + parseInt(to / 3);
    const scale = width / 3;

    ctx.beginPath();
    ctx.moveTo(x1 * scale, y1 * scale);
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#842727";
    ctx.lineTo(x2 * scale, y2 * scale);
    ctx.stroke();
  }, [line]);

  return (
    <div className="board-wrapper">
      <div className="board">
        {Iters.map((_, row) => (
          <div className="board-row" key={row}>
            {Iters.map((_, col) => {
              const idx = row * NUM + col;
              return <Square key={idx} value={squares[idx]} />;
            })}
          </div>
        ))}
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
};

export default Board;
