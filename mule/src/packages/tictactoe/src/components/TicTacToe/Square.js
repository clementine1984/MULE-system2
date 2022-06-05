import React from "react";
import { BsCircle, BsXLg } from "react-icons/bs";
import { SQUARE_EMPTY, SQUARE_CIRCLE } from "./utils";
import "./square.css";

const Square = ({ value }) => {
  return (
    <div className="square">
      {value !== SQUARE_EMPTY ? (
        value === SQUARE_CIRCLE ? (
          <BsCircle className="square-icon" />
        ) : (
          <BsXLg className="square-icon" />
        )
      ) : null}
    </div>
  );
};

export default Square;
