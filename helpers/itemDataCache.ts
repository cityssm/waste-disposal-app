import * as path from "path";
import fetch from "node-fetch";
import * as Papa from "papaparse";

import * as configFns from "./configFns";

import type * as recordTypes from "../types/recordTypes";
import type * as fileDefinitions from "@cityssm/waste-disposal-data/fileDefinitions";

import * as debug from "debug";
const log = debug("waste-disposal-app:itemDataCache");


const itemImages = configFns.getProperty("itemImages");

let data_items_sorted: recordTypes.Item[] = [];
let data_items_byItemKey: Map<string, recordTypes.Item> = new Map();

let data_itemLocations_byItemKey: Map<string, string[]> = new Map();
let data_relatedItems_byItemKey: Map<string, string[]> = new Map();
let data_itemReuses_byItemKey: Map<string, fileDefinitions.ItemReuse[]> = new Map();
let data_locations_byLocationKey: Map<string, fileDefinitions.Location> = new Map();


const loadData_items = (rows: recordTypes.Item[]) => {

  const items: Map<string, recordTypes.Item> = new Map();

  for (const row of rows) {

    if (itemImages.hasOwnProperty(row.itemKey)) {
      row.itemImage = itemImages[row.itemKey];
    }

    row.searchTerms = (row.searchTerms || "").toLowerCase();

    items.set(row.itemKey, row);
  }

  data_items_byItemKey = items;

  data_items_sorted = rows.sort((itemA, itemB) => {

    const itemNameA = itemA.itemName.toLowerCase();
    const itemNameB = itemB.itemName.toLowerCase();

    if (itemNameA < itemNameB) {
      return -1;
    } else if (itemNameA > itemNameB) {
      return 1;
    }

    return 0;
  });
};


const loadData_itemLocations = (rows: fileDefinitions.ItemLocation[]) => {

  const itemLocations: Map<string, string[]> = new Map();

  for (const row of rows) {

    if (itemLocations.has(row.itemKey)) {
      itemLocations.get(row.itemKey).push(row.locationKey);
    } else {
      itemLocations.set(row.itemKey, [row.locationKey]);
    }
  }

  data_itemLocations_byItemKey = itemLocations;
};


const loadData_relatedItems = (rows: fileDefinitions.RelatedItem[]) => {

  const relatedItems: Map<string, string[]> = new Map();

  for (const row of rows) {

    if (relatedItems.has(row.itemKeyA)) {
      relatedItems.get(row.itemKeyA).push(row.itemKeyB);
    } else {
      relatedItems.set(row.itemKeyA, [row.itemKeyB]);
    }

    if (relatedItems.has(row.itemKeyB)) {
      relatedItems.get(row.itemKeyB).push(row.itemKeyA);
    } else {
      relatedItems.set(row.itemKeyB, [row.itemKeyA]);
    }
  }

  data_relatedItems_byItemKey = relatedItems;
};


const loadData_itemReuses = (rows: fileDefinitions.ItemReuse[]) => {

  const itemReuses: Map<string, fileDefinitions.ItemReuse[]> = new Map();

  for (const row of rows) {

    if (itemReuses.has(row.itemKey)) {
      itemReuses.get(row.itemKey).push(row);
    } else {
      itemReuses.set(row.itemKey, [row]);
    }
  }

  data_itemReuses_byItemKey = itemReuses;
};


const loadData_locations = (rows: fileDefinitions.Location[]) => {

  const locations: Map<string, fileDefinitions.Location> = new Map();

  for (const row of rows) {
    locations.set(row.locationKey, row);
  }

  data_locations_byLocationKey = locations;
};


const loadData = async (fileName: recordTypes.DataFileName, loadRemoteFile: boolean) => {

  log(fileName + ", remote = " + (loadRemoteFile ? "true" : "false"));

  let input: string;

  if (loadRemoteFile) {

    const response = await fetch(configFns.getProperty("wasteDisposalData.remoteRootFolder") + "/" + fileName);
    input = await response.text();

  } else {
    input = path.join("..", "..", "node-modules", "@cityssm", "waste-disposal-data", "false", fileName);
  }

  try {
    Papa.parse(input, {
      delimiter: ",",
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {

        if (results.errors.length > 0) {
          log(results.errors[0].message);
          if (loadRemoteFile) {
            await loadData(fileName, false);
          }

          return;
        }

        switch (fileName) {

          case "items.csv":
            loadData_items(results.data as fileDefinitions.Item[]);
            break;

          case "locations.csv":
            loadData_locations(results.data as fileDefinitions.Location[]);
            break;

          case "itemLocations.csv":
            loadData_itemLocations(results.data as fileDefinitions.ItemLocation[]);
            break;

          case "relatedItems.csv":
            loadData_relatedItems(results.data as fileDefinitions.RelatedItem[]);
            break;

          case "itemReuses.csv":
            loadData_itemReuses(results.data as fileDefinitions.ItemReuse[]);
            break;
        }
      }
    });

  } catch (e) {
    log(e);
    if (loadRemoteFile) {
      await loadData(fileName, false);
    }
  }
};


export const refreshAll = async () => {
  log("Refreshing all data files");
  await loadData("items.csv", true);
  await loadData("locations.csv", true);
  await loadData("itemLocations.csv", true);
  await loadData("relatedItems.csv", true);
  await loadData("itemReuses.csv", true);
};


/*
 * Get Functions
 */


export const getItems = (searchStr: string): recordTypes.ItemSearchResult[] => {

  const searchStrPieces = searchStr.toLowerCase().split(" ");

  const resultItems: recordTypes.ItemSearchResult[] = [];

  for (const item of data_items_sorted) {

    let includeItem = true;

    const itemNameLowerCase = item.itemName.toLowerCase();
    const shortDescriptionLowerCase = item.shortDescription.toLowerCase();

    for (const searchStrPiece of searchStrPieces) {

      if (!itemNameLowerCase.includes(searchStrPiece) &&
       !item.searchTerms.includes(searchStrPiece) &&
       !shortDescriptionLowerCase.includes(searchStrPiece)
     ) {
        includeItem = false;
        break;
      }
    }

    if (includeItem) {

      resultItems.push({
        itemKey: item.itemKey,
        itemName: item.itemName,
        itemImage: (item.itemImage || "")
      });
    }
  }

  return resultItems;
};

export const getItemByItemKey = (itemKey: string) => {
  return data_items_byItemKey.get(itemKey);
};


export const getLocationByLocationKey = (locationKey: string) => {
  return data_locations_byLocationKey.get(locationKey);
};


export const getItemLocationsByItemKey = (itemKey: string): fileDefinitions.Location[] => {

  const locationKeys = data_itemLocations_byItemKey.get(itemKey);

  const locations: fileDefinitions.Location[] = [];

  if (locationKeys) {
    for (const locationKey of locationKeys) {
      if (data_locations_byLocationKey.has(locationKey)) {
        locations.push(data_locations_byLocationKey.get(locationKey));
      }
    }
  }

  return locations;
};


export const getItemReusesByItemKey = (itemKey: string) => {
  return data_itemReuses_byItemKey.get(itemKey);
};


export const getRelatedItemsByItemKey = (itemKey: string) => {

  const itemKeys = data_relatedItems_byItemKey.get(itemKey);

  const items: fileDefinitions.Item[] = [];

  if (itemKeys) {
    for (const itemKey of itemKeys) {
      if (data_items_byItemKey.has(itemKey)) {
        items.push(data_items_byItemKey.get(itemKey));
      }
    }
  }

  return items;
};
