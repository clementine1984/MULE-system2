"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const IconButton_1 = require("@material-ui/core/IconButton");
const Menu_1 = require("@material-ui/core/Menu");
const MenuItem_1 = require("@material-ui/core/MenuItem");
const MoreVert_1 = require("@material-ui/icons/MoreVert");
const Comment = (props) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [editMode, setEditMode] = React.useState(false);
    const open = Boolean(anchorEl);
    function handleEdit() {
        setEditMode(true);
    }
    function handleEditClose(event) {
        event.preventDefault();
        setEditMode(false);
    }
    function handleClick(event) {
        setAnchorEl(event.currentTarget);
    }
    function handleClose() {
        setAnchorEl(null);
    }
    const style = {
        borderRadius: '5px',
        background: 'white',
        padding: '15px',
        boxShadow: '0px 10px 15px rgba(27, 28, 32, 0.1)',
        margin: '10px',
        marginTop: '0px',
        position: 'relative',
        top: props.distanceFromTop + 'px'
    };
    const ITEM_HEIGHT = 24;
    return (React.createElement("div", { style: style, onClick: () => props.handleCommentClick(props.index) },
        editMode ?
            React.createElement("form", { style: { display: "inline-block" }, onSubmit: handleEditClose },
                React.createElement("input", { type: "text", value: props.content, onChange: props.handleCommentEditChange(props.index) }),
                React.createElement("input", { type: "submit", value: "Submit" }))
            : props.content,
        React.createElement(IconButton_1.default, { "aria-label": "more", "aria-controls": "long-menu", "aria-haspopup": "true", onClick: handleClick },
            React.createElement(MoreVert_1.default, null)),
        React.createElement(Menu_1.default, { id: "long-menu", anchorEl: anchorEl, keepMounted: true, open: open, onClose: handleClose, PaperProps: {
                style: {
                    maxHeight: ITEM_HEIGHT * 4.5,
                    width: 200,
                },
            } },
            React.createElement(MenuItem_1.default, { onClick: handleEdit }, "Edit"),
            React.createElement(MenuItem_1.default, { onClick: () => props.handleCommentDelete(props.index) }, "Delete"))));
};
exports.default = Comment;
//# sourceMappingURL=Comment.js.map