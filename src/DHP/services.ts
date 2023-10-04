import {
  buildSearchRequest,
  buildSearchResponse,
  buildInitRequest,
  buildInitResponse,
  buildConfirmRequest,
  buildConfirmResponse,
  buildStatusRequest,
  buildStatusResponse,
  buildCancelRequest,
  buildCancelResponse
} from "./schema_helper";
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
    const { data } = buildSearchResponse(searchRes.data);
    return { payload, data };
  } catch (error: any) {
    console.log(error.message);
    return { errorOccured: true, error: error.message };
  }
};

export const initService = async (body: any) => {
  try {
    const { payload } = buildInitRequest(body);
    console.log("Payload for BAP Connection:==>", JSON.stringify(payload));
    const headers = { "Content-Type": "application/JSON" };

    const initRes = await axios.post(`${gatewayUrl}/init`, payload, {
      headers
    });
    const { context, orderDetails } = buildInitResponse(initRes.data);
    return { data: { context, orderDetails }, errorOccured: false };
  } catch (error: any) {
    console.log(error.response.data.error.data.errors);
    return { errorOccured: true, message: error.message };
  }
};

export const confirmService = async (body: any) => {
  try {
    const { payload } = buildConfirmRequest(body);
    console.log("Payload for BAP Connection:==>", JSON.stringify(payload));
    const headers = { "Content-Type": "application/JSON" };

    const initRes = await axios.post(`${gatewayUrl}/confirm`, payload, {
      headers
    });
    const { context, orderDetails } = buildConfirmResponse(initRes.data);
    return { data: { context, orderDetails }, errorOccured: false };
  } catch (error: any) {
    console.log(error);
    return { errorOccured: true, message: error.message };
  }
};

export const statusService = async (body: any) => {
  try {
    const { payload } = buildStatusRequest(body);
    console.log("Payload for BAP Connection:==>", JSON.stringify(payload));
    const headers = { "Content-Type": "application/JSON" };

    const statusRes = await axios.post(`${gatewayUrl}/status`, payload, {
      headers
    });
    const { context, order } = buildStatusResponse(statusRes.data);
    return { data: { context, order }, errorOccured: false };
  } catch (error: any) {
    console.log(error);
    return { errorOccured: true, message: error.message };
  }
};

export const cancelService = async (body: any) => {
  try {
    const { payload } = buildCancelRequest(body);
    console.log("Payload for BAP Connection:==>", JSON.stringify(payload));
    const headers = { "Content-Type": "application/JSON" };

    const statusRes = await axios.post(`${gatewayUrl}/cancel`, payload, {
      headers
    });
    const { context, orderDetails } = buildCancelResponse(statusRes.data);
    return { data: { context, orderDetails }, errorOccured: false };
  } catch (error: any) {
    console.log(error.response.data.error.data.errors);
    return { errorOccured: true, message: error.message };
  }
};
