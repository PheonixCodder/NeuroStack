import { checkGenerationLimit } from "@/actions/actions";
import { getAuthUser } from "@/lib/hono/hono-middleware";
import { Hono } from "hono";
import { z } from "zod";

export const subscriptionRoute = new Hono()
  .get("/generations", getAuthUser, async (c) => {
    try {
      const user = c.get("user");
      const data = await checkGenerationLimit(user.id);
      return c.json({
        succes: true,
        data,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Failed to retrieve generations data.");
    }
  });
