import {ServiceProvider} from '@osjs/common'
import Course from './src/course/index'

/**
 * Code Execution Engine Service Provider
 */
export class CourseServiceProvider extends ServiceProvider {

  course: Course

  /**
   * Constructor
   * @param {Core} core Core reference
   */
  constructor(core, options = {}) {
    super(core, options)

    this.course = new Course(core)
  }

  /**
   * A list of services this provider can create
   * @desc Used for resolving a dependency graph
   * @return {string[]}
   */
  provides() {
    return [
      'mule/course'
    ]
  }

  /**
   * Initializes provider
   */
  init() {
    this.core.singleton('mule/course', () => this.course)
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