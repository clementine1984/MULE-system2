"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseServiceProvider = void 0;
const common_1 = require("@osjs/common");
const index_1 = require("./src/course/index");
/**
 * Code Execution Engine Service Provider
 */
class CourseServiceProvider extends common_1.ServiceProvider {
    /**
     * Constructor
     * @param {Core} core Core reference
     */
    constructor(core, options = {}) {
        super(core, options);
        this.course = new index_1.default(core);
    }
    /**
     * A list of services this provider can create
     * @desc Used for resolving a dependency graph
     * @return {string[]}
     */
    provides() {
        return [
            'mule/course'
        ];
    }
    /**
     * Initializes provider
     */
    init() {
        this.core.singleton('mule/course', () => this.course);
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
exports.CourseServiceProvider = CourseServiceProvider;
//# sourceMappingURL=course.js.map