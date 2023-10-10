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

export const buildRequestContext = (input: IContextBuilderInput) => {
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

const buildResponseContext = (input: any) => {
  const context = {
    transactionId: input?.transaction_id,
    messageId: input?.message_id,
    bppId: input?.bpp_id,
    bppUri: input?.bpp_uri
  };
  return context;
};

export const buildSearchRequest = (body: any) => {
  const context = buildRequestContext({
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

export const buildSelectRequest = (body: any) => {
  const context = buildRequestContext({
    domain: body?.context?.domain,
    action: "select",
    transactionId: body?.context?.transactionId,
    messageId: body?.context?.messageId,
    bppId: body?.context?.bppId,
    bppUri: body?.context?.bppUri
  });

  const message = {
    order: {
      provider: { id: body?.providerId },
      items: body?.items
    }
  };

  return {
    payload: { context, message }
  };
};

export const buildSelectResponse = (body: any) => {
  const { context = {}, message = {} } = body?.responses[0];
  console.log("context ==> ", context);
  const respcontext = buildResponseContext(context);
  let order: any = {};

  if (message?.order?.provider) {
    order = {
      ...order,
      providerDetails: {
        id: message?.order?.provider?.id,
        name: message?.order?.provider?.descriptor?.name,
        shortDescription: message?.order?.provider?.descriptor?.short_desc,
        image: message?.order?.provider?.descriptor?.images[0]?.url
        // image: message?.order?.provider?.descriptor?.images?.map((image: any) => ({
        //   url: image?.url,
        //   size: image?.size_type
        // }))
      }
    };
  }

  if (message?.order?.items && message?.order?.items.length) {
    let items: any[] = message?.order?.items?.map((item: any) => {
      return {
        itemDetails: {
          id: item?.id,
          code: item?.descriptor?.code,
          name: item?.descriptor?.name,
          shortDesc: item?.descriptor?.short_desc,
          longDesc: item?.descriptor?.long_desc,
          price: item?.price
        },
        ...(() => {
          if (item?.quantity) {
            return {
              quantity: item?.quantity?.selected?.measure
            };
          }
          return {};
        })(),
        xinput: item?.xinput,
        ...(() => {
          if (item?.fulfillment_ids?.length) {
            return {
              fulfillments: item?.fulfillment_ids.map((id: any) => {
                const matchedFulfillment = message?.order?.fulfillments.find(
                  (fulfillment: any) => fulfillment?.id === id
                );
                return {
                  id: matchedFulfillment?.id,
                  type: matchedFulfillment?.type,
                  tracking: matchedFulfillment?.tracking,
                  ...(() => {
                    let nestedObj: any = {};
                    if (matchedFulfillment?.stops) {
                      nestedObj = {
                        ...nestedObj,
                        stops: matchedFulfillment?.stops.map((stop: any) => ({
                          type: stop?.type,
                          time: stop?.time?.timestamp,
                          location: stop?.location?.gps
                        }))
                      };
                    }
                    if (matchedFulfillment?.state) {
                      nestedObj = {
                        ...nestedObj,
                        state: matchedFulfillment?.state?.descriptor
                      };
                    }
                    if (matchedFulfillment?.customer) {
                      nestedObj = {
                        ...nestedObj,
                        customer: matchedFulfillment?.customer
                      };
                    }
                    if (matchedFulfillment?.agent) {
                      nestedObj = {
                        ...nestedObj,
                        agent: matchedFulfillment?.agent
                      };
                    }
                    return nestedObj;
                  })()
                };
              })
            };
          }
          return {};
        })()
      };
    });
    order = {
      ...order,
      items
    };
  }
  
  order = {
    ...order,
    quote: message?.order?.quote
  };
  return { context: respcontext, orderDetails: order };
}

export const buildInitRequest = (body: any) => {
  const reqOrderDetails = body?.orderDetails || {};
  let context = buildRequestContext({
    domain: body?.context?.domain,
    action: "init",
    transactionId: body?.context?.transactionId,
    messageId: body?.context?.messageId,
    bppId: body?.context?.bppId,
    bppUri: body?.context?.bppUri
  });
  let order: any = {};
  if (reqOrderDetails?.providerId) {
    order = {
      ...order,
      provider: {
        id: reqOrderDetails?.providerId
      }
    };
  }
  if (reqOrderDetails?.items && reqOrderDetails?.items?.length) {
    order = {
      ...order,
      items: reqOrderDetails?.items?.map((item: any) => ({
        id: item?.id,
        ...(() => {
          if (item?.quantity) {
            return { quantity: { selected: { measure: item?.quantity } } };
          }
        })()
      }))
    };
  }
  if (reqOrderDetails?.billingDetails) {
    order = {
      ...order,
      billing: reqOrderDetails?.billingDetails
    };
  }
  if (
    reqOrderDetails?.fullfillmentDetails &&
    reqOrderDetails?.fullfillmentDetails.length
  ) {
    order = {
      ...order,
      fulfillments: reqOrderDetails?.fullfillmentDetails.map(
        (fulfillment: any) => {
          let mappedFulfillment: any = {
            id: fulfillment?.id
          };
          if (fulfillment?.customerDetails) {
            mappedFulfillment = {
              ...mappedFulfillment,
              customer: {
                person: fulfillment?.customerDetails?.person,
                contact: fulfillment?.customerDetails?.contact
              }
            };
          }
          if (fulfillment?.stops && fulfillment?.stops?.length) {
            mappedFulfillment = {
              ...mappedFulfillment,
              stops: fulfillment.stops.map((stop: any) => ({
                type: stop?.type,
                location: { gps: stop?.location }
              }))
            };
          }

          return mappedFulfillment;
        }
      )
    };
  }
  if (reqOrderDetails?.docs && reqOrderDetails?.docs.length) {
    order = {
      ...order,
      docs: reqOrderDetails.docs.map((doc: any) => ({
        descriptor: {
          code: doc?.code,
          name: doc?.name,
          short_desc: doc?.shortDesc
        },
        mime_type: doc?.mimeType,
        url: doc?.url
      }))
    };
  }
  return {
    payload: { context, message: { order } }
  };
};

export const buildInitResponse = (body: any) => {
  const { context = {}, message = {} } = body?.responses[0];
  const respcontext = buildResponseContext(context);
  let order: any = {};
  if (message?.order?.provider) {
    order = {
      ...order,
      providerDetails: {
        id: message?.order?.provider?.id,
        name: message?.order?.provider?.descriptor?.name,
        shortDescription: message?.order?.provider?.descriptor?.short_desc,
        image: message?.order?.provider?.descriptor?.images[0]?.url
      }
    };
  }
  if (message?.order?.items && message?.order?.items.length) {
    let items: any[] = message?.order?.items?.map((item: any) => {
      return {
        itemDetails: {
          id: item?.id,
          code: item?.descriptor?.code,
          name: item?.descriptor?.name,
          shortDesc: item?.descriptor?.short_desc,
          longDesc: item?.descriptor?.long_desc,
          price: item?.price
        },
        ...(() => {
          if (item?.quantity) {
            return {
              quantity: item?.quantity?.selected?.measure
            };
          }
          return {};
        })(),
        xinput: item?.xinput,
        ...(() => {
          if (item?.fulfillment_ids?.length) {
            return {
              fulfillments: item?.fulfillment_ids.map((id: any) => {
                const matchedFulfillment = message?.order?.fulfillments.find(
                  (fulfillment: any) => fulfillment?.id === id
                );
                return {
                  id: matchedFulfillment?.id,
                  type: matchedFulfillment?.type,
                  ...(() => {
                    let nestedObj: any = {};
                    if (matchedFulfillment?.stops) {
                      nestedObj = {
                        ...nestedObj,
                        stops: matchedFulfillment?.stops.map((stop: any) => ({
                          type: stop?.type,
                          time: stop?.time?.timestamp,
                          location: stop?.location?.gps
                        }))
                      };
                    }
                    if (matchedFulfillment?.state) {
                      nestedObj = {
                        ...nestedObj,
                        state: matchedFulfillment?.state?.descriptor
                      };
                    }
                    if (matchedFulfillment?.customer) {
                      nestedObj = {
                        ...nestedObj,
                        customer: matchedFulfillment?.customer
                      };
                    }
                    if (matchedFulfillment?.agent) {
                      nestedObj = {
                        ...nestedObj,
                        agent: matchedFulfillment?.agent
                      };
                    }
                    return nestedObj;
                  })()
                };
              })
            };
          }
          return {};
        })()
      };
    });
    order = {
      ...order,
      items
    };
  }
  order = {
    ...order,
    quote: message?.order?.quote,
    billing: message?.order?.billing,
    payments: message?.order?.payments,
    cancellationTerms: message?.order?.cancellation_terms
  };
  return { context: respcontext, orderDetails: order };
};

export const buildConfirmRequest = (body: any) => {
  const { orderDetails } = body;
  let context = buildRequestContext({
    domain: body?.context?.domain,
    action: "confirm",
    transactionId: body?.context?.transactionId,
    messageId: body?.context?.messageId,
    bppId: body?.context?.bppId,
    bppUri: body?.context?.bppUri
  });
  let order: any = {};
  if (orderDetails?.providerId) {
    order = {
      ...order,
      provider: {
        id: orderDetails?.providerId
      }
    };
  }
  if (orderDetails?.items && orderDetails?.items?.length) {
    order = {
      ...order,
      items: orderDetails?.items?.map((item: any) => ({
        id: item?.id,
        xinput: item?.xinput,
        ...(() => {
          if (item?.quantity) {
            return { quantity: { selected: { measure: item?.quantity } } };
          }
        })()
      }))
    };
  }
  if (orderDetails?.billingDetails) {
    order = {
      ...order,
      billing: orderDetails?.billingDetails
    };
  }
  if (
    orderDetails?.fullfillmentDetails &&
    orderDetails?.fullfillmentDetails.length
  ) {
    order = {
      ...order,
      fulfillments: orderDetails?.fullfillmentDetails.map(
        (fulfillment: any) => {
          let mappedFulfillment: any = {
            id: fulfillment?.id
          };
          if (fulfillment?.customerDetails) {
            mappedFulfillment = {
              ...mappedFulfillment,
              customer: {
                person: fulfillment?.customerDetails?.person,
                contact: fulfillment?.customerDetails?.contact
              }
            };
          }
          if (fulfillment?.stops && fulfillment?.stops?.length) {
            mappedFulfillment = {
              ...mappedFulfillment,
              stops: fulfillment.stops.map((stop: any) => ({
                type: stop?.type,
                location: { gps: stop?.location }
              }))
            };
          }

          return mappedFulfillment;
        }
      )
    };
  }
  if (orderDetails?.docs && orderDetails?.docs.length) {
    order = {
      ...order,
      docs: orderDetails.docs.map((doc: any) => ({
        descriptor: {
          code: doc?.code,
          name: doc?.name,
          short_desc: doc?.shortDesc
        },
        mime_type: doc?.mimeType,
        url: doc?.url
      }))
    };
  }
  if (orderDetails?.payments) {
    order = {
      ...order,
      payments: orderDetails?.payments
    };
  }
  if (orderDetails?.payments) {
    order = {
      ...order,
      payments: orderDetails?.payments
    };
  }
  return {
    payload: { context, message: { order } }
  };
};

export const buildConfirmResponse = (body: any) => {
  const { context = {}, message = {} } = body?.responses[0];
  const respcontext = buildResponseContext(context);
  let order: any = {
    orderId: message?.order?.id
  };
  if (message?.order?.provider) {
    order = {
      ...order,
      providerDetails: {
        id: message?.order?.provider?.id,
        name: message?.order?.provider?.descriptor?.name,
        shortDescription: message?.order?.provider?.descriptor?.short_desc,
        image: message?.order?.provider?.descriptor?.images[0]?.url
      }
    };
  }
  if (message?.order?.items && message?.order?.items.length) {
    let items: any[] = message?.order?.items?.map((item: any) => {
      return {
        itemDetails: {
          id: item?.id,
          code: item?.descriptor?.code,
          name: item?.descriptor?.name,
          shortDesc: item?.descriptor?.short_desc,
          longDesc: item?.descriptor?.long_desc,
          price: item?.price
        },
        ...(() => {
          if (item?.quantity) {
            return {
              quantity: item?.quantity?.selected?.measure
            };
          }
          return {};
        })(),
        xinput: item?.xinput,
        ...(() => {
          if (item?.fulfillment_ids?.length) {
            return {
              fulfillments: item?.fulfillment_ids.map((id: any) => {
                const matchedFulfillment = message?.order?.fulfillments.find(
                  (fulfillment: any) => fulfillment?.id === id
                );
                return {
                  id: matchedFulfillment?.id,
                  type: matchedFulfillment?.type,
                  ...(() => {
                    let nestedObj: any = {};
                    if (matchedFulfillment?.stops) {
                      nestedObj = {
                        ...nestedObj,
                        stops: matchedFulfillment?.stops.map((stop: any) => ({
                          type: stop?.type,
                          time: stop?.time?.timestamp,
                          location: stop?.location?.gps
                        }))
                      };
                    }
                    if (matchedFulfillment?.state) {
                      nestedObj = {
                        ...nestedObj,
                        state: matchedFulfillment?.state?.descriptor
                      };
                    }
                    if (matchedFulfillment?.customer) {
                      nestedObj = {
                        ...nestedObj,
                        customer: matchedFulfillment?.customer
                      };
                    }
                    if (matchedFulfillment?.agent) {
                      nestedObj = {
                        ...nestedObj,
                        agent: matchedFulfillment?.agent
                      };
                    }
                    return nestedObj;
                  })()
                };
              })
            };
          }
          return {};
        })()
      };
    });
    order = {
      ...order,
      items
    };
  }
  order = {
    ...order,
    quote: message?.order?.quote,
    billing: message?.order?.billing,
    payments: message?.order?.payments,
    cancellationTerms: message?.order?.cancellation_terms
  };
  return { context: respcontext, orderDetails: order };
};

export const buildStatusRequest = (body: any) => {
  const { orderDetails } = body;
  let context = buildRequestContext({
    domain: body?.context?.domain,
    action: "status",
    transactionId: body?.context?.transactionId,
    messageId: body?.context?.messageId,
    bppId: body?.context?.bppId,
    bppUri: body?.context?.bppUri
  });

  return {
    payload: { context, message: { order_id: orderDetails?.orderId } }
  };
};

export const buildStatusResponse = (body: any) => {
  const { context = {}, message = {} } = body?.responses[0];
  const respcontext = buildResponseContext(context);
  let order: any = {
    orderId: message?.order?.id
  };
  if (message?.order?.provider) {
    order = {
      ...order,
      providerDetails: {
        id: message?.order?.provider?.id,
        name: message?.order?.provider?.descriptor?.name,
        shortDescription: message?.order?.provider?.descriptor?.short_desc,
        image: message?.order?.provider?.descriptor?.images[0]?.url
      }
    };
  }
  if (message?.order?.items && message?.order?.items.length) {
    let items: any[] = message?.order?.items?.map((item: any) => {
      return {
        itemDetails: {
          id: item?.id,
          code: item?.descriptor?.code,
          name: item?.descriptor?.name,
          shortDesc: item?.descriptor?.short_desc,
          longDesc: item?.descriptor?.long_desc,
          price: item?.price
        },
        ...(() => {
          if (item?.quantity) {
            return {
              quantity: item?.quantity?.selected?.measure
            };
          }
          return {};
        })(),
        xinput: item?.xinput,
        ...(() => {
          if (item?.fulfillment_ids?.length) {
            return {
              fulfillments: item?.fulfillment_ids.map((id: any) => {
                const matchedFulfillment = message?.order?.fulfillments.find(
                  (fulfillment: any) => fulfillment?.id === id
                );
                return {
                  id: matchedFulfillment?.id,
                  type: matchedFulfillment?.type,
                  ...(() => {
                    let nestedObj: any = {};
                    if (matchedFulfillment?.stops) {
                      nestedObj = {
                        ...nestedObj,
                        stops: matchedFulfillment?.stops.map((stop: any) => ({
                          type: stop?.type,
                          time: stop?.time?.timestamp,
                          location: stop?.location?.gps
                        }))
                      };
                    }
                    if (matchedFulfillment?.state) {
                      nestedObj = {
                        ...nestedObj,
                        state: matchedFulfillment?.state?.descriptor
                      };
                    }
                    if (matchedFulfillment?.customer) {
                      nestedObj = {
                        ...nestedObj,
                        customer: matchedFulfillment?.customer
                      };
                    }
                    if (matchedFulfillment?.agent) {
                      nestedObj = {
                        ...nestedObj,
                        agent: matchedFulfillment?.agent
                      };
                    }
                    return nestedObj;
                  })()
                };
              })
            };
          }
          return {};
        })()
      };
    });
    order = {
      ...order,
      items
    };
  }
  order = {
    ...order,
    quote: message?.order?.quote,
    billing: message?.order?.billing,
    payments: message?.order?.payments,
    cancellationTerms: message?.order?.cancellation_terms
  };
  return { context: respcontext, order };
};

export const buildCancelRequest = (body: any) => {
  const { orderDetails = {}, cancellationDetails = {} } = body;
  let message: any = {};
  let context = buildRequestContext({
    domain: body?.context?.domain,
    action: "cancel",
    transactionId: body?.context?.transactionId,
    messageId: body?.context?.messageId,
    bppId: body?.context?.bppId,
    bppUri: body?.context?.bppUri
  });

  if (orderDetails?.orderId) {
    message = { ...message, order_id: orderDetails?.orderId };
  }
  if (cancellationDetails?.cancellationReasonId) {
    message = {
      ...message,
      cancellation_reason_id: cancellationDetails?.cancellationReasonId
    };
  }
  if (
    cancellationDetails?.description &&
    Object.keys(cancellationDetails?.description).length
  ) {
    message = {
      ...message,
      descriptor: {
        short_desc: cancellationDetails?.description?.shortDesc,
        long_desc: cancellationDetails?.description?.longDesc
      }
    };
  }
  return {
    payload: { context, message }
  };
};

export const buildCancelResponse = (body: any) => {
  const { context = {}, message = {} } = body?.responses[0];
  const respcontext = buildResponseContext(context);
  let orderDetails: any = {
    orderId: message?.order?.id
  };
  if (message?.order?.provider) {
    orderDetails = {
      ...orderDetails,
      providerDetails: {
        id: message?.order?.provider?.id,
        name: message?.order?.provider?.descriptor?.name,
        shortDescription: message?.order?.provider?.descriptor?.short_desc,
        image: message?.order?.provider?.descriptor?.images[0]?.url
      }
    };
  }
  if (message?.order?.status) {
    orderDetails = {
      ...orderDetails,
      status: message?.order?.status
    };
  }
  if (message?.order?.items && message?.order?.items.length) {
    let items: any[] = message?.order?.items?.map((item: any) => {
      return {
        itemDetails: {
          id: item?.id,
          code: item?.descriptor?.code,
          name: item?.descriptor?.name,
          shortDesc: item?.descriptor?.short_desc,
          longDesc: item?.descriptor?.long_desc,
          price: item?.price
        },
        ...(() => {
          if (item?.quantity) {
            return {
              quantity: item?.quantity?.selected?.measure
            };
          }
          return {};
        })(),
        xinput: item?.xinput,
        ...(() => {
          if (item?.fulfillment_ids?.length) {
            return {
              fulfillments: item?.fulfillment_ids.map((id: any) => {
                const matchedFulfillment = message?.order?.fulfillments.find(
                  (fulfillment: any) => fulfillment?.id === id
                );
                return {
                  id: matchedFulfillment?.id,
                  type: matchedFulfillment?.type,
                  ...(() => {
                    let nestedObj: any = {};
                    if (matchedFulfillment?.stops) {
                      nestedObj = {
                        ...nestedObj,
                        stops: matchedFulfillment?.stops.map((stop: any) => ({
                          type: stop?.type,
                          time: stop?.time?.timestamp,
                          location: stop?.location?.gps
                        }))
                      };
                    }
                    if (matchedFulfillment?.state) {
                      nestedObj = {
                        ...nestedObj,
                        state: matchedFulfillment?.state?.descriptor
                      };
                    }
                    if (matchedFulfillment?.customer) {
                      nestedObj = {
                        ...nestedObj,
                        customer: matchedFulfillment?.customer
                      };
                    }
                    if (matchedFulfillment?.agent) {
                      nestedObj = {
                        ...nestedObj,
                        agent: matchedFulfillment?.agent
                      };
                    }
                    return nestedObj;
                  })()
                };
              })
            };
          }
          return {};
        })()
      };
    });
    orderDetails = {
      ...orderDetails,
      items
    };
  }
  orderDetails = {
    ...orderDetails,
    quote: message?.order?.quote,
    billing: message?.order?.billing,
    payments: message?.order?.payments,
    cancellationTerms: message?.order?.cancellation_terms
  };
  return { context: respcontext, orderDetails };
};

export const buildSupportRequest = (body: any) => {
  const { orderDetails = {}, contactDetails = {} } = body;
  let message: any = {};
  let support: any = {};
  let context = buildRequestContext({
    domain: body?.context?.domain,
    action: "support",
    transactionId: body?.context?.transactionId,
    messageId: body?.context?.messageId,
    bppId: body?.context?.bppId,
    bppUri: body?.context?.bppUri
  });

  support = {
    ...support,
    order_id: orderDetails?.orderId,
    phone: contactDetails?.phone,
    email: contactDetails?.email
  };

  return {
    payload: { context, message: { support } }
  };
};

export const buildSupportResponse = (body: any) => {
  const { context = {}, message = {} } = body?.responses[0];
  const respcontext = buildResponseContext(context);
  let orderDetails: any = {
    orderId: message?.support?.order_id
  };

  return {
    context: respcontext,
    orderDetails,
    supportDetails: {
      phone: message?.support?.phone,
      email: message?.support?.email,
      url: message?.support?.url
    }
  };
};

export const buildRatingRequest = (body: any) => {
  const { ratingDetails = [] } = body;

  let context = buildRequestContext({
    domain: body?.context?.domain,
    action: "rating",
    transactionId: body?.context?.transactionId,
    messageId: body?.context?.messageId,
    bppId: body?.context?.bppId,
    bppUri: body?.context?.bppUri
  });
  let ratings = [];
  if (ratingDetails && ratingDetails.length) {
    ratings = ratingDetails.map((detail: any) => ({
      id: detail?.id,
      rating_category: detail?.ratingCategory
    }));
  }

  return {
    payload: { context, message: { ratings } }
  };
};

export const buildRatingResponse = (body: any) => {
  const { context = {}, message = {} } = body?.responses[0];
  const respcontext = buildResponseContext(context);
  let feedbackForm: any = message?.feedback_form;

  return { context: respcontext, message: { feedbackForm } };
};

export const buildTrackRequest = (body: any) => {
  const { orderDetails = {}, callbackURL = "" } = body;

  let context = buildRequestContext({
    domain: body?.context?.domain,
    action: "track",
    transactionId: body?.context?.transactionId,
    messageId: body?.context?.messageId,
    bppId: body?.context?.bppId,
    bppUri: body?.context?.bppUri
  });

  return {
    payload: {
      context,
      message: {
        order_id: orderDetails?.orderId,
        ...(() => {
          if (callbackURL) {
            return { callback_url: callbackURL };
          } else return {};
        })()
      }
    }
  };
};

export const buildTrackResponse = (body: any) => {
  const { context = {}, message = {} } = body?.responses[0];
  const respcontext = buildResponseContext(context);
  let trackingDetails: any = {};
  if (message?.tracking && Object.keys(message?.tracking).length) {
    trackingDetails = (() => {
      return {
        ...message?.tracking,
        location: {
          name: message?.tracking?.location?.descriptor?.name,
          locationGps: message?.tracking?.location?.gps
        }
      };
    })();
  }

  return { context: respcontext, trackingDetails };
};

export const buildUpdateRequest = (body: any) => {
  const reqOrderDetails = body?.orderDetails || {};
  let context = buildRequestContext({
    domain: body?.context?.domain,
    action: "update",
    transactionId: body?.context?.transactionId,
    messageId: body?.context?.messageId,
    bppId: body?.context?.bppId,
    bppUri: body?.context?.bppUri
  });
  let order: any = {};
  if (reqOrderDetails?.orderId) {
    order = {
      ...order,
      id: reqOrderDetails?.orderId
    };
  }
  if (reqOrderDetails?.billingDetails) {
    order = {
      ...order,
      billing: reqOrderDetails?.billingDetails
    };
  }

  return {
    payload: { context, message: { 
      update_target: reqOrderDetails?.update_target,
      order 
    } }
  };
};

export const buildUpdateResponse = (body: any) => {
  const { context = {}, message = {} } = body?.responses[0];
  const respcontext = buildResponseContext(context);
  let order: any = {};
  if (message?.order?.provider) {
    order = {
      ...order,
      providerDetails: {
        id: message?.order?.provider?.id,
        name: message?.order?.provider?.descriptor?.name,
        shortDescription: message?.order?.provider?.descriptor?.short_desc,
        image: message?.order?.provider?.descriptor?.images[0]?.url
      }
    };
  }
  if (message?.order?.items && message?.order?.items.length) {
    let items: any[] = message?.order?.items?.map((item: any) => {
      return {
        itemDetails: {
          id: item?.id,
          code: item?.descriptor?.code,
          name: item?.descriptor?.name,
          shortDesc: item?.descriptor?.short_desc,
          longDesc: item?.descriptor?.long_desc,
          price: item?.price
        },
        ...(() => {
          if (item?.quantity) {
            return {
              quantity: item?.quantity?.selected?.measure
            };
          }
          return {};
        })(),
        xinput: item?.xinput,
        ...(() => {
          if (item?.fulfillment_ids?.length) {
            return {
              fulfillments: item?.fulfillment_ids.map((id: any) => {
                const matchedFulfillment = message?.order?.fulfillments.find(
                  (fulfillment: any) => fulfillment?.id === id
                );
                return {
                  id: matchedFulfillment?.id,
                  type: matchedFulfillment?.type,
                  ...(() => {
                    let nestedObj: any = {};
                    if (matchedFulfillment?.stops) {
                      nestedObj = {
                        ...nestedObj,
                        stops: matchedFulfillment?.stops.map((stop: any) => ({
                          type: stop?.type,
                          time: stop?.time?.timestamp,
                          location: stop?.location?.gps
                        }))
                      };
                    }
                    if (matchedFulfillment?.state) {
                      nestedObj = {
                        ...nestedObj,
                        state: matchedFulfillment?.state?.descriptor
                      };
                    }
                    if (matchedFulfillment?.customer) {
                      nestedObj = {
                        ...nestedObj,
                        customer: matchedFulfillment?.customer
                      };
                    }
                    if (matchedFulfillment?.agent) {
                      nestedObj = {
                        ...nestedObj,
                        agent: matchedFulfillment?.agent
                      };
                    }
                    return nestedObj;
                  })()
                };
              })
            };
          }
          return {};
        })()
      };
    });
    order = {
      ...order,
      items
    };
  }

  order = {
    ...order,
    orderId: message?.order?.id,
    quote: message?.order?.quote,
    billing: message?.order?.billing,
    payments: message?.order?.payments,
    docs: message?.order?.docs?.map((doc: any) => {
      return {
        docName: doc?.descriptor?.name,
        shortDesc: doc?.descriptor?.short_desc,
        code: doc?.descriptor?.code,
        mime_type: doc?.mime_type,
        url: doc?.url
      }
    }),
    type: message?.order?.type
  };
  return { context: respcontext, orderDetails: order };
};
