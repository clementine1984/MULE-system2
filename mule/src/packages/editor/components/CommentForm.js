"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const CommentForm = (props) => {
    return (React.createElement("form", { onSubmit: props.onSubmit },
        React.createElement("input", { type: "text", value: props.value, onChange: props.onChange, onSubmit: props.onSubmit }),
        React.createElement("input", { type: "submit", value: "submit" })));
};
exports.default = CommentForm;
//# sourceMappingURL=CommentForm.js.map