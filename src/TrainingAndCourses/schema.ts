export interface ITrainingNetworkContext {
  transaction_id: string;
  message_id: string;
  action: string;
  timestamp: string;
  location: {
    city: {
      name: string;
      code: string;
    };
    country: {
      name: string;
      code: string;
    };
  };
  version: string;
  bap_uri: string;
  bap_id: string;
  domain: string;
  bpp_id: string;
  bpp_uri: string;
}
