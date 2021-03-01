import * as fileDefinitions from "@cityssm/waste-disposal-data/fileDefinitions";
export declare type DataFileName = "items.csv" | "locations.csv" | "itemLocations.csv" | "relatedItems.csv" | "itemReuses.csv";
export declare type Item = {
    itemImage?: string;
} & fileDefinitions.Item;
export interface ItemSearchResult {
    itemKey: string;
    itemName: string;
    itemImage: string;
}
