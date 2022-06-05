import * as path from 'path'
import * as fs from 'fs'
import * as decomment from 'decomment'

/**
 * Course service
 */
class Course {

  protected readonly CONFIG_FILENAME = 'config.json'

  protected readonly ENTRY_TYPE_DIRECTORY = 'directory'
  protected readonly ENTRY_TYPE_FILE = 'file'

  core: any

  /**
   * Course constructor
   *
   * @param core
   */
  public constructor(core: any) {
    this.core = core
  }

  /**
   * Get config
   *
   * @param user
   */
  public async getConfig (user) {

    return await this.readFile(user, this.CONFIG_FILENAME)
  }

  /**
   * Read file
   *
   * @param user
   * @param file
   */
  public async readFile (user, file) {

    const filePath = path.join(this.core.config('vfs.root'), user.consumerId, user.courseId, file)
    let fileContent = await fs.promises.readFile(filePath, 'utf8')

    // If JSON then parse
    if (file.includes('.json')) {
      fileContent = JSON.parse(decomment(fileContent))
    }

    return fileContent;
  }

  /**
   * Write file
   *
   * @param user
   * @param file
   * @param content
   */
  public async writeFile (user, file, content) {

    const filePath = path.join(this.core.config('vfs.root'), user.consumerId, user.courseId, file)
    return await fs.promises.writeFile(filePath, content)
  }

  /**
   * Scan directory
   *
   * @param user
   * @param dir
   */
  public async scanDir (user, dir) {

    const dirPath = path.join(this.core.config('vfs.root'), user.consumerId, user.courseId, dir)
    let entries = await fs.promises.readdir(dirPath, {
      withFileTypes: true
    })

    return entries.map((entry) => {
      return {
        basename: entry.name,
        type: entry.isDirectory() ? this.ENTRY_TYPE_DIRECTORY : this.ENTRY_TYPE_FILE
      }
    })
  }
}

export default Course