import express, { Router } from "express";
import * as jobController from "./controller";
const router: Router = express.Router();

export const jobRoutes = () => {
  router.post("/search", jobController.search);
  router.post("/on_search", jobController.onSearch);
  router.post("/select", jobController.select);
  router.post("/on_select", jobController.onSelect);
  router.post("/init", jobController.init);
  router.post("/on_init", jobController.onInit);
  router.post("/confirm", jobController.confirm);
  router.post("/on_confirm", jobController.onConfirm);
  router.post("/status", jobController.status);
  router.post("/on_status", jobController.onstatus);
  router.post("/cancel", jobController.cancel);
  router.post("/track", jobController.track);
  router.post("/support", jobController.support);
  router.post("/rating", jobController.rating);

  return router;
};
