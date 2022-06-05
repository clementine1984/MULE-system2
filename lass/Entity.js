"use strict";
// data/Entity.ts
// Copyright © 2017 Smallrock Internet Services, Inc. All rights reserved.
// This file is part of the TypeScript ORM Example.
//
// The TypeScript ORM Example is free software: you can redistribute it and/or modify it under
// the terms of the GNU Lesser General Public License as published by the Free Software
// Foundation, version 3.
//
// The TypeScript ORM Example is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
// PURPOSE.  See the GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along with the TypeScript
// ORM Example.  If not, see <http://www.gnu.org/licenses/>.
//
// The Entity class is designed to convert a JSON-provided object into an object of the class, whatever super-class
// this object really is. If the source is missing expected properties, that is logged to the console. If the source
// has extra properties, that is logged to the console.
//
// The expected property list must be constructed manually in the super() call in the super-class, because 'this' is
// not available to enumerate the properties. We also cannot construct it from the members of the prototype, because
// that may include members that are not get/set methods.
//
Object.defineProperty(exports, "__esModule", { value: true });
var Entity = /** @class */ (function () {
    // constructor
    // The constructor will initialize the object from the properties defined using getters and
    // setters methods.
    function Entity(source) {
        var _this = this;
        if (source) {
            // Get the name of this class for logging
            var match = /^(class|function)?\s+(\w+)(\r|\n|.)*$/;
            var className_1 = this.constructor.toString().replace(match, '$2');
            // Match every expected property and initialize the value.
            var properties = this.listAllProperties();
            properties.forEach(function (property) {
                if (typeof source[property] !== 'undefined') {
                    var self_1 = _this;
                    self_1[property] = source[property];
                }
                else {
                    console.log("class " + className_1 + ": Attempt to initialize entity from missing source property '" + property + "'");
                }
            });
            // Find and log any unexpected properties.
            for (var property in this) {
                if (!properties.indexOf(property)) {
                    console.log("class " + className_1 + ": Source for entity has unexpected property '" + property + "'");
                }
            }
        }
    }
    // listAllProperties
    // This method will list all the properties defined in the prototype chain that are setters, up to
    // but not including Object.prototype. It uses reflection (for... in, and getOwnPropertyDescriptor)
    // to spin through the properties and decide if a property is a setter.
    Entity.prototype.listAllProperties = function () {
        var result = [];
        var _loop_1 = function (objectToInspect) {
            // Get the property names of each prototype object.
            Object.getOwnPropertyNames(objectToInspect).forEach(function (property) {
                // Get the property descriptor and bypass any properties without 'set' and 'get'.
                var propertyDescriptor = Object.getOwnPropertyDescriptor(objectToInspect, property);
                if (propertyDescriptor.get && propertyDescriptor.set) {
                    result.push(property);
                }
            });
        };
        // Start at the prototype of this, walk to Object.prototype.
        for (var objectToInspect = Object.getPrototypeOf(this); objectToInspect !== null && objectToInspect != Object.prototype; objectToInspect = Object.getPrototypeOf(objectToInspect)) {
            _loop_1(objectToInspect);
        }
        return result;
    };
    Entity.prototype.toJSON = function () {
        var _this = this;
        var properties = this.listAllProperties();
        var dataObject = {};
        properties.forEach(function (property) { return dataObject[property] = _this[property]; });
        return dataObject;
    };
    return Entity;
}());
exports.default = Entity;
//# sourceMappingURL=Entity.js.map