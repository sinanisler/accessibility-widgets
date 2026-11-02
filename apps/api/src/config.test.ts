import { describe, expect, it } from "vitest";
import { z } from "zod";

const eventsSchema = z.object({
  events: z.array(
    z.object({
      siteKey: z.string(),
      event: z.string(),
      featureId: z.string().optional(),
    }),
  ),
});

describe("events schema", () => {
  it("accepts batched events", () => {
    const parsed = eventsSchema.parse({
      events: [{ siteKey: "demo", event: "widget_init" }],
    });
    expect(parsed.events).toHaveLength(1);
  });
});
