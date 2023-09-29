import axiosInstance from "axios";
import https from "https";
import {
  buildSearchRequest,
  buildOnSearchMergedResponse,
  buildSearchResponse,
  buildInitRequest,
  buildInitResponse,
  buildConfirmRequest,
  buildConfirmResponse,
  buildStatusRequest,
  buildStatusResponse,
  buildSelectRequest,
  buildSelectResponse
} from "./schema-build-helper";
import searchScholarshipResponse from "./mocks/searchScholarshipResponse.json";
import initScholarshipResponse from "./mocks/initScholarshipResponse.json";
import confirmScholarshipReponse from "./mocks/confirmScholarshipReponse.json";
import statusScholarshipReponse from "./mocks/statusScholarshipReponse.json";
import selectScholarshipResponse from "./mocks/selectScholarshipResponse.json";

const gatewayUrl = process.env.GATEWAY_URL || "";
const scholarshipNetwork = process.env.SCHOLARSHIP_NETWORK;
const backendApiUrl = process.env.BACKEND_API_BASE_URL;

const axios = axiosInstance.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

export const searchScholarshipService = async (body: any): Promise<any> => {
  try {
    const { payload, optional } = buildSearchRequest(body);
    console.log(JSON.stringify(payload));

    let searchResponse: any = {};
    if (scholarshipNetwork !== "local") {
      const headers = { "Content-Type": "application/JSON" };
      console.log("Sending Request to " + `${gatewayUrl}/search`);
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
      searchResponse = buildOnSearchMergedResponse(res, body);
    } else {
      searchResponse = buildSearchResponse(
        { data: searchScholarshipResponse },
        body
      );
    }

    return searchResponse;
  } catch (error) {
    return { error: error, errorOccured: true };
  }
};

export const selectScholarshipService = async (body: any): Promise<any> => {
  try {
    const selectRequest = buildSelectRequest(body);
    console.log(JSON.stringify(selectRequest.payload));

    let selectResponse: any = {};
    if (scholarshipNetwork !== "local") {
      const headers = { "Content-Type": "application/JSON" };
      let res = await axios.post(
        `${gatewayUrl}/select`,
        selectRequest.payload,
        {
          headers
        }
      );
      selectResponse = buildSelectResponse(res, body);
    } else {
      selectResponse = buildSelectResponse(
        { data: selectScholarshipResponse },
        body
      );
    }

    return selectResponse;
  } catch (error) {
    return { error: error, errorOccured: true };
  }
};

export const initScholarshipService = async (body: any): Promise<any> => {
  try {
    const initRequest = buildInitRequest(body);

    console.log(JSON.stringify(initRequest.payload));

    let initResponse: any = {};
    if (scholarshipNetwork !== "local") {
      const headers = { "Content-Type": "application/JSON" };
      let res = await axios.post(`${gatewayUrl}/init`, initRequest.payload, {
        headers
      });
      initResponse = buildInitResponse(res?.data, body);
    } else {
      initResponse = buildInitResponse(initScholarshipResponse, body);
    }

    return { data: initResponse };
  } catch (error: any) {
    return { error: error, errorOccured: true };
  }
};

export const confirmScholarshipService = async (body: any): Promise<any> => {
  try {
    const confirmRequest = buildConfirmRequest(body);

    console.log(JSON.stringify(confirmRequest.payload));

    let confirmResponse: any = {};
    if (scholarshipNetwork !== "local") {
      const headers = { "Content-Type": "application/JSON" };
      let res = await axios.post(
        `${gatewayUrl}/confirm`,
        confirmRequest.payload,
        { headers }
      );
      confirmResponse = buildConfirmResponse(res?.data, body);
    } else {
      confirmResponse = buildConfirmResponse(
        confirmScholarshipReponse,
        body
      );
    }

    return { data: confirmResponse };
  } catch (error: any) {
    return { error: error, errorOccured: true };
  }
};

export const statusScholarshipService = async (body: any): Promise<any> => {
  try {
    const statusRequest = buildStatusRequest(body);
    console.log(JSON.stringify(statusRequest.payload));

    let statusResponse: any = {};
    if (scholarshipNetwork !== "local") {
      const headers = { "Content-Type": "application/JSON" };
      let res = await axios.post(
        `${gatewayUrl}/status`,
        statusRequest.payload,
        { headers }
      );
      statusResponse = buildStatusResponse(res, body);
    } else {
      statusResponse = buildStatusResponse(
        { data: statusScholarshipReponse },
        body
      );
    }

    return statusResponse;
  } catch (error) {
    return { error: error, errorOccured: true };
  }
};
