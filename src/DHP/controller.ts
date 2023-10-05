import { Request, Response, NextFunction } from "express";
import { selectSchema } from "../helper/api-validator";

import {
  searchService,
  selectService,
  initService,
  confirmService,
  statusService,
  cancelService
} from "./services";
export const search = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { data } = await searchService(req?.body);
  return res.status(200).json(data);
};

export const select = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { error } = selectSchema.validate(req?.body);
    console.log("Joi Error == ", error);
    if (error) {
      return res.status(400).json({ error: error?.details[0]?.message || "Bad Request." });
    } else{
      const data = await selectService(req?.body);
      return res.status(200).json(data);
    }
  } catch(error: any) {
    return res.status(error?.response?.status || 500).json({ 
      error: error?.response?.statusText || "An exception has occurred."
    });
  }
  
}
export const init = async (req: Request, res: Response, next: NextFunction) => {
  const { data } = await initService(req?.body);
  return res.status(200).json(data);
};

export const confirm = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { data } = await confirmService(req?.body);
  return res.status(200).json(data);
};

export const status = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { data } = await statusService(req?.body);
  return res.status(200).json(data);
};

export const cancel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { data } = await cancelService(req?.body);
  return res.status(200).json(data);
};

export const track = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(200).json({});
};
export const support = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(200).json({});
};
