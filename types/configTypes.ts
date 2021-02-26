export interface Config {

  application?: {
    applicationName?: string;
    httpPort?: number;
    https?: Config_HTTPS;
  };

  reverseProxy?: {
    disableCompression: boolean;
    disableEtag: boolean;
    urlPrefix: string;
  };

  wasteDisposalData?: {
    remoteRootFolder: string;
  };

  itemImages?: Config_ItemImages;
}


export interface Config_HTTPS {
  port: number;
  keyPath: string;
  certPath: string;
  passphrase?: string;
}


export interface Config_ItemImages {
  [itemKey: string]: string;
};
