"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelatedItemsByItemKey = exports.getItemReusesByItemKey = exports.getItemLocationsByItemKey = exports.getLocationByLocationKey = exports.getItemByItemKey = exports.getItems = exports.refreshAll = void 0;
const path = require("path");
const node_fetch_1 = require("node-fetch");
const Papa = require("papaparse");
const configFns = require("./configFns");
const debug = require("debug");
const log = debug("waste-disposal-app:itemDataCache");
const itemImages = configFns.getProperty("itemImages");
let data_items_sorted = [];
let data_items_byItemKey = new Map();
let data_itemLocations_byItemKey = new Map();
let data_relatedItems_byItemKey = new Map();
let data_itemReuses_byItemKey = new Map();
let data_locations_byLocationKey = new Map();
const loadData_items = (rows) => {
    const items = new Map();
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
        }
        else if (itemNameA > itemNameB) {
            return 1;
        }
        return 0;
    });
};
const loadData_itemLocations = (rows) => {
    const itemLocations = new Map();
    for (const row of rows) {
        if (itemLocations.has(row.itemKey)) {
            itemLocations.get(row.itemKey).push(row.locationKey);
        }
        else {
            itemLocations.set(row.itemKey, [row.locationKey]);
        }
    }
    data_itemLocations_byItemKey = itemLocations;
};
const loadData_relatedItems = (rows) => {
    const relatedItems = new Map();
    for (const row of rows) {
        if (relatedItems.has(row.itemKeyA)) {
            relatedItems.get(row.itemKeyA).push(row.itemKeyB);
        }
        else {
            relatedItems.set(row.itemKeyA, [row.itemKeyB]);
        }
        if (relatedItems.has(row.itemKeyB)) {
            relatedItems.get(row.itemKeyB).push(row.itemKeyA);
        }
        else {
            relatedItems.set(row.itemKeyB, [row.itemKeyA]);
        }
    }
    data_relatedItems_byItemKey = relatedItems;
};
const loadData_itemReuses = (rows) => {
    const itemReuses = new Map();
    for (const row of rows) {
        if (itemReuses.has(row.itemKey)) {
            itemReuses.get(row.itemKey).push(row);
        }
        else {
            itemReuses.set(row.itemKey, [row]);
        }
    }
    data_itemReuses_byItemKey = itemReuses;
};
const loadData_locations = (rows) => {
    const locations = new Map();
    for (const row of rows) {
        locations.set(row.locationKey, row);
    }
    data_locations_byLocationKey = locations;
};
const loadData = async (fileName, loadRemoteFile) => {
    log(fileName + ", remote = " + (loadRemoteFile ? "true" : "false"));
    let input;
    if (loadRemoteFile) {
        const response = await node_fetch_1.default(configFns.getProperty("wasteDisposalData.remoteRootFolder") + "/" + fileName);
        input = await response.text();
    }
    else {
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
                        loadData_items(results.data);
                        break;
                    case "locations.csv":
                        loadData_locations(results.data);
                        break;
                    case "itemLocations.csv":
                        loadData_itemLocations(results.data);
                        break;
                    case "relatedItems.csv":
                        loadData_relatedItems(results.data);
                        break;
                    case "itemReuses.csv":
                        loadData_itemReuses(results.data);
                        break;
                }
            }
        });
    }
    catch (e) {
        log(e);
        if (loadRemoteFile) {
            await loadData(fileName, false);
        }
    }
};
const refreshAll = async () => {
    log("Refreshing all data files");
    await loadData("items.csv", true);
    await loadData("locations.csv", true);
    await loadData("itemLocations.csv", true);
    await loadData("relatedItems.csv", true);
    await loadData("itemReuses.csv", true);
};
exports.refreshAll = refreshAll;
const getItems = (searchStr) => {
    const searchStrPieces = searchStr.toLowerCase().split(" ");
    const resultItems = [];
    for (const item of data_items_sorted) {
        let includeItem = true;
        const itemNameLowerCase = item.itemName.toLowerCase();
        const shortDescriptionLowerCase = item.shortDescription.toLowerCase();
        for (const searchStrPiece of searchStrPieces) {
            if (!itemNameLowerCase.includes(searchStrPiece) &&
                !item.searchTerms.includes(searchStrPiece) &&
                !shortDescriptionLowerCase.includes(searchStrPiece)) {
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
exports.getItems = getItems;
const getItemByItemKey = (itemKey) => {
    return data_items_byItemKey.get(itemKey);
};
exports.getItemByItemKey = getItemByItemKey;
const getLocationByLocationKey = (locationKey) => {
    return data_locations_byLocationKey.get(locationKey);
};
exports.getLocationByLocationKey = getLocationByLocationKey;
const getItemLocationsByItemKey = (itemKey) => {
    const locationKeys = data_itemLocations_byItemKey.get(itemKey);
    const locations = [];
    if (locationKeys) {
        for (const locationKey of locationKeys) {
            if (data_locations_byLocationKey.has(locationKey)) {
                locations.push(data_locations_byLocationKey.get(locationKey));
            }
        }
    }
    return locations;
};
exports.getItemLocationsByItemKey = getItemLocationsByItemKey;
const getItemReusesByItemKey = (itemKey) => {
    return data_itemReuses_byItemKey.get(itemKey);
};
exports.getItemReusesByItemKey = getItemReusesByItemKey;
const getRelatedItemsByItemKey = (itemKey) => {
    const itemKeys = data_relatedItems_byItemKey.get(itemKey);
    const items = [];
    if (itemKeys) {
        for (const itemKey of itemKeys) {
            if (data_items_byItemKey.has(itemKey)) {
                items.push(data_items_byItemKey.get(itemKey));
            }
        }
    }
    return items;
};
exports.getRelatedItemsByItemKey = getRelatedItemsByItemKey;
