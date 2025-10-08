import { logChange } from "../models/changeLogsModel.js";

export const logChangeMiddleware =
  (action, entity) => async (req, res, next) => {
    res.on("finish", async () => {
      // Only log successful write ops
      if (
        [200, 201].includes(res.statusCode) &&
        ["POST", "PUT", "DELETE"].includes(req.method)
      ) {
        let entity_id = req.params.id || null;
        let details = JSON.stringify(req.body);

        // CREATE log
        if (
          action === "create" &&
          res.statusCode === 201 &&
          res.locals?.createdId
        ) {
          entity_id = res.locals.createdId;
        }

        // DELETE log → include deletedDetails
        if (action === "delete" && res.locals?.deletedDetails) {
          details = JSON.stringify(res.locals.deletedDetails);
        }

        if (entity === "developer_role") {
          entity = "developer";
          action = "update";
          if (res.locals?.updatedId) {
            entity_id = res.locals.updatedId;
          }
          if (res.locals?.updatedDetails) {
            details = JSON.stringify(res.locals.updatedDetails);
          }
        }
        if (action === "update" && res.locals && res.locals.updatedDetails) {
          details = JSON.stringify(res.locals.updatedDetails);
        }
        const session_id =
          req.session?.id || req.session?.ID || req.session?.Id || null;
        console.log("Logging update:", { action, entity, entity_id, details });
        await logChange({
          session_id,
          action,
          entity,
          entity_id,
          details,
        });
      }
    });
    next();
  };
