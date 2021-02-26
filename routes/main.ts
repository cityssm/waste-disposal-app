import { Router } from "express";

import * as configFns from "../helpers/configFns";

import { handler as handler_search } from "../handlers/search";


const router = Router();


// Default


router.all(["/", "/item"], function(_req, res) {
  res.redirect(configFns.getProperty("reverseProxy.urlPrefix") + "/search");
});


// New Permit Process


router.get("/search", handler_search);


// router.post("/doSearch", handler_doCreate);


// router.get("/item/:itemKey", handler_toPayment);


export = router;
