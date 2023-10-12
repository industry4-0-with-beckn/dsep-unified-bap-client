import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { jobRoutes } from "./JobsFlow";
import { mentorshipRoutes } from "./MentoringAndCoaching";
import { scholarshipsRoutes } from "./ScholarshipsAndGrants/route";
import { trainingRoutes } from "./TrainingAndCourses/route";
import cors from "cors";
import { DHProutes } from "./DHP";
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(express.urlencoded()); // To parse URL-encoded bodies
app.use(express.json());
app.options(
  "*",
  cors<Request>({
    origin: "*",
    optionsSuccessStatus: 200,
    credentials: true,
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"]
  })
);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"]
  })
);
app.get("/", (req: Request, res: Response) => {
  res.send("dsep unified bap client is working");
});

const router = express.Router();
app.use(router);
app.use(express.json());

app.use("/job", jobRoutes());

app.use("/scholarship", scholarshipsRoutes());
app.use("/mentorship", mentorshipRoutes());
app.use("/course", trainingRoutes());
app.use("/dhp", DHProutes());
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
