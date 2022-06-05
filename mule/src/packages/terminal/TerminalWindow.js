"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const fit_1 = require("xterm/lib/addons/fit/fit");
require("xterm/dist/xterm.css");
class TerminalWindow extends React.Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef();
    }
    componentDidMount() {
        const term = this.props.term;
        term.open(this.myRef.current);
        term.write('\r\n' + '>>');
        fit_1.fit(term);
        term.focus();
        term._initialized = true;
    }
    render() {
        return (React.createElement("div", { ref: this.myRef }));
    }
}
exports.default = TerminalWindow;
//# sourceMappingURL=TerminalWindow.js.map