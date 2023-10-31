import express, { Router } from "express";
import {
  search,
  select,
  init,
  confirm,
  status,
  track,
  support,
  cancel,
  update,
  rating
} from "./controller";
import { validateLocation } from "./validator";
const router: Router = express.Router();

export const DHProutes = () => {
  router.post("/search", validateLocation, search);
  router.post("/select", select);
  router.post("/init", init);
  router.post("/confirm", confirm);
  router.post("/status", status);
  router.post("/cancel", cancel);
  router.post("/track", track);
  router.post("/support", support);
  router.post("/update", update);
  router.post("/rating", rating);

  return router;
};
