import type { RequestHandler } from "express";

import * as configFns from "../helpers/configFns";
import * as itemData from "../helpers/itemDataCache";


export const handler: RequestHandler = (req, res) => {

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
