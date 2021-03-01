import { Router } from "express";

import * as configFns from "../helpers/configFns";

import { handler as handler_search } from "../handlers/search";
import { handler as handler_doSearch } from "../handlers/doSearch";
import { handler as handler_item } from "../handlers/item";


const router = Router();


// Default


router.all(["/", "/item"], function(_req, res) {
  res.redirect(configFns.getProperty("reverseProxy.urlPrefix") + "/search");
});


// New Permit Process


router.get("/search", handler_search);


router.post("/doSearch", handler_doSearch);


router.get("/item/:itemKey", handler_item);


export = router;
