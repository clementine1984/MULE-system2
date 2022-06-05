"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function enableItem(item) {
    return { type: 'ENABLE_ITEM', payload: item };
}
exports.enableItem = enableItem;
function disableItem(item) {
    return { type: 'DISABLE_ITEM', payload: item };
}
exports.disableItem = disableItem;
//# sourceMappingURL=actions.js.map