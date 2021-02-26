"use strict";
const createError = require("http-errors");
const express = require("express");
const compression = require("compression");
const path = require("path");
const configFns = require("./helpers/configFns");
const routerMain = require("./routes/main");
const itemDataCache = require("./helpers/itemDataCache");
const app = express();
if (!configFns.getProperty("reverseProxy.disableEtag")) {
    app.set("etag", false);
}
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
if (!configFns.getProperty("reverseProxy.disableCompression")) {
    app.use(compression());
}
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
app.use(urlPrefix, express.static(path.join(__dirname, "public")));
app.use(urlPrefix + "/bulma-webapp-js", express.static(path.join(__dirname, "node_modules", "@cityssm", "bulma-webapp-js", "dist")));
app.use(function (_req, res, next) {
    res.locals.configFns = configFns;
    res.locals.urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
    next();
});
app.use(urlPrefix + "/", routerMain);
app.use(function (_req, _res, next) {
    next(createError(404));
});
app.use(function (err, req, res, _next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.render("error");
});
itemDataCache.refreshAll();
module.exports = app;
