import express from "express";
import * as Roles from "../controllers/rolesController.js";
import { body } from "express-validator";
import { sessionAuth } from "../middlewares/sessionAuth.js";
const router = express.Router();

// GET 
router.get("/", Roles.getRoles);

// GET ROLE BY ID
router.get("/:id", Roles.getRoleById);

// POST
router.post(
  "/",
  sessionAuth,
  [body("name").isString().notEmpty().withMessage("Name is required")],
  async (req, res, next) => {
    try {
      const role = await Roles.createRole(req, res, next);
      res.status(201).json({ message: "Role created", role });
    } catch (err) {
      next(err);
    }
  }
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
  async (req, res, next) => {
    try {
      const role = await Roles.updateRole(req, res, next);
      res.status(200).json({ message: "Role updated", role });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE
router.delete("/:id", 
  sessionAuth,
  Roles.deleteRole);

export default router;
