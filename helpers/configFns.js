"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProperty = void 0;
const config_1 = require("../data/config");
const configFallbackValues = new Map();
configFallbackValues.set("application.httpPort", 51057);
configFallbackValues.set("application.applicationName", "Waste Disposal App");
configFallbackValues.set("reverseProxy.disableCompression", false);
configFallbackValues.set("reverseProxy.disableEtag", false);
configFallbackValues.set("reverseProxy.blockViaXForwardedFor", false);
configFallbackValues.set("reverseProxy.urlPrefix", "");
configFallbackValues.set("wasteDisposalData.remoteRootFolder", "https://cityssm.github.io/waste-disposal-data/data");
configFallbackValues.set("itemImages", {});
function getProperty(propertyName) {
    const propertyNameSplit = propertyName.split(".");
    let currentObj = config_1.config;
    for (let index = 0; index < propertyNameSplit.length; index += 1) {
        currentObj = currentObj[propertyNameSplit[index]];
        if (!currentObj) {
            return configFallbackValues.get(propertyName);
        }
    }
    return currentObj;
}
exports.getProperty = getProperty;
