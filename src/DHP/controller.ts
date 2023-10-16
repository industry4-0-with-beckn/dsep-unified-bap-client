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
  try {
    console.log("Request Body for Search Endpoint :: ", JSON.stringify(req?.body));
    const { data } = await searchService(req?.body);
    return res.status(200).json(data);
  } catch(error: any) {
    console.log("Error for Search Endpoint :: ", error);
    return res.status(error?.response?.status || 500).json({ 
      error: error?.response?.statusText || "An exception has occurred."
    });
  }
};

export const select = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Request Body for Select Endpoint :: ", JSON.stringify(req?.body));
    const { data } = await selectService(req?.body);
    return res.status(200).json(data);
  } catch(error: any) {
    console.log("Error for Select Endpoint :: ", error);
    return res.status(error?.response?.status || 500).json({ 
      error: error?.response?.statusText || "An exception has occurred."
    });
  }
}
export const init = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Request Body for Init Endpoint :: ", JSON.stringify(req?.body));
    const { data } = await initService(req?.body);
    return res.status(200).json(data);
  } catch(error: any) {
    console.log("Error for Init Endpoint :: ", error);
    return res.status(error?.response?.status || 500).json({ 
      error: error?.response?.statusText || "An exception has occurred."
    });
  }
};

export const confirm = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Request Body for Confirm Endpoint :: ", JSON.stringify(req?.body));
    const { data } = await confirmService(req?.body);
    return res.status(200).json(data);
  } catch(error: any) {
    console.log("Error for Confirm Endpoint :: ", error);
    return res.status(error?.response?.status || 500).json({ 
      error: error?.response?.statusText || "An exception has occurred."
    });
  }
};

export const status = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Request Body for Status Endpoint :: ", JSON.stringify(req?.body));
    const { data } = await statusService(req?.body);
    return res.status(200).json(data);
  } catch(error: any) {
    console.log("Error for Status Endpoint :: ", error);
    return res.status(error?.response?.status || 500).json({ 
      error: error?.response?.statusText || "An exception has occurred."
    });
  }
};

export const cancel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Request Body for Cancel Endpoint :: ", JSON.stringify(req?.body));
    const { data } = await cancelService(req?.body);
    return res.status(200).json(data);
  } catch(error: any) {
    console.log("Error for Cancel Endpoint :: ", error);
    return res.status(error?.response?.status || 500).json({ 
      error: error?.response?.statusText || "An exception has occurred."
    });
  }
};

export const track = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Request Body for Track Endpoint :: ", JSON.stringify(req?.body));
    const { data } = await trackService(req?.body);
    return res.status(200).json(data);
  } catch(error: any) {
    console.log("Error for Track Endpoint :: ", error);
    return res.status(error?.response?.status || 500).json({ 
      error: error?.response?.statusText || "An exception has occurred."
    });
  }
};

export const support = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Request Body for Support Endpoint :: ", JSON.stringify(req?.body));
    const { data } = await supportService(req?.body);
    return res.status(200).json(data);
  } catch(error: any) {
    console.log("Error for Support Endpoint :: ", error);
    return res.status(error?.response?.status || 500).json({ 
      error: error?.response?.statusText || "An exception has occurred."
    });
  }
};

export const rating = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Request Body for Rating Endpoint :: ", JSON.stringify(req?.body));
    const { data } = await ratingService(req?.body);
    return res.status(200).json(data);
  } catch(error: any) {
    console.log("Error for Rating Endpoint :: ", error);
    return res.status(error?.response?.status || 500).json({ 
      error: error?.response?.statusText || "An exception has occurred."
    });
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Request Body for Update Endpoint :: ", JSON.stringify(req?.body));
    const { data } = await updateService(req?.body);
    return res.status(200).json(data);
  } catch(error: any) {
    console.log("Error for Update Endpoint :: ", error);
    return res.status(error?.response?.status || 500).json({ 
      error: error?.response?.statusText || "An exception has occurred."
    });
  }
};
