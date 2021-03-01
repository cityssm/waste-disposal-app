import type * as recordTypes from "../types/recordTypes";
import type * as fileDefinitions from "@cityssm/waste-disposal-data/fileDefinitions";
export declare const refreshAll: () => Promise<void>;
export declare const getItems: (searchStr: string) => recordTypes.ItemSearchResult[];
export declare const getItemByItemKey: (itemKey: string) => recordTypes.Item;
export declare const getLocationByLocationKey: (locationKey: string) => fileDefinitions.Location;
export declare const getItemLocationsByItemKey: (itemKey: string) => fileDefinitions.Location[];
export declare const getItemReusesByItemKey: (itemKey: string) => fileDefinitions.ItemReuse[];
export declare const getRelatedItemsByItemKey: (itemKey: string) => fileDefinitions.Item[];
