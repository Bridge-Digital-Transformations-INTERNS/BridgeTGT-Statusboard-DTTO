import express from "express";
import { body } from "express-validator";
import * as Projects from "../controllers/projectsControllers.js";
import {sessionAuth} from '../middlewares/sessionAuth.js'

const router = express.Router();

// GET all projects
router.get("/", Projects.getProjects);

// GET a project by ID
router.get("/:id", Projects.getProjectById);

// POST
router.post(
  "/",
  sessionAuth,
  [body("name").isString().notEmpty().withMessage("Name is required")],
  ...Projects.createProjectWithLog
);

// PUT
router.put(
  "/:id",
  sessionAuth,
  [
    body("name")
      .optional()
      .isString()
      .notEmpty()
      .withMessage("Name must be a non-empty string"),
  ],
  ...Projects.updateProjectWithLog,
);
// DELETE
router.delete("/:id",sessionAuth, Projects.deleteProjectWithLog);
export default router;
