"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const PlaybackForm = (props) => {
    return (React.createElement("div", null,
        React.createElement("button", { onClick: props.recordSession }, "Record Session"),
        React.createElement("button", { onClick: props.replaySession }, "Replay Session"),
        React.createElement("label", null,
            "Playback Speed:",
            React.createElement("select", { value: props.playbackSpeed, onChange: props.handlePlaybackChange },
                React.createElement("option", { value: "0.25" }, "0.25"),
                React.createElement("option", { value: "0.5" }, "0.5"),
                React.createElement("option", { value: "0.75" }, "0.75"),
                React.createElement("option", { value: "1" }, "Normal"),
                React.createElement("option", { value: "1.25" }, "1.25"),
                React.createElement("option", { value: "1.5" }, "1.5"),
                React.createElement("option", { value: "1.75" }, "1.75"),
                React.createElement("option", { value: "2" }, "2")))));
};
exports.default = PlaybackForm;
//# sourceMappingURL=PlaybackForm.js.map