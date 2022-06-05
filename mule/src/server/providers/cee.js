"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CEEServiceProvider = void 0;
const common_1 = require("@osjs/common");
const index_1 = require("./src/cee/index");
/**
 * Code Execution Engine Service Provider
 */
class CEEServiceProvider extends common_1.ServiceProvider {
    /**
     * Constructor
     * @param {Core} core Core reference
     */
    constructor(core, options = {}) {
        super(core, options);
        this.cee = new index_1.default(core.config('cee'));
    }
    /**
     * A list of services this provider can create
     * @desc Used for resolving a dependency graph
     * @return {string[]}
     */
    provides() {
        return [
            'mule/cee'
        ];
    }
    /**
     * Initializes provider
     */
    init() {
        this.core.singleton('mule/cee', () => this.cee);
    }
    /**
     * Starts provider
     */
    start() {
    }
    /**
     * Destroys provider
     */
    destroy() {
    }
}
exports.CEEServiceProvider = CEEServiceProvider;
//# sourceMappingURL=cee.js.map