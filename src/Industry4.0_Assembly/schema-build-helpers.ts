import moment from "moment";
import { v4 as uuid } from "uuid";
import { MentoringContext } from "./schema";

export const buildContext = (input: any = {}) => {
  const context: MentoringContext = {
    domain: `${process.env.DOMAIN}${input?.category ?? "mentoring"}`,
    action: input.action ?? "",
    bap_id: process.env.BAP_ID || "",
    bap_uri: process.env.BAP_URI || "",
    timestamp: input.timestamp ?? moment().toISOString(),

    message_id: input?.messageId ?? uuid(),
    version: process.env.CORE_VERSION || (input?.core_version ?? ""),
    ttl: "PT10M", // ask Ajay for its significance
    transaction_id: input?.transactionId ?? uuid()
  };
  if (input?.bppId) {
    context.bpp_id = input?.bppId;
  }
  if (input?.bppUri) {
    context.bpp_uri = input?.bppUri;
  }
  return context;
};

export const buildOnSearchMergedResponse = async (
  response: any = {},
  body: any = {}
) => {
  return buildSearchResponse(
    response.searchRes,
    body,
    response?.itemRes?.[0]?.data?.mentorship,
    response?.itemRes?.[1]?.data?.mentorship
  );
};

export const buildSearchRequest = (input: any = {}) => {
  const context = buildContext({
    action: "search",
    category: "mentoring"
  });

  const intent: any = {};
  const optional: any = {};

  if (input?.sessionTitle?.key) {
    intent.item = {
      descriptor: {
        name: input?.sessionTitle?.key
      }
    };
  }
  if (input?.mentor?.name) {
    intent.agent = {
      person: {
        name: input?.mentor?.name
      }
    };
  }

  if (input?.loggedInUserEmail) {
    optional.user = { email: input?.loggedInUserEmail };
  }

  return { payload: { context, message: { intent } }, optional };
};

export const buildSearchResponse = (
  response: any = {},
  body: any = {},
  savedItems = [],
  appliedItems = []
) => {
  const bpps_response = response?.data?.responses;
  if (!bpps_response) return { status: 200 };
  const finalData = bpps_response.map((bpp_response: any) => {
    const {
      transaction_id: transactionId,
      message_id: messageId,
      bpp_id: bppId,
      bpp_uri: bppUri
    }: any = bpp_response?.context ?? {};
    const context = { transactionId, messageId, bppId, bppUri };

    const { providers } = bpp_response.message?.catalog;

    const mentorshipProviders = providers?.map((provider: any) => ({
      id: provider?.id,
      code: provider?.descriptor?.code,
      name: provider?.descriptor?.name,
      description: provider?.descriptor?.short_desc,

      mentorships: provider?.items?.map((item: any) => ({
        id: item?.id,
        code: item?.descriptor?.code,
        name: item?.descriptor?.name,
        description: item?.descriptor?.short_desc,
        longDescription: item?.descriptor?.long_desc,

        imageLocations: item?.descriptor?.images?.map(
          (image: any) => image?.url
        ),
        categories: provider?.categories
          ?.filter((category: any) =>
            item?.category_ids?.find(
              (categoryId: any) => categoryId == category?.id
            )
          )
          ?.map((category: any) => ({
            id: category?.id,
            code: category?.descriptor?.code,
            name: category?.descriptor?.name
          })),
        available: item?.quantity?.available?.count,
        allocated: item?.quantity?.allocated?.count,
        price: item?.price?.value,
        userSavedItem: !!savedItems?.find(
          (savedItem: any) => savedItem?.mentorship_id == item?.id
        ),
        userAppliedItem: !!appliedItems?.find(
          (appliedItem: any) => appliedItem?.mentorship_id == item?.id
        ),
        mentorshipSessions: provider?.fulfillments
          ?.filter((fulfillment: any) =>
            item?.fulfillment_ids?.find(
              (fulfillmentId: any) => fulfillmentId == fulfillment?.id
            )
          )
          ?.map((fulfillment: any) => ({
            id: fulfillment?.id,
            language: fulfillment?.language?.[0],
            timingStart: fulfillment?.time?.range?.start,
            timingEnd: fulfillment?.time?.range?.end,
            type: fulfillment?.type,
            status: fulfillment?.tags?.find(
              (tag: any) => tag?.descriptor?.code == "status"
            )?.list?.[0]?.descriptor?.name,
            timezone: fulfillment?.tags?.find(
              (tag: any) => tag?.descriptor?.code == "timeZone"
            )?.list?.[0]?.descriptor?.name,
            userSavedItem: !!savedItems?.find(
              (savedItem: any) =>
                savedItem?.mentorshipSession_id == fulfillment?.id
            ),
            userAppliedItem: !!appliedItems?.find(
              (appliedItem: any) =>
                appliedItem?.mentorshipSession_id == fulfillment?.id
            ),
            mentor: {
              id: fulfillment?.agent?.person?.id,
              name: fulfillment?.agent?.person?.name,
              gender: fulfillment?.agent?.person?.gender,
              image: fulfillment?.agent?.person?.image,
              rating: fulfillment?.agent?.person?.rating,
              aboutMentor: item?.tags
                ?.find((tag: any) => tag?.descriptor?.code == "about_mentor")
                ?.list?.find(
                  (li: any) => li?.descriptor?.code == "about_mentor"
                )?.descriptor?.name,
              qualification: item?.tags
                ?.find((tag: any) => tag?.descriptor?.code == "qualification")
                ?.list?.find(
                  (li: any) => li?.descriptor?.code == "qualification"
                )?.descriptor?.name,
              experience: item?.tasg
                ?.find(
                  (tag: any) =>
                    tag?.descriptor?.code == "professional_experience"
                )
                ?.list?.find(
                  (li: any) => li?.descriptor?.code == "professional_experience"
                )?.descriptor?.name,
              totalMeetings: item?.tags
                ?.find((tag: any) => tag?.descriptor?.code == "total_meetings")
                ?.list?.find(
                  (li: any) => li?.descriptor?.code == "total_meetings"
                )?.descriptor?.name,
              specialisation: item?.tags
                ?.find((tag: any) => tag?.descriptor?.code == "specialist_in")
                ?.list?.find(
                  (li: any) => li?.descriptor?.code == "specialist_in"
                )?.descriptor?.name
            }
          })),
        recommendedFor: item?.tags
          ?.find((tag: any) => tag?.code == "recommended_for")
          ?.list?.map((li: any) => ({
            recommendationForCode: li?.descriptor?.code,
            recommendationForName: li?.descriptor?.name
          }))
      }))
    }));
    return { context, mentorshipProviders };
  });
  return { data: finalData };
};

export const buildSavedAppliedCategoryResponse = (
  savedResponse: any = {},
  appliedResponse: any = {}
) => {
  const savedInput = savedResponse?.data?.mentorship;
  const appliedInput = appliedResponse?.data?.mentorship;

  const mentorMap: any = {
    saved: {},
    applied: {}
  };

  if (savedResponse?.data) {
    savedInput.forEach(({ mentorship_id, mentorshipSession_id }: any) => {
      mentorMap["saved"][mentorship_id] = true;
      if (mentorshipSession_id) {
        mentorMap["saved"][mentorship_id] = {};
        mentorMap["saved"][mentorship_id][mentorshipSession_id] = true;
      }
    });
  }

  if (appliedResponse?.data) {
    appliedInput.forEach(({ mentorship_id, mentorshipSession_id }: any) => {
      mentorMap["applied"][mentorship_id] = true;
      if (mentorshipSession_id) {
        mentorMap["applied"][mentorship_id] = {};
        mentorMap["applied"][mentorship_id][mentorshipSession_id] = true;
      }
    });
  }

  return mentorMap;
};

export const buildSelectRequest = (input: any = {}) => {
  const context = buildContext({
    ...input?.context,
    action: "select",
    category: "mentoring"
  });
  const message = { order: { item: { id: input?.mentorshipId } } };

  return { payload: { context, message } };
};
export const buildSelectResponse = (response: any = {}, body: any = {}) => {
  const input = response?.data?.responses?.[0];
  if (!input) return { status: 200 };

  const {
    transaction_id: transactionId,
    message_id: messageId,
    bpp_id: bppId,
    bpp_uri: bppUri
  }: any = input?.context ?? {};
  const context = { transactionId, messageId, bppId, bppUri };

  const provider = input.message?.order?.provider;

  const mentorshipProvider = {
    id: provider?.id,
    code: provider?.descriptor?.code,
    name: provider?.descriptor?.name,
    description: provider?.descriptor?.short_desc,

    mentorships: provider?.items?.map((item: any) => ({
      id: item?.id,
      code: item?.descriptor?.code,
      name: item?.descriptor?.name,
      description: item?.descriptor?.short_desc,
      longDescription: item?.descriptor?.long_desc,

      imageLocations: item?.descriptor?.images?.map((image: any) => image?.url),
      categories: provider?.categories
        ?.filter((category: any) =>
          item?.category_ids?.find(
            (categoryId: any) => categoryId == category?.id
          )
        )
        ?.map((category: any) => ({
          id: category?.id,
          code: category?.descriptor?.code,
          name: category?.descriptor?.name
        })),
      available: item?.quantity?.available?.count,
      allocated: item?.quantity?.allocated?.count,
      price: item?.price?.value,
      mentorshipSessions: provider?.fulfillments
        ?.filter((fulfillment: any) =>
          item?.fulfillment_ids?.find(
            (fulfillmentId: any) => fulfillmentId == fulfillment?.id
          )
        )
        ?.map((fulfillment: any) => ({
          id: fulfillment?.id,
          language: fulfillment?.language?.[0],
          timingStart: fulfillment?.time?.range?.start,
          timingEnd: fulfillment?.time?.range?.end,
          type: fulfillment?.type,
          status: fulfillment?.tags?.find(
            (tag: any) => tag?.descriptor?.code == "status"
          )?.list?.[0]?.descriptor?.name,
          timezone: fulfillment?.tags?.find(
            (tag: any) => tag?.descriptor?.code == "timeZone"
          )?.list?.[0]?.descriptor?.name,
          mentor: {
            id: fulfillment?.agent?.person?.id,
            name: fulfillment?.agent?.person?.name,
            gender: fulfillment?.agent?.person?.gender,
            image: fulfillment?.agent?.person?.image,
            rating: fulfillment?.agent?.person?.rating,
            aboutMentor: item?.tags
              ?.find((tag: any) => tag?.descriptor?.code == "about_mentor")
              ?.list?.find((li: any) => li?.descriptor?.code == "about_mentor")
              ?.descriptor?.name,
            qualification: item?.tags
              ?.find((tag: any) => tag?.descriptor?.code == "qualification")
              ?.list?.find((li: any) => li?.descriptor?.code == "qualification")
              ?.descriptor?.name,
            experience: item?.tags
              ?.find(
                (tag: any) => tag?.descriptor?.code == "professional_experience"
              )
              ?.list?.find(
                (li: any) => li?.descriptor?.code == "professional_experience"
              )?.descriptor?.name,
            totalMeetings: item?.tags
              ?.find((tag: any) => tag?.descriptor?.code == "total_meetings")
              ?.list?.find(
                (li: any) => li?.descriptor?.code == "total_meetings"
              )?.descriptor?.name,
            specialisation: item?.tags
              ?.find((tag: any) => tag?.descriptor?.code == "specialist_in")
              ?.list?.find((li: any) => li?.descriptor?.code == "specialist_in")
              ?.descriptor?.name
          }
        })),
      recommendedFor: item?.tags
        ?.find((tag: any) => tag?.descriptor?.code == "recommended_for")
        ?.list?.map((li: any) => ({
          recommendationForCode: li?.descriptor?.code,
          recommendationForName: li?.descriptor?.name
        }))
    }))
  };

  return { data: { context, mentorshipProvider } };
};

export const buildConfirmRequest = (input: any = {}) => {
  const context = buildContext({
    ...input?.context,
    category: "mentoring",
    action: "confirm"
  });

  const message = {
    order: {
      items: [
        {
          id: input?.mentorshipId
        }
      ],
      fulfillments: [
        {
          id: input?.mentorshipSessionId
        }
      ],
      billing: input?.billing
    }
  };

  return { payload: { context, message } };
};

export const buildConfirmResponse = (response: any = {}, body: any = {}) => {
  const input = response?.data?.responses?.[0];
  if (!input) return { status: 200 };

  const {
    transaction_id: transactionId,
    message_id: messageId,
    bpp_id: bppId,
    bpp_uri: bppUri
  }: any = input?.context ?? {};
  const context = { transactionId, messageId, bppId, bppUri };

  const order = input?.message?.order;

  const mentorshipApplicationId = order?.id;
  const mentorshipSession = {
    id: order?.fulfillments?.[0]?.id,
    sessionJoinLinks: order?.fulfillments?.[0]?.tags
      ?.find((tag: any) => tag?.descriptor?.code == "joinLink")
      ?.list?.map((li: any) => ({
        id: li?.descriptor?.code,
        link: li?.descriptor?.name
      })),
    language: order?.fulfillments?.[0]?.language?.[0],
    timingStart: order?.fulfillments?.[0]?.time?.range?.start,
    timingEnd: order?.fulfillments?.[0]?.time?.range?.end,
    type: order?.fulfillments?.[0]?.type,
    status: order?.fulfillments?.[0]?.tags?.find(
      (tag: any) => tag?.descriptor?.code == "status"
    )?.list?.[0]?.descriptor?.name,
    timezone: order?.fulfillments?.[0]?.tags?.find(
      (tag: any) => tag?.descriptor?.code == "timeZone"
    )?.list?.[0]?.descriptor?.name,
    mentor: {
      id: order?.fulfillments?.[0]?.agent?.person?.id,
      name: order?.fulfillments?.[0]?.agent?.person?.name,
      gender: order?.fulfillments?.[0]?.agent?.person?.gender,
      image: order?.fulfillments?.[0]?.agent?.person?.image,
      rating: order?.fulfillments?.[0]?.agent?.person?.rating
    }
  };

  return { data: { original: input, context, mentorshipApplicationId, mentorshipSession } };
};

export const buildStatusRequest = (input: any = {}) => {
  const context = buildContext({
    ...input?.context,
    action: "status",
    category: "mentoring"
  });

  const message = {
    order_id: input?.mentorshipApplicationId
  };

  return { payload: { context, message } };
};

export const buildStatusResponse = (response: any = {}, body: any = {}) => {
  const input = response?.data?.responses?.[0];
  if (!input) return { status: 200 };

  const {
    transaction_id: transactionId,
    message_id: messageId,
    bpp_id: bppId,
    bpp_uri: bppUri
  }: any = input?.context ?? {};
  const context = { transactionId, messageId, bppId, bppUri };

  const order = input.message?.order;
  const provider = order?.provider;

  const mentorshipApplicationId = order?.id;
  const mentorshipApplicationStatus = order?.state;

  const mentorshipProvider = {
    id: provider?.id,
    code: provider?.descriptor?.code,
    name: provider?.descriptor?.name,
    description: provider?.descriptor?.short_desc,

    mentorships: provider?.items?.map((item: any) => ({
      id: item?.id,
      code: item?.descriptor?.code,
      name: item?.descriptor?.name,
      description: item?.descriptor?.short_desc,
      longDescription: item?.descriptor?.long_desc,

      imageLocations: item?.descriptor?.images?.map((image: any) => image?.url),
      categories: provider?.categories
        ?.filter((category: any) =>
          item?.category_ids?.find(
            (categoryId: any) => categoryId == category?.id
          )
        )
        ?.map((category: any) => ({
          id: category?.id,
          code: category?.descriptor?.code,
          name: category?.descriptor?.name
        })),
      available: item?.quantity?.available?.count,
      allocated: item?.quantity?.allocated?.count,
      price: item?.price?.value,
      mentorshipSessions: provider?.fulfillments
        ?.filter((fulfillment: any) =>
          item?.fulfillment_ids?.find(
            (fulfillmentId: any) => fulfillmentId == fulfillment?.id
          )
        )
        ?.map((fulfillment: any) => ({
          id: fulfillment?.id,
          language: fulfillment?.language?.[0],
          timingStart: fulfillment?.time?.range?.start,
          timingEnd: fulfillment?.time?.range?.end,
          type: fulfillment?.type,
          status: fulfillment?.tags?.find(
            (tag: any) => tag?.descriptor?.code == "status"
          )?.list?.[0]?.descriptor?.name,
          timezone: fulfillment?.tags?.find(
            (tag: any) => tag?.descriptor?.code == "timeZone"
          )?.list?.[0]?.descriptor?.name,
          mentor: {
            id: fulfillment?.agent?.person?.id,
            name: fulfillment?.agent?.person?.name,
            gender: fulfillment?.agent?.person?.gender,
            image: fulfillment?.agent?.person?.image,
            rating: fulfillment?.agent?.person?.rating,
            aboutMentor: item?.tags
              ?.find((tag: any) => tag?.descriptor?.code == "about_mentor")
              ?.list?.find((li: any) => li?.descriptor?.code == "about_mentor")
              ?.descriptor?.name,
            qualification: item?.tags
              ?.find((tag: any) => tag?.descriptor?.code == "qualification")
              ?.list?.find((li: any) => li?.descriptor?.code == "qualification")
              ?.descriptor?.name,
            experience: item?.tags
              ?.find(
                (tag: any) => tag?.descriptor?.code == "professional_experience"
              )
              ?.list?.find(
                (li: any) => li?.descriptor?.code == "professional_experience"
              )?.descriptor?.name,
            totalMeetings: item?.tags
              ?.find((tag: any) => tag?.descriptor?.code == "total_meetings")
              ?.list?.find(
                (li: any) => li?.descriptor?.code == "total_meetings"
              )?.descriptor?.name,
            specialisation: item?.tags
              ?.find((tag: any) => tag?.descriptor?.code == "specialist_in")
              ?.list?.find((li: any) => li?.descriptor?.code == "specialist_in")
              ?.descriptor?.name
          }
        })),
      recommendedFor: item?.tags
        ?.find((tag: any) => tag?.descriptor?.code == "recommended_for")
        ?.list?.map((li: any) => ({
          recommendationForCode: li?.descriptor?.code,
          recommendationForName: li?.descriptor?.name
        }))
    }))
  };

  return {
    data: {
      context,
      mentorshipApplicationId,
      mentorshipApplicationStatus,
      mentorshipProvider
    }
  };
};

export const buildCancelRequest = (input: any = {}) => {
  const context = buildContext({
    ...input.context,
    action: "cancel",
    category: "mentoring"
  });

  let message: any = { order_id: input?.mentorshipApplicationId };
  if (input?.mentorshipCancellationReasonId) {
    message = {
      ...message,
      cancellation_reason_id: `${input?.mentorshipCancellationReasonId}`
    };
  }
  if (input?.mentorshipCancellationReason) {
    message = {
      ...message,
      descriptor: { name: input?.mentorshipCancellationReason }
    };
  }
  return { payload: { context, message } };
};
export const buildCancelResponse = (response: any = {}, input: any = {}) => {
  const context = {
    transactionId: response?.responses[0]?.context?.transaction_id,
    bppId: response?.responses[0]?.context?.bpp_id,
    bppUri: response?.responses[0]?.context?.bpp_uri
  };

  const mentorshipApplicationId = response?.responses[0]?.message?.order?.id;

  return { context, mentorshipApplicationId };
};

export const buildInitRequest = (input: any = {}) => {
  const context = buildContext({
    ...input.context,
    action: "init",
    category: "mentoring"
  });

  const message: any = {
    order: {
      items: [{ id: input?.mentorshipId }],
      fulfillments: [
        {
          id: input?.mentorshipSessionId
        }
      ],
      billing: input?.billing
    }
  };

  return { payload: { context, message } };
};
export const buildInitResponse = (response: any = {}, body: any = {}) => {
  const input = response?.data?.responses?.[0];
  if (!input) return { status: 200 };

  const {
    transaction_id: transactionId,
    message_id: messageId,
    bpp_id: bppId,
    bpp_uri: bppUri
  }: any = input?.context ?? {};
  const context = { transactionId, messageId, bppId, bppUri };

  const provider = input.message?.order?.provider;

  const mentorshipProvider = {
    id: provider?.id,
    code: provider?.descriptor?.code,
    name: provider?.descriptor?.name,
    description: provider?.descriptor?.short_desc,

    mentorships: provider?.items?.map((item: any) => ({
      id: item?.id,
      code: item?.descriptor?.code,
      name: item?.descriptor?.name,
      description: item?.descriptor?.short_desc,
      longDescription: item?.descriptor?.long_desc,

      imageLocations: item?.descriptor?.images?.map((image: any) => image?.url),
      categories: provider?.categories
        ?.filter((category: any) =>
          item?.category_ids?.find(
            (categoryId: any) => categoryId == category?.id
          )
        )
        ?.map((category: any) => ({
          id: category?.id,
          code: category?.descriptor?.code,
          name: category?.descriptor?.name
        })),
      available: item?.quantity?.available?.count,
      allocated: item?.quantity?.allocated?.count,
      price: item?.price?.value,
      mentorshipSessions: provider?.fulfillments
        ?.filter((fulfillment: any) =>
          item?.fulfillment_ids?.find(
            (fulfillmentId: any) => fulfillmentId == fulfillment?.id
          )
        )
        ?.map((fulfillment: any) => ({
          id: fulfillment?.id,
          language: fulfillment?.language?.[0],
          timingStart: fulfillment?.time?.range?.start,
          timingEnd: fulfillment?.time?.range?.end,
          type: fulfillment?.type,
          status: fulfillment?.tags?.find(
            (tag: any) => tag?.descriptor?.code == "status"
          )?.list?.[0]?.descriptor?.name,
          timezone: fulfillment?.tags?.find(
            (tag: any) => tag?.descriptor?.code == "timeZone"
          )?.list?.[0]?.descriptor?.name,
          mentor: {
            id: fulfillment?.agent?.person?.id,
            name: fulfillment?.agent?.person?.name,
            gender: fulfillment?.agent?.person?.gender,
            image: fulfillment?.agent?.person?.image,
            rating: fulfillment?.agent?.person?.rating,
            aboutMentor: item?.tags
              ?.find((tag: any) => tag?.descriptor?.code == "about_mentor")
              ?.list?.find((li: any) => li?.descriptor?.code == "about_mentor")
              ?.descriptor?.name,
            qualification: item?.tags
              ?.find((tag: any) => tag?.descriptor?.code == "qualification")
              ?.list?.find((li: any) => li?.descriptor?.code == "qualification")
              ?.descriptor?.name,
            experience: item?.tags
              ?.find(
                (tag: any) => tag?.descriptor?.code == "professional_experience"
              )
              ?.list?.find(
                (li: any) => li?.descriptor?.code == "professional_experience"
              )?.descriptor?.name,
            totalMeetings: item?.tags
              ?.find((tag: any) => tag?.descriptor?.code == "total_meetings")
              ?.list?.find(
                (li: any) => li?.descriptor?.code == "total_meetings"
              )?.descriptor?.name,
            specialisation: item?.tags
              ?.find((tag: any) => tag?.descriptor?.code == "specialist_in")
              ?.list?.find((li: any) => li?.descriptor?.code == "specialist_in")
              ?.descriptor?.name
          }
        })),
      recommendedFor: item?.tags
        ?.find((tag: any) => tag?.descriptor?.code == "recommended_for")
        ?.list?.map((li: any) => ({
          recommendationForCode: li?.descriptor?.code,
          recommendationForName: li?.descriptor?.name
        }))
    }))
  };

  return { data: { context, mentorshipProvider } };
};

export const buildTrackRequest = (input: any = {}) => {
  const context = buildContext({
    category: "mentoring",
    action: "track",
    bppId: input?.context?.bpp_id,
    bppUri: input?.context?.bpp_uri,
    transactionId: input?.context?.transactionId
  });

  const message = {
    order_id: input?.message?.order_id
  };
  return { payload: { context, message } };
};
export const buildTrackResponse = (input: any = {}) => {
  const response = input?.responses[0];
  const {
    transaction_id: transactionId,
    message_id: messageId,
    bpp_id: bppId,
    bpp_uri: bppUri
  }: any = response?.context ?? {};
  const context = { transactionId, messageId, bppId, bppUri };
  return { context, message: response?.message ?? {} };
};

export const buildSupportRequest = (input: any = {}) => {
  const context = buildContext({
    category: "mentoring",
    action: "support",
    bppId: input?.context?.bpp_id,
    bppUri: input?.context?.bpp_uri,
    transactionId: input?.context?.transactionId
  });
  const message = {
    ref_id: input?.message?.ref_id
  };
  return { payload: { context, message } };
};
export const buildSupportResponse = (input: any = {}) => {
  const response = input?.responses[0];
  const {
    transaction_id: transactionId,
    message_id: messageId,
    bpp_id: bppId,
    bpp_uri: bppUri
  }: any = response?.context ?? {};

  const context = { transactionId, messageId, bppId, bppUri };
  return { context, message: response?.message ?? {} };
};

export const buildRatingRequest = (input: any = {}) => {
  const context = buildContext({
    category: "mentoring",
    action: "rating",
    bppId: input?.context?.bpp_id,
    bppUri: input?.context?.bpp_uri,
    transactionId: input?.context?.transactionId
  });
  const message = {
    id: input?.message?.id,
    rating_category: input?.message?.rating_category,
    value: input?.message?.value
  };
  return { payload: { context, message } };
};

export const buildRatingResponse = (input: any = {}) => {
  const response = input?.responses[0];
  const {
    transaction_id: transactionId,
    message_id: messageId,
    bpp_id: bppId,
    bpp_uri: bppUri
  }: any = response?.context ?? {};
  const context = { transactionId, messageId, bppId, bppUri };
  return { data: { context, message: response?.message ?? {} } };
};
