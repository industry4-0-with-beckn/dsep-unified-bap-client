import Joi from "joi";

export const selectSchema = Joi.object({
    context: Joi.object({
        transactionId: Joi.string().required(),
        bppId: Joi.string().required(),
        bppUri: Joi.string().required(),
        domain: Joi.string().required()
    }).required(),
    providerId: Joi.string().required(),
    items: Joi.array().items({
        id: Joi.string().required()
    }).required()
});