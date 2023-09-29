import moment from "moment";
import { v4 as uuid } from "uuid";
import { IScholarshipNetworkContext } from "./schema";
export const buildContext = (input: any = {}) => {
  console.log("input", input);
  const context: IScholarshipNetworkContext = {
    domain: `${process.env.DOMAIN}${input?.category ?? "scholarships"}`,
    location: {
      city: {
        name: process.env.CITY || "",
        code: process.env.CITY_CODE || ""
      },
      country: {
        name: process.env.COUNTRY || "",
        code: process.env.COUNTRY_CODE || ""
      }
    },
    action: input.action ?? "",
    version: `${process.env.CORE_VERSION || (input?.core_version ?? "")}`,
    transaction_id: input?.transactionId ?? uuid(),
    bap_id: process.env.BAP_ID || (input?.bapId ?? ""),
    bap_uri: process.env.BAP_URI || (input?.bapUri ?? ""),
    bpp_id: input?.bppId,
    bpp_uri: input?.bppUri,
    message_id: input?.messageId ?? uuid(),

    timestamp: input.timestamp ?? moment().toISOString()
  };
  return context;
};

export const buildSearchRequest = (input: any = {}) => {
  const context = buildContext({ action: "search", category: "scholarships" });
  const message: any = {
    intent: { item: {}, provider: {} }
  };
  const optional: any = {};

  const fulfillment: any = {
    customer: {
      person: {}
    }
  };
  const tags: any = [];
  if (input?.name) {
    message.intent.item = {
      ...message.intent.item,
      descriptor: {
        name: input?.name
      }
    };
  }
  if (input?.gender) {
    fulfillment.customer.person = {
      ...fulfillment.customer.person,
      gender: input?.gender
    };
  }
  if (input?.finStatus) {
    fulfillment.customer.person = {
      ...fulfillment.customer.person,
      tags: [
        ...tags,
        {
          code: "fin_status",
          list: [
            {
              code: "family_income",
              value: input?.finStatus?.family_income
            }
          ]
        }
      ]
    };
  }
  if (input?.casteCategory?.length) {
    input?.casteCategory?.forEach((caste: any) => {
      fulfillment.customer.person.tags.push({
        code: "caste_category",
        list: [
          {
            value: caste?.caste
          }
        ]
      });
    });
  }

  if (input?.loggedInUserEmail) {
    optional.user = { email: input?.loggedInUserEmail };
  }

  message.intent.provider = {
    categories: input?.categories?.map((category: any) => ({
      descriptor: { code: category?.code }
    }))
  };

  if (Object.keys(fulfillment?.customer?.person ?? {})?.length) {
    message.intent.fulfillment = fulfillment;
  }

  return { payload: { context, message }, optional };
};

export const buildOnSearchMergedResponse = async (
  response: any = {},
  body: any = {}
) => {
  let savedAppliedResult = response?.itemRes
    ? await buildSavedAppliedCategoryResponse(
        response.itemRes[0],
        response.itemRes[1]
      )
    : null;
  return buildSearchResponse(
    response.searchRes,
    body,
    response?.itemRes?.[0]?.data?.scholarship,
    response?.itemRes?.[1]?.data?.scholarship
  );
};

export const buildSearchResponse = (
  response: any = {},
  body: any = {},
  savedItems = [],
  appliedItems = []
) => {
  const bpps = response?.data?.responses;
  if (!bpps) return { status: 200 };
  const finaldata = bpps.map((bpp: any) => {
    const {
      transaction_id: transactionId,
      message_id: messageId,
      bpp_id: bppId,
      bpp_uri: bppUri
    }: any = bpp?.context ?? {};
    const context = { transactionId, messageId, bppId, bppUri };
    const scholarshipProviderPlatform = bpp?.message?.catalog?.descriptor?.name;
    const scholarshipProviders = bpp?.message?.catalog?.providers?.map(
      (provider: any) => ({
        id: provider?.id,
        name: provider?.descriptor?.name,
        scholarships: provider?.items?.map((item: any) => ({
          id: item?.id,
          name: item?.descriptor?.name,
          description: item?.descriptor?.long_desc,
          userSavedItem: !!savedItems?.find(
            (savedItem: any) => savedItem?.scholarship_id == item?.id
          ),
          userAppliedItem: !!appliedItems?.find(
            (appliedItem: any) => appliedItem?.scholarship_id == item?.id
          ),
          amount: {
            amount: item?.price?.value,
            currency: item?.price?.currency
          },
          categories: provider?.categories
            ?.filter((category: any) =>
              item.category_ids?.find(
                (category_id: any) => category_id == category?.id
              )
            )
            ?.map((category: any) => ({
              id: category?.id,
              code: category?.descriptor?.code,
              name: category?.descriptor?.name
            })),
          scholarshipDetails: provider?.fulfillments
            ?.filter((fulfillment: any) =>
              item?.fulfillment_ids?.find(
                (fulfillment_id: any) => fulfillment_id == fulfillment?.id
              )
            )
            ?.map((fulfillment: any) => ({
              id: fulfillment?.id,
              type: fulfillment?.type,
              gender: fulfillment?.customer?.person?.gender,
              applicationStartDate: fulfillment.stops?.find(
                (stop: any) => stop?.type == "APPLICATION-START"
              )?.time?.timestamp,
              applicationEndDate: fulfillment.stops?.find(
                (stop: any) => stop?.type == "APPLICATION-END"
              )?.time?.timestamp,
              supportContact: fulfillment?.contact,
              academicQualifications: fulfillment?.customer?.person?.tags
                ?.find(
                  (tag: any) =>
                    tag?.descriptor?.code == "academic_qualifications"
                )
                ?.list?.map((li: any) => ({
                  code: li?.descriptor?.code,
                  name: li?.descriptor?.name,
                  value: li?.value
                }))
            }))
        }))
      })
    );

    return { context, scholarshipProviders, scholarshipProviderPlatform };
  });
  return { data: finaldata };
};

export const buildSavedAppliedCategoryResponse = (
  savedResponse: any = {},
  appliedResponse: any = {}
) => {
  const savedInput = savedResponse?.data?.scholarship;
  const appliedInput = appliedResponse?.data?.scholarship;

  const scholarshipMap: any = {
    saved: {},
    applied: {}
  };

  if (savedResponse?.data) {
    savedInput.forEach(({ scholarship_id }: any) => {
      scholarshipMap["saved"][scholarship_id] = true;
    });
  }

  if (appliedResponse?.data) {
    appliedInput.forEach(({ scholarship_id }: any) => {
      scholarshipMap["applied"][scholarship_id] = true;
    });
  }

  return scholarshipMap;
};

export const buildSelectRequest = (input: any = {}) => {
  const payload = {
    context: buildContext({ ...(input?.context ?? {}), action: "select" }),
    message: {
      order: {
        provider: { id: input?.scholarshipProviderId },
        items: [{ id: input?.scholarshipId }]
      }
    }
  };
  return { payload };
};

export const buildSelectResponse = (res: any = {}, input: any = {}) => {
  const response = res?.data?.responses?.[0];
  if (!response) return { status: 200 };

  const context = {
    transactionId: response?.context?.transaction_id,
    bppId: response?.context?.bpp_id,
    bppUri: response?.context?.bpp_uri
  };

  const provider = response?.message?.order?.provider;

  const scholarshipProviders = [
    {
      id: provider?.id,
      name: provider?.descriptor?.name,
      description:
        provider?.descriptor?.long_desc ?? provider?.descriptor?.short_desc,
      scholarships: response?.message?.order?.items?.map((item: any) => ({
        id: item?.id,
        name: item?.descriptor?.name,
        description: item?.descriptor?.long_desc,
        amount: {
          amount: item?.price?.value,
          currency: item?.price?.currency
        },

        additionalFormData: {
          formUrl: item?.xinput?.form?.url,
          formMimeType: item?.xinput?.form?.mime_type,
          submissionId: item?.xinput?.form?.submission_id,
          data: Object.keys(item?.xinput?.form?.data ?? {}).map(
            (key: string) => {
              return {
                formInputKey: key,
                formInputValue: item?.xinput?.form?.data[key]
              };
            }
          )
        },

        academicQualifications: item?.tags
          ?.find((tag: any) => tag?.descriptor?.code == "edu_qual")
          ?.list?.map((li: any) => ({
            code: li?.descriptor?.code,
            name: li?.descriptor?.name,
            value: li?.value
          })),

        academicQualificationsCriteria: item?.tags
          ?.find((tag: any) => tag?.descriptor?.code == "edu_qual")
          ?.list?.map((li: any) => ({
            code: li?.descriptor?.code,
            name: li?.descriptor?.name,
            value: li?.value
          })),

        finStatusCriteria: item?.tags
          ?.find((tag: any) => tag?.descriptor?.code == "fin_status")
          ?.list?.map((li: any) => ({
            code: li?.descriptor?.code,
            name: li?.descriptor?.name,
            value: li?.value
          })),

        benefits: item?.tags
          ?.find((tag: any) => tag?.descriptor?.code == "benefits")
          ?.list?.map((li: any) => ({
            code: li?.descriptor?.code,
            name: li?.descriptor?.name,
            value: li?.value
          })),

        categories: response?.message?.order?.categories
          ?.filter((category: any) =>
            item.category_ids?.find(
              (category_id: any) => category_id == category?.id
            )
          )
          ?.map((category: any) => ({
            id: category?.id,
            code: category?.descriptor?.code,
            name: category?.descriptor?.name
          })),

        scholarshipDetails: response?.message?.order?.fulfillments?.map(
          (fulfillment: any) => ({
            id: fulfillment?.id,
            type: fulfillment?.type,
            gender: fulfillment?.customer?.person?.gender,
            applicationStartDate: fulfillment.stops?.find(
              (stop: any) => stop?.type == "APPLICATION-START"
            )?.time?.timestamp,
            applicationEndDate: fulfillment.stops?.find(
              (stop: any) => stop?.type == "APPLICATION-END"
            )?.time?.timestamp,
            supportContact: {
              name: fulfillment?.customer?.person?.name,
              ...(fulfillment?.contact ?? {})
            },
            academicQualifications: fulfillment?.customer?.person?.tags
              ?.find((tag: any) => tag?.descriptor?.code == "edu_qual")
              ?.list?.map((li: any) => ({
                code: li?.descriptor?.code,
                name: li?.descriptor?.name,
                value: li?.value
              }))
          })
        )
      }))
    }
  ];

  return { data: { context, scholarshipProviders } };
};

export const buildInitRequest = (input: any = {}) => {
  const context = buildContext({
    ...input?.context,
    category: "scholarships",
    action: "init"
  });
  const { scholarshipProvider = {} } = input;

  const message: any = {
    order: {
      type: "DEFAULT",
      provider: {
        id: scholarshipProvider?.id,
        descriptor: {
          name: scholarshipProvider?.name,
          short_desc: scholarshipProvider?.name
        },
        rateable: false
      },
      items: scholarshipProvider?.scholarships?.map((scholarship: any) => {
        const tags: any[] = [];

        if (
          scholarship?.academicQualificationsCriteria &&
          scholarship?.academicQualificationsCriteria.length
        ) {
          tags.push({
            display: true,
            descriptor: {
              code: "edu_qual",
              name: "Academic Eligibility"
            },
            list: scholarship?.academicQualificationsCriteria?.map(
              (quali: any) => {
                return {
                  descriptor: {
                    code: quali?.code,
                    name: quali?.name
                  },
                  value:
                    quali?.code === "passing_year"
                      ? `${quali?.value}`
                      : quali?.value,
                  display: true
                };
              }
            )
          });
        }

        if (
          scholarship?.finStatusCriteria &&
          scholarship?.finStatusCriteria.length
        ) {
          tags.push({
            display: true,
            descriptor: {
              code: "fin_status",
              name: "Financial Status"
            },
            list: scholarship?.finStatusCriteria?.map((stats: any) => {
              return {
                descriptor: {
                  code: stats?.code,
                  name: stats?.name
                },
                value: stats?.value,
                display: true
              };
            })
          });
        }

        if (scholarship?.benefits && scholarship?.benefits.length) {
          tags.push({
            display: true,
            descriptor: {
              code: "benefits",
              name: "Benefits"
            },
            list: scholarship?.benefits?.map((benef: any) => {
              return {
                descriptor: {
                  code: benef?.code,
                  name: benef?.name
                },
                value: benef?.value,
                display: true
              };
            })
          });
        }

        return {
          id: scholarship?.id,
          descriptor: {
            name: scholarship?.name,
            short_desc: scholarship?.name
          },
          price: {
            currency: scholarship?.amount?.currency,
            value: scholarship?.amount?.amount?.toString()
          },
          xinput: {
            required: true,
            form: {
              url: scholarship?.additionalFormData?.formUrl,
              mime_type: scholarship?.additionalFormData?.formMimeType,
              data: {
                name: scholarship?.additionalFormData?.data.find(
                  (elem: any) => elem?.formInputKey === "name"
                )?.formInputValue,
                phone: `${
                  scholarship?.additionalFormData?.data.find(
                    (elem: any) => elem?.formInputKey === "phone"
                  )?.formInputValue
                }`,
                address: scholarship?.additionalFormData?.data.find(
                  (elem: any) => elem?.formInputKey === "address"
                )?.formInputValue,
                needOfScholarship: scholarship?.additionalFormData?.data.find(
                  (elem: any) => elem?.formInputKey === "needOfScholarship"
                )?.formInputValue,
                docUrl: scholarship?.additionalFormData?.data.find(
                  (elem: any) => elem?.formInputKey === "docUrl"
                )?.formInputValue
              },
              submission_id: scholarship?.additionalFormData?.submissionId
            }
          },
          tags: tags,
          rateable: false,
          category_ids: [scholarship?.categoryId]
        };
      }),
      fulfillments: scholarshipProvider?.scholarships?.map(
        (scholarship: any) => {
          return {
            id: scholarship?.scholarshipDetails?.id,
            type: scholarship?.scholarshipDetails?.type,
            tracking: false,
            customer: {
              person: {
                gender: "Male",
                name: scholarship?.scholarshipDetails?.scholarshipRequestor
                  ?.name
              }
            },
            contact: {
              phone: scholarship?.scholarshipDetails?.supportContact?.phone,
              email: scholarship?.scholarshipDetails?.supportContact?.email
            },
            stops: [
              {
                type: "APPLICATION-START",
                time: {
                  timestamp:
                    scholarship?.scholarshipDetails?.applicationStartDate
                }
              },
              {
                type: "APPLICATION-END",
                time: {
                  timestamp: scholarship?.scholarshipDetails?.applicationEndDate
                }
              }
            ]
          };
        }
      )
    }
  };

  return { payload: { context, message } };
};
export const buildInitResponse = (response: any = {}, input: any = {}) => {
  if (!response.responses.length) {
    return {
      context: {},
      scholarshipApplicationId: "",
      scholarshipProvider: {}
    };
  }

  const actualResponse = response?.responses[0];

  const context = {
    transactionId: actualResponse?.context?.transaction_id,
    bppId: actualResponse?.context?.bpp_id,
    bppUri: actualResponse?.context?.bpp_uri
  };

  const { order = {} } = actualResponse?.message;
  const fulfillment = order?.fulfillments[0];
  // const scholarshipApplicationId = order?.id;

  const scholarshipProvider: any = {
    id: order?.provider?.id,
    name: order?.provider?.descriptor?.name,
    description: order?.provider?.descriptor?.short_desc,
    scholarships: order?.items.map((scholarship: any) => {
      return {
        id: scholarship?.id,
        name: scholarship?.descriptor?.name,
        description: scholarship?.descriptor?.short_desc,
        categoryId: scholarship?.category_ids?.length
          ? scholarship?.category_ids[0]
          : "",
        amount: {
          amount: parseInt(scholarship?.price?.value),
          currency: scholarship?.price?.currency
        },
        scholarshipDetails: {
          id: fulfillment?.id,
          type: fulfillment?.type,
          applicationStartDate: fulfillment?.stops?.find(
            (stp: any) => stp?.type === "APPLICATION-START"
          )?.time?.timestamp,
          applicationEndDate: fulfillment?.stops?.find(
            (stp: any) => stp?.type === "APPLICATION-END"
          )?.time?.timestamp,
          supportContact: {
            name: fulfillment?.contact?.email,
            phone: fulfillment?.contact?.phone,
            email: fulfillment?.contact?.email
          },
          scholarshipRequestor: scholarship?.xinput?.form?.data
        },
        additionalFormData: {
          formUrl: scholarship?.xinput?.form?.url,
          formMimeType: scholarship?.xinput?.form?.mime_type,
          submissionId: scholarship?.xinput?.form?.submission_id,
          data: Object.keys(scholarship?.xinput?.form?.data).map(
            (key: string) => {
              return {
                formInputKey: key,
                formInputValue: scholarship?.xinput?.form?.data[key]
              };
            }
          )
        },
        academicQualificationsCriteria: scholarship?.tags
          ?.find((tag: any) => tag?.descriptor?.code === "edu_qual")
          ?.list?.map((li: any) => {
            return {
              code: li?.descriptor?.code,
              name: li?.descriptor?.name,
              value: li?.value
            };
          }),

        finStatusCriteria: scholarship?.tags
          ?.find((tag: any) => tag?.descriptor?.code === "fin_status")
          ?.list?.map((li: any) => {
            return {
              code: li?.descriptor?.code,
              name: li?.descriptor?.name,
              value: li?.value
            };
          }),
        benefits: scholarship?.tags
          ?.find((tag: any) => tag?.descriptor?.code === "benefits")
          ?.list?.map((li: any) => {
            return {
              code: li?.descriptor?.code,
              name: li?.descriptor?.name,
              value: li?.value
            };
          })
      };
    })
  };

  return { context, scholarshipProvider };
};

export const buildConfirmRequest = (input: any = {}) => {
  const context = buildContext({
    ...input?.context,
    category: "scholarships",
    action: "confirm"
  });
  const { scholarshipProvider = {} } = input;

  const message: any = {
    order: {
      type: "DEFAULT",
      provider: {
        id: scholarshipProvider?.id,
        descriptor: {
          name: scholarshipProvider?.name,
          short_desc: scholarshipProvider?.description
        },
        rateable: false
      },
      items: scholarshipProvider?.scholarships?.map((scholarship: any) => {
        const tags: any[] = [];

        if (
          scholarship?.academicQualificationsCriteria &&
          scholarship?.academicQualificationsCriteria.length
        ) {
          tags.push({
            display: true,
            descriptor: {
              code: "edu_qual",
              name: "Academic Eligibility"
            },
            list: scholarship?.academicQualificationsCriteria?.map(
              (quali: any) => {
                return {
                  descriptor: {
                    code: quali?.code,
                    name: quali?.name
                  },
                  value:
                    quali?.code === "passing_year"
                      ? `${quali?.value}`
                      : quali?.value,
                  display: quali?.code === "passing_year" ? false : true
                };
              }
            )
          });
        }

        if (
          scholarship?.finStatusCriteria &&
          scholarship?.finStatusCriteria.length
        ) {
          tags.push({
            display: true,
            descriptor: {
              code: "fin_status",
              name: "Financial Status"
            },
            list: scholarship?.finStatusCriteria?.map((stats: any) => {
              return {
                descriptor: {
                  code: stats?.code,
                  name: stats?.name
                },
                value: stats?.value,
                display: true
              };
            })
          });
        }

        if (scholarship?.benefits && scholarship?.benefits.length) {
          tags.push({
            display: true,
            descriptor: {
              code: "benefits",
              name: "Benefits"
            },
            list: scholarship?.benefits?.map((benef: any) => {
              return {
                descriptor: {
                  code: benef?.code,
                  name: benef?.name
                },
                value: benef?.value,
                display: true
              };
            })
          });
        }

        return {
          id: scholarship?.id,
          descriptor: {
            name: scholarship?.name,
            short_desc: scholarship?.description
          },
          price: {
            currency: scholarship?.amount?.currency,
            value: `${scholarship?.amount?.amount}`
          },
          xinput: {
            required: true,
            form: {
              url: scholarship?.additionalFormData?.formUrl,
              data: {
                name: scholarship?.additionalFormData?.data.find(
                  (elem: any) => elem?.formInputKey === "name"
                )?.formInputValue,
                phone: `${
                  scholarship?.additionalFormData?.data.find(
                    (elem: any) => elem?.formInputKey === "phone"
                  )?.formInputValue
                }`,
                address: scholarship?.additionalFormData?.data.find(
                  (elem: any) => elem?.formInputKey === "address"
                )?.formInputValue,
                needOfScholarship: scholarship?.additionalFormData?.data.find(
                  (elem: any) => elem?.formInputKey === "needOfScholarship"
                )?.formInputValue,
                docUrl: scholarship?.additionalFormData?.data.find(
                  (elem: any) => elem?.formInputKey === "docUrl"
                )?.formInputValue
              },
              mime_type: scholarship?.additionalFormData?.formMimeType,
              submission_id: scholarship?.additionalFormData?.submissionId
            }
          },
          rateable: false,
          tags: tags,
          category_ids: [scholarship?.categoryId]
        };
      }),
      fulfillments: scholarshipProvider?.scholarships?.map(
        (scholarship: any) => {
          return {
            id: scholarship?.scholarshipDetails?.id,
            type: scholarship?.scholarshipDetails?.type,
            tracking: false,
            customer: {
              person: {
                gender: "Male",
                name: "Test"
              }
            },
            contact: {
              phone: scholarship?.scholarshipDetails?.supportContact?.phone,
              email: scholarship?.scholarshipDetails?.supportContact?.email
            },
            stops: [
              {
                type: "APPLICATION-START",
                time: {
                  timestamp:
                    scholarship?.scholarshipDetails?.applicationStartDate
                }
              },
              {
                type: "APPLICATION-END",
                time: {
                  timestamp: scholarship?.scholarshipDetails?.applicationEndDate
                }
              }
            ]
          };
        }
      )
    }
  };

  return { payload: { context, message } };
};
export const buildConfirmResponse = (response: any = {}, input: any = {}) => {
  if (!response.responses.length) {
    return {
      context: {},
      scholarshipApplicationId: "",
      scholarshipApplicationStatus: "",
      scholarshipProvider: {}
    };
  }

  const actualResponse = response?.responses[0];
  const context = {
    transactionId: actualResponse?.context?.transaction_id,
    bppId: actualResponse?.context?.bpp_id,
    bppUri: actualResponse?.context?.bpp_uri
  };

  const { order = {} } = actualResponse?.message;
  const fulfillment = order?.fulfillments[0];
  const provider = order?.provider;
  const scholarshipApplicationId = order?.id;
  const scholarshipApplicationStatus = order?.status;

  const scholarshipProvider: any = {
    id: provider?.id,
    name: provider?.descriptor?.name,
    description: provider?.descriptor?.short_desc,
    scholarships: order?.items.map((scholarship: any) => {
      return {
        id: scholarship?.id,
        name: scholarship?.descriptor?.name,
        description: scholarship?.descriptor?.short_desc,
        categoryId: scholarship?.category_ids?.length
          ? scholarship?.category_ids[0]
          : "",
        amount: {
          amount: parseInt(scholarship?.price?.value),
          currency: scholarship?.price?.currency
        },
        scholarshipDetails: {
          id: fulfillment?.id,
          type: fulfillment?.type,
          applicationStartDate: fulfillment?.stops?.find(
            (stp: any) => stp?.type === "APPLICATION-START"
          )?.time?.timestamp,
          applicationEndDate: fulfillment?.stops?.find(
            (stp: any) => stp?.type === "APPLICATION-END"
          )?.time?.timestamp,
          supportContact: {
            name: fulfillment?.contact?.email,
            phone: fulfillment?.contact?.phone,
            email: fulfillment?.contact?.email
          },
          scholarshipRequestor: scholarship?.xinput?.form?.data
        },
        additionalFormData: {
          formUrl: scholarship?.xinput?.form?.url,
          formMimeType: scholarship?.xinput?.form?.mime_type,
          submissionId: scholarship?.xinput?.form?.submission_id,
          data: Object.keys(scholarship?.xinput?.form?.data).map(
            (key: string) => {
              return {
                formInputKey: key,
                formInputValue:
                  key === "phone"
                    ? Number(scholarship?.xinput?.form?.data[key])
                    : scholarship?.xinput?.form?.data[key]
              };
            }
          )
        },
        academicQualificationsCriteria: scholarship?.tags
          ?.find((tag: any) => tag?.descriptor?.code === "edu_qual")
          ?.list?.map((li: any) => {
            return {
              code: li?.descriptor?.code,
              name: li?.descriptor?.name,
              value:
                li?.descriptor?.code === "passing_year"
                  ? Number(li?.value)
                  : li?.value
            };
          }),

        finStatusCriteria: scholarship?.tags
          ?.find((tag: any) => tag?.descriptor?.code === "fin_status")
          ?.list?.map((li: any) => {
            return {
              code: li?.descriptor?.code,
              name: li?.descriptor?.name,
              value: li?.value
            };
          }),
        benefits: scholarship?.tags
          ?.find((tag: any) => tag?.descriptor?.code === "benefits")
          ?.list?.map((li: any) => {
            return {
              code: li?.descriptor?.code,
              name: li?.descriptor?.name,
              value: li?.value
            };
          })
      };
    })
  };

  return {
    original: actualResponse,
    context,
    scholarshipApplicationId,
    scholarshipApplicationStatus,
    scholarshipProvider
  };
};

export const buildStatusRequest = (input: any = {}) => {
  const context = buildContext({
    ...input?.context,
    category: "scholarships",
    action: "status"
  });
  const message = {
    order_id: input?.scholarshipApplicationId
  };
  return { payload: { context, message } };
};
export const buildStatusResponse = (res: any = {}, input: any = {}) => {
  const response = res?.data?.responses?.[0];
  if (!response) return { status: 200 };

  const context = {
    transactionId: response?.context?.transaction_id,
    bppId: response?.context?.bpp_id,
    bppUri: response?.context?.bpp_uri
  };

  const provider = response?.message?.order?.provider;
  const scholarshipApplicationId = response?.message?.order?.id;

  const scholarshipProviders = [
    {
      id: provider?.id,
      name: provider?.descriptor?.name,
      description:
        provider?.descriptor?.long_desc ?? provider?.descriptor?.short_desc,
      scholarships: response?.message?.order?.items?.map((item: any) => ({
        id: item?.id,
        name: item?.descriptor?.name,
        description: item?.descriptor?.long_desc,
        amount: {
          amount: item?.price?.value,
          currency: item?.price?.currency
        },

        scholarshipDetails: response?.message?.order?.fulfillments?.map(
          (fulfillment: any) => ({
            id: fulfillment?.id,
            type: fulfillment?.type,
            scholarshipStatus: { code: response?.message?.order?.status }
          })
        )?.[0],
        applicationStartDate:
          response?.message?.order?.fulfillments[0]?.stops[0]?.type ===
          "APPLICATION-START"
            ? response?.message?.order?.fulfillments[0]?.stops[0]?.time
                .timestamp
            : "",
        applicationEndDate:
          response?.message?.order?.fulfillments[0]?.stops[1]?.type ===
          "APPLICATION-END"
            ? response?.message?.order?.fulfillments[0]?.stops[1]?.time
                .timestamp
            : ""
      }))
    }
  ];

  return { data: { context, scholarshipApplicationId, scholarshipProviders } };
};
