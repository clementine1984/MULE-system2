import {ServiceProvider} from '@osjs/common'
import CEE from './src/cee/index'

/**
 * Code Execution Engine Service Provider
 */
export class CEEServiceProvider extends ServiceProvider {

  cee: CEE

  /**
   * Constructor
   * @param {Core} core Core reference
   */
  constructor(core, options = {}) {
    super(core, options)

    this.cee = new CEE(core.config('cee'))
  }

  /**
   * A list of services this provider can create
   * @desc Used for resolving a dependency graph
   * @return {string[]}
   */
  provides() {
    return [
      'mule/cee'
    ]
  }

  /**
   * Initializes provider
   */
  init() {
    this.core.singleton('mule/cee', () => this.cee)
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