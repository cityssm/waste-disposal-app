import * as createError from "http-errors";
import * as express from "express";

import * as compression from "compression";
import * as path from "path";

import * as configFns from "./helpers/configFns";

import * as routerMain from "./routes/main";

import * as itemDataCache from "./helpers/itemDataCache";


/*
 * INITIALIZE APP
 */


const app = express();

if (!configFns.getProperty("reverseProxy.disableEtag")) {
  app.set("etag", false);
}

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

if (!configFns.getProperty("reverseProxy.disableCompression")) {
  app.use(compression());
}

app.use(express.json());

app.use(express.urlencoded({
  extended: false
}));


/*
 * STATIC ROUTES
 */


const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");


app.use(urlPrefix, express.static(path.join(__dirname, "public")));

app.use(urlPrefix + "/lib/axios",
  express.static(path.join(__dirname, "node_modules", "axios", "dist")));


/*
 * ROUTES
 */


// Make config objects available to the templates
app.use(function(_req, res, next) {

  res.locals.configFns = configFns;
  res.locals.urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");

  next();

});


app.use(urlPrefix + "/", routerMain);


// Catch 404 and forward to error handler
app.use(function(_req, _res, next) {

  next(createError(404));

});

// Error handler
app.use(function(err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) {

  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render("error");

});


/*
 * Tasks
 */

// eslint-disable-next-line @typescript-eslint/no-floating-promises
itemDataCache.refreshAll();


export = app;
