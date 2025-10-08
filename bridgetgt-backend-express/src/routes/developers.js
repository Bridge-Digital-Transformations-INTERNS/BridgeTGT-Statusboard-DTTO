import express from "express";
import { body } from "express-validator";
import * as Developers from "../controllers/developersController.js";
import { sessionAuth } from "../middlewares/sessionAuth.js";

const router = express.Router();

// GET all developers
router.get("/", Developers.getDevelopers);

// GET a developer by ID
router.get("/:id", Developers.getDeveloperById);

// POST
router.post(
  "/",
  sessionAuth,
  [
    body("name").isString().notEmpty().withMessage("Name is required"),
    body("color").isString().notEmpty().withMessage("Color is required"),
  ],
  ...Developers.createDeveloperWithLog,
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
    body("color")
      .optional()
      .isString()
      .notEmpty()
      .withMessage("Color must be a non-empty string"),
  ],
  ...Developers.updateDeveloperWithLog,
);

// DELETE
router.delete("/:id", sessionAuth, Developers.deleteDeveloperWithLog);

export default router;
