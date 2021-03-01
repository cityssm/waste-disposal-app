"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const configFns = require("../helpers/configFns");
const itemData = require("../helpers/itemDataCache");
const handler = (req, res) => {
    const itemKey = req.params.itemKey;
    if (itemKey === "") {
        return res.redirect(configFns.getProperty("reverseProxy.urlPrefix") + "/search");
    }
    const item = itemData.getItemByItemKey(itemKey);
    if (!item) {
        return res.redirect(configFns.getProperty("reverseProxy.urlPrefix") + "/search");
    }
    const itemReuses = itemData.getItemReusesByItemKey(itemKey) || [];
    const itemLocations = itemData.getItemLocationsByItemKey(itemKey) || [];
    const relatedItems = itemData.getRelatedItemsByItemKey(itemKey) || [];
    return res.render("item", {
        item,
        itemReuses,
        itemLocations,
        relatedItems
    });
};
exports.handler = handler;
