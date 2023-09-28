import { buildContext, buildSearchRequest } from "./schema_helper";
import axios from "axios";

const gatewayUrl = process.env.GATEWAY_URL;
export const searchService = async (body: any) => {
  try {
    const { payload } = buildSearchRequest(body);
    console.log("Payload for BAP Connection:==>", JSON.stringify(payload));
    const headers = { "Content-Type": "application/JSON" };

    const searchRes = await axios.post(`${gatewayUrl}/search`, payload, {
      headers
    });
    return { payload, searchRes: searchRes.data };
  } catch (error: any) {
    console.log(error);
  }
};
