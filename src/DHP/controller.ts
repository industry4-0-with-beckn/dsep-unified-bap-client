import { Request, Response, NextFunction } from "express";

import {
  searchService,
  selectService,
  initService,
  confirmService,
  statusService,
  cancelService,
  updateService,
  supportService,
  ratingService,
  trackService
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
    const { data } = await selectService(req?.body);
    return res.status(200).json(data);
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
  const { data } = await trackService(req?.body);
  return res.status(200).json(data);
};

export const support = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { data } = await supportService(req?.body);
  return res.status(200).json(data);
};

export const rating = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { data } = await ratingService(req?.body);
  return res.status(200).json(data);
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { data } = await updateService(req?.body);
    return res.status(200).json(data);
  } catch(error: any) {
    console.log("Controler exception => ", error);
    return res.status(error?.response?.status || 500).json({ 
      error: error?.response?.statusText || "An exception has occurred."
    });
  }
};
