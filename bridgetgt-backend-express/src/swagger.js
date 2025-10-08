import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BridgetGT Backend API",
      version: "1.0.0",
      description: "API documentation for BridgetGT status board backend.",
    },
    servers: [{ url: "http://localhost:3001" }],
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app) => {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
