import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";
import { openAPI, bearer } from "better-auth/plugins";
import { polar, checkout, portal } from "@polar-sh/better-auth";
import { polarClient } from "@/lib/polar";
import { PLANS } from "./constants";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  baseURL: "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 4,
  },
  plugins: [
    openAPI(),
    bearer(),
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      onCustomerCreate: async ({ customer, user }) => {
        const userId = user.id;
        const polarCustomerId = customer.id;
        await createDefaultSubscription(userId, polarCustomerId);
      },
      use: [
        checkout({
          products: PLANS.filter(p => p.productId).map(p => ({
            productId: p.productId!,
            slug: p.name,
          })),
          successUrl: "/billing?success=true",
          returnUrl: "/billing?error=true",
          authenticatedUsersOnly: true,
        }),
        portal(),
      ],
    }),
  ],
});
