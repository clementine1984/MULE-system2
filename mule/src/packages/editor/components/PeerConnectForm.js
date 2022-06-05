"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const PeerConnectForm = (props) => {
    return (React.createElement("form", { onSubmit: props.handleSubmit },
        React.createElement("label", null,
            "Target ID:",
            React.createElement("input", { type: "text", onChange: props.handleIdChange, value: props.targetID })),
        React.createElement("input", { type: "submit", value: "Submit" })));
};
exports.default = PeerConnectForm;
//# sourceMappingURL=PeerConnectForm.js.map