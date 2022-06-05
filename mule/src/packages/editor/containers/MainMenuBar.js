"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_redux_1 = require("react-redux");
const react_desktop_menus_1 = require("react-desktop-menus");
const actions_1 = require("../store/menu/actions");
const _ = require("lodash/string");
class MainMenuBar extends React.Component {
    constructor(props) {
        super(props);
        this.action = (action) => () => {
            this.dispatch(action);
        };
        this.action = this.action.bind(this);
    }
    dispatch(action) {
        switch (action) {
            case "save":
                {
                    this.props.triggerBehaviour.save();
                    break;
                }
            case "compile":
                {
                    this.props.triggerBehaviour.compile();
                    break;
                }
            case "run":
                {
                    console.log('run');
                    this.props.triggerBehaviour.run();
                    break;
                }
            case "copy":
                {
                    console.log('copy');
                    break;
                }
            case "undo":
                {
                    console.log('undo');
                    break;
                }
            case "close":
                {
                    console.log('close');
                    break;
                }
            case "redo":
                {
                    console.log('redo');
                    break;
                }
            case "increase-font":
                {
                    console.log('increase font');
                    break;
                }
            case "decrease-font":
                {
                    console.log('decrease font');
                    break;
                }
            case "evaluate":
                {
                    console.log('evaluate');
                    break;
                }
            default:
                {
                    alert("unknown action:" + action);
                    break;
                }
        }
    }
    generateMenuItems(items) {
        return items.map((item) => {
            return (React.createElement(react_desktop_menus_1.MenuItem, { key: item, action: this.action(item), label: _.startCase(item), disabled: this.props.disabledOptions[item] === true }));
        });
    }
    render() {
        const fileItems = this.generateMenuItems(['new', 'open', 'save', 'saveAs', 'close']);
        const editItems = this.generateMenuItems(['undo', 'redo', 'cut', 'copy', 'paste', 'delete']);
        const codeItems = this.generateMenuItems(['compile', 'run', 'evaluate']);
        return (React.createElement(react_desktop_menus_1.Menubar, { style: {
                border: "1px solid #eee",
                zIndex: "100000"
            } },
            React.createElement(react_desktop_menus_1.Menu, { label: 'File', style: { zIndex: "10000" } }, fileItems),
            React.createElement(react_desktop_menus_1.Menu, { label: 'Edit', style: { zIndex: "10000" } }, editItems),
            React.createElement(react_desktop_menus_1.Menu, { label: 'Code', style: { zIndex: "10000" } }, codeItems)));
    }
}
const mapStateToProps = (store) => {
    return {
        disabledOptions: store.menuReducer.disabledOptions
    };
};
exports.default = react_redux_1.connect(mapStateToProps, {
    enableItem: actions_1.enableItem,
    disableItem: actions_1.disableItem
})(MainMenuBar);
//# sourceMappingURL=MainMenuBar.js.map