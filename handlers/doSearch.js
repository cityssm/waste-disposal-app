"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const itemData = require("../helpers/itemDataCache");
const handler = (req, res) => {
    const searchFilters = req.body;
    const items = itemData.getItems(searchFilters.searchStr || "");
    return res.json({
        items
    });
};
exports.handler = handler;
