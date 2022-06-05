"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Database_1 = require("./Database");
const class_transformer_1 = require("class-transformer");
const assert = require('assert');
var moment = require('moment');
var Ajv = require('ajv');
var ajv = new Ajv();
class DatabaseModel {
    constructor() {
        this.id = null;
        this.created = null;
        this.modified = null;
        this.modelClass = null;
    }
    getName() {
        let comp = this.constructor;
        return comp.name;
    }
    async create() {
        //allow for auto-generation of ID where required
        if (this.id == null)
            delete this["id"];
        this.created = this.modified = moment().format();
        var result = await Database_1.instance.create(this);
        if (this.id != result.id)
            this.id = result.id;
        return result;
    }
    async update() {
        //allow for auto-generation of ID where required
        //if(this.id==null) delete this["id"];
        this.modified = moment().format();
        var result = await Database_1.instance.update(this);
        //  if(this.id!=result.id) this.id=result.id
        return result;
    }
    toJSON() {
        return Database_1.instance.toJSON(this);
    }
}
__decorate([
    class_transformer_1.Exclude()
], DatabaseModel.prototype, "modelClass", void 0);
exports.default = DatabaseModel;
//# sourceMappingURL=DatabaseModel.js.map