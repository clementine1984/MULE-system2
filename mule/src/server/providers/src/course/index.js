"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const decomment = require("decomment");
/**
 * Course service
 */
class Course {
    /**
     * Course constructor
     *
     * @param core
     */
    constructor(core) {
        this.CONFIG_FILENAME = 'config.json';
        this.ENTRY_TYPE_DIRECTORY = 'directory';
        this.ENTRY_TYPE_FILE = 'file';
        this.core = core;
    }
    /**
     * Get config
     *
     * @param user
     */
    getConfig(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.readFile(user, this.CONFIG_FILENAME);
        });
    }
    /**
     * Read file
     *
     * @param user
     * @param file
     */
    readFile(user, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = path.join(this.core.config('vfs.root'), user.consumerId, user.courseId, file);
            let fileContent = yield fs.promises.readFile(filePath, 'utf8');
            // If JSON then parse
            if (file.includes('.json')) {
                fileContent = JSON.parse(decomment(fileContent));
            }
            return fileContent;
        });
    }
    /**
     * Write file
     *
     * @param user
     * @param file
     * @param content
     */
    writeFile(user, file, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = path.join(this.core.config('vfs.root'), user.consumerId, user.courseId, file);
            return yield fs.promises.writeFile(filePath, content);
        });
    }
    /**
     * Scan directory
     *
     * @param user
     * @param dir
     */
    scanDir(user, dir) {
        return __awaiter(this, void 0, void 0, function* () {
            const dirPath = path.join(this.core.config('vfs.root'), user.consumerId, user.courseId, dir);
            let entries = yield fs.promises.readdir(dirPath, {
                withFileTypes: true
            });
            return entries.map((entry) => {
                return {
                    basename: entry.name,
                    type: entry.isDirectory() ? this.ENTRY_TYPE_DIRECTORY : this.ENTRY_TYPE_FILE
                };
            });
        });
    }
}
exports.default = Course;
//# sourceMappingURL=index.js.map