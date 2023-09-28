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

export const buildSearchResponse = (response: any) => {
  const bppResponse = response?.responses;
  if (!bppResponse || !bppResponse.length) {
    return { status: 200, data: [] };
  }

  const finalData = bppResponse.map((bpp: any) => {
    const {
      transaction_id: transactionId,
      message_id: messageId,
      bpp_id: bppId,
      bpp_uri: bppUri
    }: any = bpp?.context ?? {};

    const context = { transactionId, messageId, bppId, bppUri };
    const platformName = bpp?.message?.catalog?.descriptor?.name;
    const providersArray = bpp?.message?.catalog?.providers ?? [];

    const providers = providersArray?.map((provider: any) => {
      return {
        providerDetails: {
          id: provider?.id,
          name: provider?.descriptor?.name,
          shortDescription: provider?.descriptor?.short_desc,
          image: provider?.descriptor?.images[0]?.url ?? []
        },
        items: provider?.items?.map((item: any) => {
          return {
            itemDetails: {
              id: item?.id,
              name: item?.descriptor?.name,
              code: item?.descriptor?.code,
              shortDesc: item?.descriptor?.short_desc,
              longDesc: item?.descriptor?.longDesc,
              price: item?.price
            },
            categories: item?.category_ids?.map((categoryId: any) => {
              const requiredCategory = provider?.categories?.find(
                (category: any) => category?.id === categoryId
              );
              if (Object.keys(requiredCategory).length) {
                return {
                  id: requiredCategory?.id,
                  name: requiredCategory?.descriptor?.name,
                  code: requiredCategory?.descriptor?.code
                };
              }
            }),
            fullfillments: item?.fulfillment_ids.map((fullfillmentId: any) => {
              const requiredFullfillment = provider?.fulfillments.find(
                (fulfillment: any) => fulfillment?.id === fullfillmentId
              );
              return {
                id: requiredFullfillment?.id,
                type: requiredFullfillment?.type,
                stops: requiredFullfillment?.stops,
                ...(() =>
                  requiredFullfillment?.agent
                    ? {
                        agentDetails: {
                          id: requiredFullfillment?.agent?.person?.id,
                          name: requiredFullfillment?.agent?.person?.name,
                          gender: requiredFullfillment?.agent?.person?.gender,
                          creds: requiredFullfillment?.agent?.person?.creds,
                          languages:
                            requiredFullfillment?.agent?.person?.languages,
                          skills: requiredFullfillment?.agent?.person?.skills
                        }
                      }
                    : {})(),

                tracking: requiredFullfillment?.tracking
              };
            }),
            quantity: item?.quantity,
            tags: item?.tags,
            ...() => {
              item?.location_ids
                ? {
                    locations: item?.location_ids.map((locationId: any) => {
                      const requiredLocation = provider?.locations.find(
                        (location: any) => location?.id === locationId
                      );
                      return requiredLocation;
                    })
                  }
                : {};
            }
          };
        })
      };
    });
    return { context, platformName, providers };
  });
  return { data: finalData };
};
