import moment from "moment";
import { v4 as uuid } from "uuid";
import { Ind4assemblyContext } from "./schema";
export const buildContext = (input: any = {}) => {
  // console.log("===>===>===>",input)
  const context: Ind4assemblyContext = {
    domain: `${process.env.DOMAIN}assembly`,
    
    // domain: input.domain,
    location: {
      country: {
        code: process.env.COUNTRY_CODE || ""
      }
    },
    action: input.action ?? "",
    bap_id: process.env.BAP_ID || "",
    bap_uri: process.env.BAP_URI || "",
    timestamp: input.timestamp ?? moment().toISOString(),
    bpp_id:input?.bppId,
    bpp_uri:input?.bppUri,
    message_id: input?.messageId ?? uuid(),
    version: process.env.CORE_VERSION || (input?.core_version ?? ""),
    ttl: "PT10M", // ask Ajay for its significance
    transaction_id: input?.transactionId ?? uuid()
  };

  return context;
};


export const buildSearchRequest = (input: any = {}) => {

  const context = buildContext({ 
    action: "search", 
    domain: input?.domain
    // domain: "supply-chain-services:assembly"
  });
    // domain: `${input?.searchTitle ?? "supply-chain-services:assembly"}`});
  const message: any = {
    intent: {}
  };

  let category: any = {};
  let provider: any = {};
  const locations: any= [];

  const optional: any = {};

if (input?.userLocation || input?.userRadiustype || input?.userRadiusvalue || input?.userRadiusunit) {
  provider = {
    locations: [
      {
        circle: {
          gps: input?.userLocation,
          radius: {
            type: input?.userRadiustype,
            value: input?.userRadiusvalue,
            unit: input?.userRadiusunit,
          }
        } 

      }
    ],
    rating: input?.userRating,
  };


}


  if (input?.searchTitle) {
    category = {
      descriptor: {
        code: input?.searchTitle
      }
    };
  }

  if (Object.keys(provider).length) {
    message.intent = {
      ...message.intent,
      provider
    };
  }

  if (Object.keys(category).length) {
    message.intent = {
      ...message.intent,
      category
    };
  }

  

  if (input?.loggedInUserEmail) {
    optional.user = { "email": input?.loggedInUserEmail };
  }

  //return { payload: { context, message }, optional };
  return { payload: { context, message } };

  
};


export const buildOnSearchMergedResponse = async (response: any = {}, body: any = {}) => {
  // let savedAppliedResult = response?.itemRes ? await buildSavedAppliedCategoryResponse(response.itemRes[0], response.itemRes[1]) : null;
  return buildSearchResponse(response.searchRes, body);

  // return buildSearchResponse(response.searchRes, body, response?.itemRes?.[0]?.data?.courses, response?.itemRes?.[1]?.data?.courses);
}

export const buildSearchResponse = (
  response: any = {}, body: any = {}) => {

    
  const inputs = response?.data?.responses;
  console.log("print res", inputs)
  const { transaction_id: transactionId, message_id: messageId, bpp_id: bppId, bpp_uri: bppUri }: any = inputs?.[0]?.context ?? {};
  const context = { transactionId, messageId, bppId, bppUri };



  if (!inputs?.length)
    return { status: 200 };

  const serviceProviders: any[] = [];
  const categories: any[] = [];
  const items: any[] = [];
  const tags: any[] = [];
  const location: any[] = [];
  inputs.forEach((input: any) => {
    // const { bpp_id: bppId, bpp_uri: bppUri }: any = input?.context ?? {};
    // const context = { bppId, bppUri };
    const { transaction_id: transactionId, message_id: messageId, bpp_id: bppId, bpp_uri: bppUri }: any = input.context ?? {};
    const context = { transactionId, messageId, bppId, bppUri };

    const providers = input?.message?.catalog?.providers;

    providers?.forEach((provider: any) => {
      provider?.categories.forEach((cat: any) => {
        categories.push({
          id: cat?.id,
          code: cat?.descriptor?.code,
          name: cat?.descriptor?.name,
        });
      });
      provider?.items.forEach((item: any) => {

        item?.tags.forEach((tag: any) => {
          tags.push({
            code: tag?.descriptor?.code,
            name: tag?.descriptor?.name,
            // list,
            display: tag?.display,

          });
        });
        
        items.push({
          id: item?.id,
          name: item?.descriptor?.name,
          category_id: item?.category_ids,
          fulfillment_id: item?.fulfillment_ids,
          tags,
          currency: item?.price?.currency,
          value: item?.price?.value,

        });
        
      });
      provider?.location?.forEach((loc: any) => {
        location.push({
          code : loc?.city?.code,
          name: loc?.city?.name,
          gps: loc?.gps,
        })
      });

        serviceProviders.push({
          context,
          id: provider?.id,
          name: provider?.descriptor?.name,
          short_desc: provider?.descriptor?.short_desc,
          long_desc: provider?.descriptor?.long_desc,
          images: provider?.descriptor?.images.map(
            (img: any) => img?.url || ""
          ),
          categories,
          items,
          location,
          rating: provider?.rating,
        });
    });
    })
  return { data: { context, serviceProviders } };
};

export const buildSavedAppliedCategoryResponse = (savedResponse: any = {}, appliedResponse: any = {}) => {
  const savedInput = savedResponse?.data?.courses;
  const appliedInput = appliedResponse?.data?.courses;

  const mentorMap: any = {
    saved: {}, applied: {}
  };

  if (savedResponse?.data) {
    savedInput.forEach(({ course_id }: any) => {
      mentorMap['saved'][course_id] = true;
    });
  }

  if (appliedResponse?.data) {
    appliedInput.forEach(({ course_id }: any) => {
      mentorMap['applied'][course_id] = true;
    });
  }

  return mentorMap;
}

export const buildInitRequest = (input: any = {}) => {
  const context = buildContext({
    ...input?.context,
    domain: input?.context?.domain,
    bpp_id: input?.context?.bppId,
    bpp_uri: input?.context?.bppUri,
    action: "init",
    // console.log("")
  });

  const message: any = { 
    order :{
      provider:{
        id: input?.providerId,
      },
      items: [
        { id: input?.itemId,
        }],
      fulfillments:[
        {
          id:input?.fulfillmentId,
          customer:{
            contact:{
              email: input?.email,
              phone: input?.mobileNumber,
            },
            person: {
              name: input?.name
            }
          },
          stops:[
            {
              type: input?.type,
              location:{
                gps:input?.location,
                address: input?.shippingAddress,
              },
              contact: {
                phone: input?.mobileNumber
              }
            },
          ]
      }],
      billing: {
        name: input?.name,
        address: input?.billingAddress,
        email: input?.email,
        phone: input?.mobileNumber,
      }
    },
    
  };
  

  return { payload: { context, message } };
};

// export const buildInitResponse = (response: any = {}, body: any = {}) => {
//   const input = response?.data?.responses?.[0];
//   console.log("dank input",input)
//   if (!input)
//     return { status: 200 };
//     const context = {
//       transactionId: input?.context?.transaction_id,
//       messageId: input?.context?.message_id,
//       bppId: input?.context?.bpp_id,
//       bppUri: input?.context?.bpp_uri,
//     };
  
  
//   const provider = input?.message?.order?.provider;
//   const item = input?.message?.order?.items?.[0];
//   const fulfillment = input?.message?.order?.fulfillments?.[0];
//   const payments = input?.message?.order?.payments?.[0];
//   const breakup = input?.message?.order?.quote?.breakup?.[0]
//   const initProv = {
//     provider: {
//       id: provider?.id,
//       descriptor:{
//       name: provider?.descriptor?.name,
//       short_desc: provider?.descriptor?.short_desc,
//       long_desc: provider?.descriptor?.long_desc,
//       image: provider?.descriptor?.images?.map((image: any) => image?.url),
//       },
//     },
//       items:[
//         {
//           id: item?.id,
//           descriptor:{
//             name: item?.descriptor?.name,
//           },
//           category_ids: [
//             item?.category_ids,
//           ],
//           price: {
//             currency: item?.price?.currency,
//             value: item?.price?.value,
//         }
//           // xinput:{
//           //   required: item?.xinput?.required,
//           //   form:{
//           //     url: item?.xinput?.form?.url,
//           //     resubmit: item?.xinput?.resubmit,
//           //   },
//           // },
//         },
//       ], 
//       fulfillments: [{
//         id: fulfillment?.id,
//             customer:{
//               contact:{
//                 email: fulfillment?.customer?.contact?.email,
//                 phone: fulfillment?.customer?.contact?.mobileNumber,
//               },
//               person: {
//                 name: fulfillment?.customer?.person?.name,
//               }
//             },
//             stops:[
//               {
//                 type: fulfillment?.stops?.type,
//                 location:{
//                   gps:fulfillment?.stops?.location?.gps,
//                   address: fulfillment?.stops?.location?.shippingAddress,
//                 },
//                 contact: {
//                   phone: fulfillment?.stops?.contact?.phone
//                 }
//               },
//             ],
//             tracking: fulfillment?.tracking,
        
//       }],
//       payments: [
//         {
//             collected_by: payments?.collected_by,
//             params: {
//                 amount: payments?.params?.amount,
//                 currency: payments?.params?.currency,
//                 bank_account_number: payments?.params?.bank_account_number,
//                 bank_code: payments?.params?.params?.bank_code,
//                 bank_account_name: payments?.params?.bank_account_name
//             },
//             status: payments?.status,
//             type: payments?.type
//         }
//     ],
//     quote: {
//         breakup: [
//             {
//                 price: {
//                     currency: breakup?.price?.currency,
//                     value: breakup?.price?.value
//                 },
//                 title: breakup?.title
//             },
//             {}
//                 price: {
//                     currency: breakup?.price?.currency,
//                     value: breakup?.price?.value,
//                 },
//                 title: breakup?.price?.title
            
//         ],
//         price: {
//             currency: breakup?.price?.currency,
//             value: breakup?.price.value
//         }
//     },
//   };

  

  
//   return { data: { context, initProv } };


// };

export const buildConfirmRequest = (input: any = {}) => {
  const context = buildContext({
    ...input?.context,
    category: "courses",
    action: "confirm"
  });

  const message: any = { order: { items: [{ id: input?.courseId }] } };
  if (input?.applicantProfile?.name) {
    message.order.fulfillments = [{ customer: { person: { name: input?.applicantProfile?.name } } }];
  }

  return { payload: { context, message } };
};
export const buildConfirmResponse = (response: any = {}, body: any = {}) => {
  const input = response?.data?.responses?.[0];
  if (!input)
    return { status: 200 };

  const { transaction_id: transactionId, message_id: messageId, bpp_id: bppId, bpp_uri: bppUri }: any = input?.context ?? {};
  const context = { transactionId, messageId, bppId, bppUri };

  const provider = input?.message?.order?.provider;
  const item = input?.message?.order?.items?.[0];

  const category: any = provider?.categories?.find((category: any) => category?.id === item?.category_id);

  const course = {
    id: item?.id,
    name: item?.descriptor?.name,
    description: item?.descriptor?.long_desc,
    imageLocations: item?.descriptor?.images?.map((image: any) => image?.url),
    duration: item?.time?.duration,
    provider: {
      id: provider?.id,
      name: provider?.descriptor?.name,
      description: provider?.descriptor?.long_desc
    },
    category: {
      id: category?.id,
      name: category?.name
    }
  };

  const applicationId = input?.message?.order?.id;
  const applicationState = input?.message?.order?.state;

  let courseDetails = item?.tags?.find((tag: any) => tag?.descriptor?.name == "courseDetails");

  const eligibility = item?.tags?.find((tag: any) => tag?.descriptor?.name == "eligibility");
  const courseHighlights = item?.tags?.find((tag: any) => tag?.descriptor?.name == "courseHighlights");
  const prerequisites = item?.tags?.find((tag: any) => tag?.descriptor?.name == "prerequisites");

  const additionalFormUrl = item?.xinput?.form?.url

  courseDetails = {
    price: courseDetails?.list?.find((detail: any) => detail?.descriptor?.name == "price")?.value,
    startDate: courseDetails?.list?.find((detail: any) => detail?.descriptor?.name == "startDate")?.value,
    endDate: courseDetails?.list?.find((detail: any) => detail?.descriptor?.name == "endDate")?.value,
    rating: courseDetails?.list?.find((detail: any) => detail?.descriptor?.name == "rating")?.value,
    credits: courseDetails?.list?.find((detail: any) => detail?.descriptor?.name == "credits")?.value,

    instructors: courseDetails?.list?.find((detail: any) => detail?.descriptor?.name == "instructors")?.value,
    offeringInstitue: courseDetails?.list?.find((detail: any) => detail?.descriptor?.name == "offeringInstitue")?.value,
    courseUrl: courseDetails?.list?.find((detail: any) => detail?.descriptor?.name == "url")?.value,
    enrollmentEndDate: courseDetails?.list?.find((detail: any) => detail?.descriptor?.name == "enrollmentEndDate")?.value,

    eligibility: eligibility?.list?.map((li: any) => ({ name: li?.descriptor?.name, value: li?.value })),
    courseHighlights: courseHighlights?.list?.map((li: any) => ({ name: li?.descriptor?.name, value: li?.value })),
    prerequisites: prerequisites?.list?.map((li: any) => ({ name: li?.descriptor?.name, value: li?.value }))
  }

  const fulfillment = input?.message?.order?.fulfillments?.[0];
  const applicantProfile = {
    name: fulfillment?.customer?.person?.name,
    email: fulfillment?.contact?.email,
    contact: fulfillment?.contact?.phone,
  };

  const additionalFormData = {
    formUrl: item?.xinput?.form?.url,
    formMimeType: item?.xinput?.form?.mime_type,
    submissionId: item?.xinput?.form?.submission_id,
    data: Object.keys(item?.xinput?.form?.data ?? {}).map((key: string) => { return { formInputKey: key, formInputValue: item?.xinput?.form?.data[key] }; })
  };

  return { data: { original: input, context, applicationId, applicationState, course, courseDetails, applicantProfile, additionalFormUrl, additionalFormData } };
};


export const buildStatusRequest = (input: any = {}) => {
  const context = buildContext({
    ...input?.context,
    category: "courses",
    action: "confirm"
  });
  const message = {};
  return { payload: { context, message } };
};
export const buildStatusResponse = (response: any = {}, input: any = {}) => {
  const context = {
    transactionId: response?.context?.message_id,
    bppId: response?.context?.bpp_id,
    bppUri: response?.context?.bpp_uri
  };

  return { context };
};

export const buildSelectRequest = (input: any = {}) => {
  // console.log("input Context======>",input?.context)
  const context = buildContext({
    ...input?.context,
    action: "select",
    domain: input?.context?.domain,
    bpp_id: input?.context?.bppId,
    bpp_uri: input?.context?.bppUri,
  });
  // console.log("Output Context======>",context)
  const message:any = {
    order :{
      provider:{
        id: input?.providerId,
      },
      items: [
        { id: input?.itemId,
        }],
      fulfillments:[{id:input?.fulfillmentId}],
      tags:[{
        descriptor:{
          name: input?.tagName,
        },
      }],
    },
  }

  return { payload: { context, message } };
};
export const buildSelectResponse = (response: any = {}, body: any = {}) => {
  const input = response?.data?.responses?.[0];
  console.log("dank input",input)
  if (!input)
    return { status: 200 };
    const context = {
      transactionId: input?.context?.transaction_id,
      messageId: input?.context?.message_id,
      bppId: input?.context?.bpp_id,
      bppUri: input?.context?.bpp_uri,
    };
  
  
  const provider = input?.message?.order?.provider;
  const item = input?.message?.order?.items?.[0];
  const fulfillment = input?.message?.order?.fulfillments?.[0];

  const selectProvider = {
    provider: {
      id: provider?.id,
      descriptor:{
      name: provider?.descriptor?.name,
      short_desc: provider?.descriptor?.short_desc,
      long_desc: provider?.descriptor?.long_desc,
      image: provider?.descriptor?.images?.map((image: any) => image?.url),
      },
    },
      items:[
        {
          id: item?.id,
          descriptor:{
            name: item?.descriptor?.name,
          },
          category_ids: [
            item?.category_ids,
          ],
          xinput:{
            required: item?.xinput?.required,
            form:{
              url: item?.xinput?.form?.url,
              resubmit: item?.xinput?.resubmit,
            },
          },
        },
      ], 
      fulfillments: [{
        id: fulfillment?.id,
        tracking: fulfillment?.tracking
      }],
      quote:{
        price:{
          currency: input?.message?.order?.quote?.price?.currency,
          value: input?.message?.order?.quote?.price?.value,
        }
    },
  };

  
  const formUrl = item?.xinput?.form?.url

  
  return { data: { context, selectProvider,formUrl } };
};
