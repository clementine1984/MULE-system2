import { useState, useCallback } from "react";

export const SQUARE_EMPTY = 0;
export const SQUARE_CIRCLE = 1;
export const SQUARE_FORK = 2;

export const GAME_INITIAL = 0;
export const GAME_PROCESS = 1;
export const GAME_ERROR = 2;
export const GAME_FINISH = 3;

export const useToogle = () => {
  const [next, setNext] = useState(SQUARE_FORK);

  const _setNext = useCallback((reset = false) => {
    if (reset) {
      setNext(SQUARE_FORK);
      return;
    }
    setNext((next) => (next === SQUARE_CIRCLE ? SQUARE_FORK : SQUARE_CIRCLE));
  }, []);

  return [next, _setNext];
};

const DEFAULT_SQUARES = new Array(9).fill(SQUARE_EMPTY);

export const useSquares = () => {
  const [squares, setSquares] = useState(DEFAULT_SQUARES);

  const _setSquares = useCallback((...args) => {
    const length = args.length;
    if (length === 0) {
      setSquares(DEFAULT_SQUARES);
      return;
    }

    setSquares((squares) => {
      const [index, next] = args;
      const copy = [...squares];
      copy[index] = next;
      return copy;
    });
  }, []);

  return [squares, _setSquares];
};

export const defaultCalculateWinner = (squares) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  // console.log(squares);

  for (const line of lines) {
    // console.log(line);

    const [a, b, c] = line;
    if (
      squares[a] === squares[b] &&
      squares[a] === squares[c] &&
      squares[a] !== SQUARE_EMPTY
    ) {
      return squares[a];
    }
  }

  return SQUARE_EMPTY;
};
