import express from "express";
import { body } from "express-validator";
import * as DevRoles from "../controllers/developerRolesController.js";
import { sessionAuth } from "../middlewares/sessionAuth.js";

const router = express.Router();

//POST
router.post(
  "/",
  sessionAuth,
  [
    body("developer_id").isInt().withMessage("Developer ID must be an integer"),
    body("role_id").isInt().withMessage("Role ID must be an integer"),
  ],
  DevRoles.assignRole,
);

//DELETE
router.delete(
  "/",
  sessionAuth,
  [
    body("developer_id").isInt().withMessage("Developer ID must be an integer"),
    body("role_id").isInt().withMessage("Role ID must be an integer"),
  ],
  DevRoles.removeRole,
);
router.get("/:developer_id", DevRoles.getRolesByDeveloper);

export default router;
