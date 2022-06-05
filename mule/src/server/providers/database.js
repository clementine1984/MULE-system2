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
const { ServiceProvider } = require('@osjs/common');
const axios = require('axios');
const DBRoot = "http://lass:8080";
class DatabaseProvider extends ServiceProvider {
    provides() {
        return ['server/database/api'];
    }
    get(route) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield axios.get(DBRoot + route);
            return result.data;
        });
    }
    post(route, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield axios.post(DBRoot + route, data);
            return result.data;
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.core.singleton('server/database/api', () => ({
                get: route => {
                    return this.get(route);
                },
                post: (route, data) => {
                    return this.post(route, data);
                }
            }));
        });
    }
}
module.exports = DatabaseProvider;
//# sourceMappingURL=database.js.map