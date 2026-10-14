import { app } from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.PORT, () => {
  console.log(`🚀 YSET API Server running on port ${env.PORT} (${env.NODE_ENV})`);
  console.log(`📍 Health Check: http://localhost:${env.PORT}${env.API_PREFIX}/health`);
  console.log(`🌐 Allowed Client Origin: ${env.CLIENT_ORIGIN}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
});
