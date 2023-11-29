export interface Ind4assemblyContext {
  domain: string;
  location: {
    country: {      
      code: string;
    };
  };
  action: string;
  bap_id: string;
  bap_uri: string;
  timestamp: string;
  message_id: string;
  version: string;
  ttl: string;
  transaction_id: string;
  bpp_id?: string;
  bpp_uri?: string;
}
