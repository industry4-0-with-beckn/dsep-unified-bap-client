import express, { Router } from "express";

import {
  search,
  select,
  init,
  confirm,
  status,
  cancel,
  track,
  support,
  rating
} from "./controller";

const router: Router = express.Router();

export const mentorshipRoutes = () => {
  router.post("/search", search); //done
  router.post("/select", select); //done
  router.post("/init", init); // done
  router.post("/confirm", confirm); //done
  router.post("/status", status);
  router.post("/cancel", cancel);
  router.post("/track", track);
  router.post("/support", support);
  router.post("/rating", rating);

  return router;
};
