import type * as configTypes from "../types/configTypes";


/*
 * LOAD CONFIGURATION
 */

import { config } from "../data/config";


/*
 * SET UP FALLBACK VALUES
 */


const configFallbackValues = new Map<string, any>();

configFallbackValues.set("application.httpPort", 51057);
configFallbackValues.set("application.applicationName", "Waste Disposal App");

configFallbackValues.set("reverseProxy.disableCompression", false);
configFallbackValues.set("reverseProxy.disableEtag", false);
configFallbackValues.set("reverseProxy.blockViaXForwardedFor", false);
configFallbackValues.set("reverseProxy.urlPrefix", "");

configFallbackValues.set("wasteDisposalData.remoteRootFolder", "https://cityssm.github.io/waste-disposal-data/data");

configFallbackValues.set("itemImages", {});


export function getProperty(propertyName: "application.applicationName"): string;
export function getProperty(propertyName: "application.httpPort"): number;
export function getProperty(propertyName: "application.https"): configTypes.Config_HTTPS;

export function getProperty(propertyName: "reverseProxy.disableCompression"): boolean;
export function getProperty(propertyName: "reverseProxy.disableEtag"): boolean;
export function getProperty(propertyName: "reverseProxy.blockViaXForwardedFor"): boolean;
export function getProperty(propertyName: "reverseProxy.urlPrefix"): "";

export function getProperty(propertyName: "wasteDisposalData.remoteRootFolder"): string;

export function getProperty(propertyName: "itemImages"): configTypes.Config_ItemImages;


export function getProperty(propertyName: string): any {

  const propertyNameSplit = propertyName.split(".");

  let currentObj = config;

  for (let index = 0; index < propertyNameSplit.length; index += 1) {

    currentObj = currentObj[propertyNameSplit[index]];

    if (!currentObj) {
      return configFallbackValues.get(propertyName);
    }
  }

  return currentObj;
}
