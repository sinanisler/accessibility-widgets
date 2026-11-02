import { serve } from "@hono/node-server";
import app from "./app.js";
import { ensureSeed } from "./db.js";

const port = Number(process.env.PORT || 8787);

await ensureSeed();
serve({ fetch: app.fetch, port }, () => {
  console.log(`API listening on http://127.0.0.1:${port}`);
});
