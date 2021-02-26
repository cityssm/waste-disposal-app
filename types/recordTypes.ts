import * as fileDefinitions from "@cityssm/waste-disposal-data/fileDefinitions";


export type DataFileName =
  "items.csv" |
  "locations.csv" |
  "itemLocations.csv" |
  "relatedItems.csv" |
  "itemReuses.csv";


export type Item = {
  itemImage?: string;
} & fileDefinitions.Item;
