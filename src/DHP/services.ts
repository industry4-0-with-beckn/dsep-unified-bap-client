import {
  buildSearchRequest,
  buildSearchResponse,
  buildSelectRequest,
  buildSelectResponse,
  buildInitRequest,
  buildInitResponse,
  buildConfirmRequest,
  buildConfirmResponse,
  buildStatusRequest,
  buildStatusResponse,
  buildCancelRequest,
  buildCancelResponse,
  buildUpdateRequest,
  buildUpdateResponse,
  buildSupportRequest,
  buildSupportResponse,
  buildRatingResponse,
  buildRatingRequest,
  buildTrackRequest,
  buildTrackResponse
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

export const selectService = async (body: any) => {
  try {
    const { payload } = buildSelectRequest(body);
    console.log("Payload for Select :==>", JSON.stringify(payload));
    const headers = { "Content-Type": "application/JSON" };

    const selectRes = await axios.post(`${gatewayUrl}/select`, payload, {
      headers
    });
    // console.log("selectRes => ", selectRes.data);
    const { context, orderDetails } = buildSelectResponse(selectRes.data);
    return { data: { context, orderDetails }, errorOccured: false };
  } catch (error: any) {
    console.log(error);
    return {
      status: error?.response?.status || 500,
      message: error?.response?.statusText || "An exception has occurred."
    }
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

export const updateService = async (body: any) => {
  try {
    const { payload } = buildUpdateRequest(body);
    console.log("Payload for BAP Connection:==>", JSON.stringify(payload));
    const headers = { "Content-Type": "application/JSON" };

    const updateRes = await axios.post(`${gatewayUrl}/update`, payload, {
      headers
    });
    const { context, orderDetails } = buildUpdateResponse(updateRes.data);
    return { data: { context, orderDetails }, errorOccured: false };
  } catch (error: any) {
    console.log(error.response.data.error.data.errors);
    return { errorOccured: true, message: error.message };
  }
};

export const supportService = async (body: any) => {
  try {
    const { payload } = buildSupportRequest(body);
    console.log("Payload for BAP Connection:==>", JSON.stringify(payload));
    const headers = { "Content-Type": "application/JSON" };

    const supportRes = await axios.post(`${gatewayUrl}/support`, payload, {
      headers
    });
    const { context, orderDetails, supportDetails } = buildSupportResponse(
      supportRes.data
    );
    return {
      data: { context, orderDetails, supportDetails },
      errorOccured: false
    };
  } catch (error: any) {
    console.log(error.response.data.error.data.errors);
    return { errorOccured: true, message: error.message };
  }
};

export const ratingService = async (body: any) => {
  try {
    const { payload } = buildRatingRequest(body);
    console.log("Payload for BAP Connection:==>", JSON.stringify(payload));
    const headers = { "Content-Type": "application/JSON" };

    const ratingRes = await axios.post(`${gatewayUrl}/rating`, payload, {
      headers
    });
    const { context, message } = buildRatingResponse(ratingRes.data);
    return { data: { context, message }, errorOccured: false };
  } catch (error: any) {
    console.log(error.response.data.error.data.errors);
    return { errorOccured: true, message: error.message };
  }
};

export const trackService = async (body: any) => {
  try {
    const { payload } = buildTrackRequest(body);
    console.log("Payload for BAP Connection:==>", JSON.stringify(payload));
    const headers = { "Content-Type": "application/JSON" };

    const ratingRes = await axios.post(`${gatewayUrl}/track`, payload, {
      headers
    });
    const { context, trackingDetails } = buildTrackResponse(ratingRes.data);
    return { data: { context, trackingDetails }, errorOccured: false };
  } catch (error: any) {
    console.log(error.response.data.error.data.errors);
    return { errorOccured: true, message: error.message };
  }
};
