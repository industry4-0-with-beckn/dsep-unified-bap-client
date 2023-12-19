import {
  buildSearchRequest,
  buildOnSearchMergedResponse,
  buildSearchResponse,
  buildSelectRequest,
  buildSelectResponse,
  buildConfirmRequest,
  buildConfirmResponse,
  buildInitRequest,
  buildInitResponse,
  buildStatusRequest,
  buildStatusResponse,
  buildCancelRequest,
  buildCancelResponse,
  buildTrackRequest,
  buildTrackResponse,
  buildSupportRequest,
  buildSupportResponse,
  buildRatingRequest,
  buildRatingResponse
} from "./schema-build-helpers";
import axiosInstance from "axios";
import https from "https";

import searchMentorShipResp from "./mocks/searchMentorShipReponse.json";
import selectMentorshipResp from "./mocks/selectMentorShipResponse.json";
import confirmMentorShipResponse from "./mocks/confirmMentorShipResponse.json";
import statusMentorShipResponse from "./mocks/statusMentorShipResponse.json";
import cancelMentorShipResponse from "./mocks/cancelMentorShipResponse.json";
import initMentorShipResponse from "./mocks/initMentorShipResponse.json";

const gatewayUrl = process.env.GATEWAY_URL || "";
const mentorshipNetwork = process.env.MENTORSHIP_NETWORK;
const backendApiUrl = process.env.BACKEND_API_BASE_URL;

const axios = axiosInstance.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});
export const searchMentorShipService = async (body: any): Promise<any> => {
  try {
    const { payload, optional } = buildSearchRequest(body);
    console.log(JSON.stringify(payload));


    let searchResponse: any = {};
    
    if (mentorshipNetwork !== "local") {
    

      const headers = { "Content-Type": "application/JSON" };
      const searchRes = await axios.post(`${gatewayUrl}/search`, payload, {
        headers
      });
      const itemRes = await Promise.all([
        optional?.user?.email
          ? axios.get(
              `${backendApiUrl}/user/item/saved/${optional.user.email}`,
              { headers }
            )
          : null,
        optional?.user?.email
          ? axios.get(
              `${backendApiUrl}/user/item/applied/${optional.user.email}`,
              { headers }
            )
          : null
      ])
        .then((res) => res)
        .catch((err) => null);
        
      const res = { searchRes, itemRes };
      searchResponse = buildSearchResponse(
        searchRes,
        body,
        itemRes?.[0]?.data?.mentorship,
        itemRes?.[1]?.data?.mentorship
      );
    } else {
    

      searchResponse = buildSearchResponse(
        { data: searchMentorShipResp },
        body
      );
    }
    // console.log("Search res",searchResponse)
    return searchResponse;
  } catch (error: any) {
    return { error: error, errorOccured: true };
  }
};

export const selectMentorshipService = async (body: any): Promise<any> => {
  try {
    const selectRequest = buildSelectRequest(body);
    // console.log("Select Payload=======>",JSON.stringify(selectRequest?.payload));

    let selectResponse: any = {};
    if (mentorshipNetwork !== "local") {
      const headers = { "Content-Type": "application/JSON" };
      let res = await axios.post(
        `${gatewayUrl}/select`,
        selectRequest.payload,
        { headers }
      );
      // console.log("dank res",res?.data)
      selectResponse = buildSelectResponse(res, body);
      // console.log("Select response=======>",JSON.stringify(body));
    } 
    else {
      selectResponse = buildSelectResponse(
        { data: selectMentorshipResp },
        body
      );
 
    }
    console.log("Select body",JSON.stringify(body))
    return selectResponse;
  } catch (error: any) {
    console.log("error",error)
    return { error: error, errorOccured: true };
  }
};

export const confirmMentorshipService = async (body: any): Promise<any> => {
  try {
    const confirmRequest = buildConfirmRequest(body);
    console.log(JSON.stringify(confirmRequest?.payload));

    let confirmResponse: any = {};
    if (mentorshipNetwork !== "local") {
      const headers = { "Content-Type": "application/JSON" };
      let res = await axios.post(
        `${gatewayUrl}/confirm`,
        confirmRequest.payload,
        { headers }
      );
      confirmResponse = buildConfirmResponse(res, body);
    } else {
      confirmResponse = buildConfirmResponse(
        { data: confirmMentorShipResponse },
        body
      );
    }
    return confirmResponse;
  } catch (error) {
    console.log(error);
    return { error: error, errorOccured: true };
  }
};

export const initMentorshipService = async (body: any): Promise<any> => {
  try {
    const initRequest = buildInitRequest(body);
    console.log("dank init request",JSON.stringify(initRequest?.payload));
    let initResponse: any = {};
    if (mentorshipNetwork !== "local") {
      const headers = { "Content-Type": "application/JSON" };
      let res = await axios.post(`${gatewayUrl}/init`, initRequest.payload, {
        headers
      });
      initResponse = buildInitResponse(res, body);
            console.log("init response=======>",JSON.stringify(initResponse));

    } else {
      initResponse = buildInitResponse({ data: initMentorShipResponse }, body);
    }
    return initResponse;
  } catch (error) {
    console.log("dank error msg",error)
    return { error: error, errorOccured: true };
  }
};

export const statusMentorshipService = async (body: any): Promise<any> => {
  try {
    const statusRequest = buildStatusRequest(body);
    console.log(JSON.stringify(statusRequest?.payload));
    let statusResponse: any = {};
    if (mentorshipNetwork !== "local") {
      const headers = { "Content-Type": "application/JSON" };
      let res = await axios.post(
        `${gatewayUrl}/status`,
        statusRequest.payload,
        { headers }
      );
      statusResponse = buildStatusResponse(res, body);
    } else {
      statusResponse = buildStatusResponse(
        { data: statusMentorShipResponse },
        body
      );
    }

    return statusResponse;
  } catch (error) {
    return { error: error, errorOccured: true };
  }
};

export const cancelMentorshipService = async (body: any): Promise<any> => {
  try {
    const cancelRequest = buildCancelRequest(body);
    console.log(JSON.stringify(cancelRequest));

    let cancelResponse: any = {};

    if (mentorshipNetwork !== "local") {
      const headers = { "Content-Type": "application/JSON" };
      let res = await axios.post(
        `${gatewayUrl}/cancel`,
        cancelRequest.payload,
        { headers }
      );
      cancelResponse = buildCancelResponse(res?.data, body);
    } else {
      cancelResponse = buildCancelResponse(cancelMentorShipResponse, body);
    }
    return { data: cancelResponse };
  } catch (error) {
    return { error: error, errorOccured: true };
  }
};

export const trackMentorshipService = async (body: any): Promise<any> => {
  try {
    const trackRequest = buildTrackRequest(body);
    console.log(JSON.stringify(trackRequest));

    let trackResponse: any = {};

    if (mentorshipNetwork !== "local") {
      const headers = { "Content-Type": "application/JSON" };
      let res = await axios.post(`${gatewayUrl}/track`, trackRequest.payload, {
        headers
      });
      trackResponse = buildTrackResponse(res?.data);
    } else {
      trackResponse = buildTrackResponse(cancelMentorShipResponse);
    }
    return { data: trackResponse };
  } catch (error) {
    return { error: error, errorOccured: true };
  }
};

export const ratingMentorshipService = async (body: any): Promise<any> => {
  try {
    const ratingRequest = buildRatingRequest(body);
    console.log(JSON.stringify(ratingRequest));

    let ratingResponse: any = {};

    if (mentorshipNetwork !== "local") {
      const headers = { "Content-Type": "application/JSON" };
      let res = await axios.post(
        `${gatewayUrl}/rating`,
        ratingRequest.payload,
        {
          headers
        }
      );
      ratingResponse = buildRatingResponse(res?.data);
    } else {
      ratingResponse = buildRatingResponse(cancelMentorShipResponse);
    }
    return { data: ratingResponse };
  } catch (error: any) {
    return { error: error, errorOccured: true };
  }
};
export const supportMentorshipService = async (body: any): Promise<any> => {
  try {
    const supportRequest = buildSupportRequest(body);
    console.log(JSON.stringify(supportRequest));

    let supportResponse: any = {};

    if (mentorshipNetwork !== "local") {
      const headers = { "Content-Type": "application/JSON" };
      let res = await axios.post(
        `${gatewayUrl}/support`,
        supportRequest.payload,
        {
          headers
        }
      );
      supportResponse = buildSupportResponse(res?.data);
    } else {
      supportResponse = buildSupportResponse(cancelMentorShipResponse);
    }
    return { data: supportResponse };
  } catch (error) {
    return { error: error, errorOccured: true };
  }
};
