import type { RequestHandler } from "express";

import * as itemData from "../helpers/itemDataCache";


export const handler: RequestHandler = (req, res) => {

  const searchFilters: {
    searchStr: string;
  } = req.body;

  const items = itemData.getItems(searchFilters.searchStr || "");

  return res.json({
    items
  });
};
