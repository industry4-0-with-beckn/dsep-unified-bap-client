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
    console.log("Payload for Search :: ", JSON.stringify(payload));
    const headers = { "Content-Type": "application/JSON" };

    const searchRes = await axios.post(`${gatewayUrl}/search`, payload, {
      headers
    });
    console.log("Response for Search :: ", JSON.stringify(searchRes?.data));
    const { data } = buildSearchResponse(searchRes.data);
    return { payload, data };
  } catch (error: any) {
    throw error
  }
};

export const selectService = async (body: any) => {
  try {
    const { payload } = buildSelectRequest(body);
    console.log("Payload for Select :: ", JSON.stringify(payload));
    const headers = { "Content-Type": "application/JSON" };

    const selectRes = await axios.post(`${gatewayUrl}/select`, payload, {
      headers
    });
    console.log("Response for Select :: ", JSON.stringify(selectRes?.data));
    const { context, orderDetails } = buildSelectResponse(selectRes.data);
    return { data: { context, orderDetails } };
  } catch (error: any) {
    throw error
  }
};

export const initService = async (body: any) => {
  try {
    const { payload } = buildInitRequest(body);
    console.log("Payload for Init :: ", JSON.stringify(payload));
    const headers = { "Content-Type": "application/JSON" };

    const initRes = await axios.post(`${gatewayUrl}/init`, payload, {
      headers
    });
    console.log("Response for Init :: ", JSON.stringify(initRes?.data));
    const { context, orderDetails } = buildInitResponse(initRes.data);
    return { data: { context, orderDetails }, errorOccured: false };
  } catch (error: any) {
    throw error
  }
};

export const confirmService = async (body: any) => {
  try {
    const { payload } = buildConfirmRequest(body);
    console.log("Payload for Confirm :: ", JSON.stringify(payload));
    const headers = { "Content-Type": "application/JSON" };

    const confirmRes = await axios.post(`${gatewayUrl}/confirm`, payload, {
      headers
    });
    console.log("Response for Confirm :: ", JSON.stringify(confirmRes?.data));
    const { context, orderDetails } = buildConfirmResponse(confirmRes.data);
    return { data: { context, orderDetails }, errorOccured: false };
  } catch (error: any) {
    throw error
  }
};

export const statusService = async (body: any) => {
  try {
    const { payload } = buildStatusRequest(body);
    console.log("Payload for Status :: ", JSON.stringify(payload));
    const headers = { "Content-Type": "application/JSON" };

    const statusRes = await axios.post(`${gatewayUrl}/status`, payload, {
      headers
    });
    console.log("Response for Status :: ", JSON.stringify(statusRes?.data));
    const { context, order } = buildStatusResponse(statusRes.data);
    return { data: { context, order }, errorOccured: false };
  } catch (error: any) {
    throw error
  }
};

export const cancelService = async (body: any) => {
  try {
    const { payload } = buildCancelRequest(body);
    console.log("Payload for Cancel :: ", JSON.stringify(payload));
    const headers = { "Content-Type": "application/JSON" };

    const cancelRes = await axios.post(`${gatewayUrl}/cancel`, payload, {
      headers
    });
    console.log("Response for Cancel :: ", JSON.stringify(cancelRes?.data));
    const { context, orderDetails } = buildCancelResponse(cancelRes.data);
    return { data: { context, orderDetails }, errorOccured: false };
  } catch (error: any) {
    throw error
  }
};

export const updateService = async (body: any) => {
  try {
    const { payload } = buildUpdateRequest(body);
    console.log("Payload for Update :: ", JSON.stringify(payload));
    const headers = { "Content-Type": "application/JSON" };

    const updateRes = await axios.post(`${gatewayUrl}/update`, payload, {
      headers
    });
    console.log("Response for Update :: ", JSON.stringify(updateRes?.data));
    const { context, orderDetails } = buildUpdateResponse(updateRes.data);
    return { data: { context, orderDetails }, errorOccured: false };
  } catch (error: any) {
    throw error
  }
};

export const supportService = async (body: any) => {
  try {
    const { payload } = buildSupportRequest(body);
    console.log("Payload for Support :: ", JSON.stringify(payload));
    const headers = { "Content-Type": "application/JSON" };

    const supportRes = await axios.post(`${gatewayUrl}/support`, payload, {
      headers
    });
    console.log("Response for Support :: ", JSON.stringify(supportRes?.data));
    const { context, orderDetails, supportDetails } = buildSupportResponse(
      supportRes.data
    );
    return {
      data: { context, orderDetails, supportDetails },
      errorOccured: false
    };
  } catch (error: any) {
    throw error
  }
};

export const ratingService = async (body: any) => {
  try {
    const { payload } = buildRatingRequest(body);
    console.log("Payload for Rating :: ", JSON.stringify(payload));
    const headers = { "Content-Type": "application/JSON" };

    const ratingRes = await axios.post(`${gatewayUrl}/rating`, payload, {
      headers
    });
    console.log("Response for Rating :: ", JSON.stringify(ratingRes?.data));
    const { context, message } = buildRatingResponse(ratingRes.data);
    return { data: { context, message }, errorOccured: false };
  } catch (error: any) {
    throw error
  }
};

export const trackService = async (body: any) => {
  try {
    const { payload } = buildTrackRequest(body);
    console.log("Payload for Track :: ", JSON.stringify(payload));
    const headers = { "Content-Type": "application/JSON" };

    const trackRes = await axios.post(`${gatewayUrl}/track`, payload, {
      headers
    });
    console.log("Response for Track :: ", JSON.stringify(trackRes?.data));
    const { context, trackingDetails } = buildTrackResponse(trackRes.data);
    return { data: { context, trackingDetails }, errorOccured: false };
  } catch (error: any) {
    throw error
  }
};
