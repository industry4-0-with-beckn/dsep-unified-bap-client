import { Response, Request } from "express";
import {
  confirmJob,
  initJob,
  onConfirmJob,
  onInitJob,
  onSearchJob,
  onSelectJob,
  onStatusJob,
  searchJob,
  selectJob,
  statusJob,
  cancelJob,
  trackJob,
  supportJob,
  ratingJob
} from "./services";

export const search = async (req: Request, res: Response) => {
  const { data, status = 200 } = await searchJob(req.body);
  res.status(status).json(data);
};

export const onSearch = async (req: Request, res: Response) => {
  const body = req.body;
  const { data, status = 200 } = await onSearchJob(body);
  res.status(status).json(data);
};

export const select = async (req: Request, res: Response) => {
  const { data, status = 200 } = await selectJob(req.body);
  res.status(status).json(data);
};

export const onSelect = async (req: Request, res: Response) => {
  const { data, status = 200 }: any = await onSelectJob(req.body);
  res.status(status).json(data);
};

export const init = async (req: Request, res: Response) => {
  const { data, status = 200 }: any = await initJob(req?.body);
  res.status(status).json(data);
};

export const onInit = async (req: Request, res: Response) => {
  const { data }: any = await onInitJob(req.body);
  res.json(data);
};

export const confirm = async (req: Request, res: Response) => {
  const { data, status = 200 } = await confirmJob(req.body);
  res.json(data).status(status);
};

export const onConfirm = async (req: Request, res: Response) => {
  const { data }: any = await onConfirmJob(req.body);
  res.json(data);
};

export const status = async (req: Request, res: Response) => {
  const { data }: any = await statusJob(req.body);
  res.json(data);
};
export const onstatus = async (req: Request, res: Response) => {
  const { data }: any = await onStatusJob(req.body);
  res.json(data);
};

export const cancel = async (req: Request, res: Response) => {
  const { data } = await cancelJob(req.body);
  res.json(data);
};

export const track = async (req: Request, res: Response) => {
  const { data } = await trackJob(req.body);
  res.json(data);
};
export const support = async (req: Request, res: Response) => {
  const { data } = await supportJob(req.body);
  res.json(data);
};

export const rating = async (req: Request, res: Response) => {
  const { data } = await ratingJob(req.body);
  res.json(data);
};
