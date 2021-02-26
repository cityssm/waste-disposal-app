"use strict";
const express_1 = require("express");
const configFns = require("../helpers/configFns");
const search_1 = require("../handlers/search");
const router = express_1.Router();
router.all(["/", "/item"], function (_req, res) {
    res.redirect(configFns.getProperty("reverseProxy.urlPrefix") + "/search");
});
router.get("/search", search_1.handler);
module.exports = router;
