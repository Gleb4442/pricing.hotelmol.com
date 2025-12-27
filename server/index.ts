import { log } from "./vite";
import { createApp } from "./app";

(async () => {
  const { app, server } = await createApp();

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
