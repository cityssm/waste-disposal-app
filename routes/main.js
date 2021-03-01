"use strict";
const express_1 = require("express");
const configFns = require("../helpers/configFns");
const search_1 = require("../handlers/search");
const doSearch_1 = require("../handlers/doSearch");
const item_1 = require("../handlers/item");
const router = express_1.Router();
router.all(["/", "/item"], function (_req, res) {
    res.redirect(configFns.getProperty("reverseProxy.urlPrefix") + "/search");
});
router.get("/search", search_1.handler);
router.post("/doSearch", doSearch_1.handler);
router.get("/item/:itemKey", item_1.handler);
module.exports = router;
