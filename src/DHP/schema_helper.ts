import moment from "moment";
import { v4 as uuid } from "uuid";

interface IContextBuilderInput {
  domain: string;
  action: string;
  city?: string;
  country?: string;
  version?: string;
  bapId?: string;
  bapUri?: string;
  bppId?: string;
  bppUri?: string;
  transactionId?: string;
  messageId?: string;
  timestamp?: string;
}

export const buildContext = (input: IContextBuilderInput) => {
  const context = {
    domain: input?.domain,
    action: input?.action ?? "",
    location: {
      city: {
        name: process.env.CITY || (input?.city ?? ""),
        code: process.env.CITY_CODE
      },
      country: {
        name: process.env.COUNTRY || (input?.country ?? ""),
        code: process.env.COUNTRY_CODE
      }
    },
    version: process.env.CORE_VERSION || (input?.version ?? ""),
    bap_id: process.env.BAP_ID ?? input?.bapId,
    bap_uri: process.env.BAP_URI ?? input?.bapUri,
    bpp_id: input?.bppId,
    bpp_uri: input?.bppUri,
    transaction_id: input?.transactionId ?? uuid(),
    message_id: input?.messageId ?? uuid(),
    timestamp: input.timestamp ?? moment().toISOString(),
    ttl: "P1M"
  };
  return context;
};

export const buildSearchRequest = (body: any) => {
  const context = buildContext({
    domain: body?.context?.domain,
    action: "search"
  });

  let intent: any = {};
  if (body?.categoryId || body?.categoryCode || body?.categoryName) {
    intent = {
      ...intent,
      category: {
        id: body?.categoryId,
        descriptor: {
          name: body?.categoryName,
          code: body?.categoryCode
        }
      }
    };
  }
  if (body?.searchString || body?.searchCode || body?.searchId) {
    intent = {
      ...intent,
      item: {
        id: body?.searchId,
        descriptor: {
          name: body?.searchString,
          code: body?.searchCode
        }
      }
    };
  }
  if (body?.provider) {
    intent = {
      ...intent,
      provider: {
        id: body?.provider?.providerId,
        descriptor: {
          name: body?.provider?.providerName,
          code: body?.provider?.providerCode
        }
      }
    };
  }
  if (body?.location) {
    intent = {
      ...intent,
      location: body?.location
    };
  }

  return {
    payload: { context, message: { intent } }
  };
};
