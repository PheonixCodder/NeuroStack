import { NextRequest, NextResponse } from "next/server";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { PLANS, PLAN_ENUM } from "@/lib/constants";
import prisma from "@/lib/prisma";

interface PolarWebhookEvent<TData = unknown> {
  id: string | number;
  type: string;
  timestamp?: string;
  data: TData;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.POLAR_WEBHOOK_SECRET ?? "";
  if (!secret) {
    return new NextResponse("Missing POLAR_WEBHOOK_SECRET", { status: 500 });
  }

  const raw = await req.arrayBuffer();
  const headersObject = Object.fromEntries(req.headers);

  let verified: unknown;
  try {
    verified = validateEvent(Buffer.from(raw), headersObject, secret);
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      return new NextResponse("Invalid signature", { status: 403 });
    }
    throw err;
  }

  const evt = verified as PolarWebhookEvent<unknown>;
  const eventType = evt.type;
  const payload = evt.data as any;

  try {
    // Handle webhook events
    switch (eventType) {
      case "customer.created": {
        const customer = payload;
        const userId = customer.external_id as string | null;
        const polarCustomerId = customer.id;

        // Only create subscription if external_id is set (should be user ID)
        if (userId) {
          const existing = await prisma.subscription.findFirst({
            where: { referenceId: userId },
          });
          if (!existing) {
            await prisma.subscription.create({
              data: {
                referenceId: userId,
                plan: PLAN_ENUM.FREE,
                polarCustomerId: polarCustomerId,
                status: "active",
              },
            });
          }
        } else {
          console.warn(`Customer created without external_id: ${polarCustomerId}`);
        }
        break;
      }

      case "subscription.created":
      case "subscription.updated": {
        const subscription = payload;
        const plan = PLANS.find(p => p.productId === subscription.product_id)?.name as typeof PLAN_ENUM[keyof typeof PLAN_ENUM] | undefined;
        
        if (!plan) {
          console.log(`Unknown product ID: ${subscription.product_id}`);
          break;
        }

        // Find user subscription by polar subscription ID
        const userSub = await prisma.subscription.findFirst({
          where: { polarSubscriptionId: subscription.id },
        });

        if (!userSub) {
          console.log(`Subscription not found for Polar subscription ${subscription.id}`);
          break;
        }

        const updateData: any = {
          polarSubscriptionId: subscription.id,
          polarProductId: subscription.product_id,
          status: subscription.status,
          plan,
        };

        // Optional fields
        if (subscription.current_period_start) {
          updateData.periodStart = new Date(subscription.current_period_start);
        }
        if (subscription.current_period_end) {
          updateData.periodEnd = new Date(subscription.current_period_end);
        }
        if (subscription.cancel_at_period_end !== undefined) {
          updateData.cancelAtPeriodEnd = subscription.cancel_at_period_end;
        }
        if (subscription.trial_start) {
          updateData.trialStart = new Date(subscription.trial_start);
        }
        if (subscription.trial_end) {
          updateData.trialEnd = new Date(subscription.trial_end);
        }

        await prisma.subscription.update({
          where: { id: userSub.id },
          data: updateData,
        });
        break;
      }

      case "subscription.canceled":
      case "subscription.revoked": {
        const subscription = payload;
        await prisma.subscription.updateMany({
          where: { polarSubscriptionId: subscription.id },
          data: { status: "canceled" },
        });
        break;
      }

      case "subscription.uncanceled": {
        const subscription = payload;
        await prisma.subscription.updateMany({
          where: { polarSubscriptionId: subscription.id },
          data: { status: "active", cancelAtPeriodEnd: false },
        });
        break;
      }

      case "subscription.past_due": {
        const subscription = payload;
        await prisma.subscription.updateMany({
          where: { polarSubscriptionId: subscription.id },
          data: { status: "past_due" },
        });
        break;
      }

      default:
        console.log(`Unhandled Polar webhook event: ${eventType}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Polar webhook processing error:", error);
    return new NextResponse("Failed to process webhook", { status: 500 });
  }
}
