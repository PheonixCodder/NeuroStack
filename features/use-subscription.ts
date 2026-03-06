import { authClient } from "@/lib/auth-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PLANS } from "@/lib/constants";
import type { PaidPlanEnumType } from "@/lib/constants";

export const useUpgradeSubscription = () => {
  return useMutation({
    mutationFn: async (plan: PaidPlanEnumType) => {
      const planData = PLANS.find(p => p.name === plan);
      if (!planData?.productId) throw new Error("Invalid plan");

      const { url } = await authClient.checkout.create({
        products: [planData.productId],
      });
      return { checkoutUrl: url };
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error: any) => {
      toast.error(error?.message ?? "Failed to upgrade subscription");
    },
  });
};

export const useCheckGenerations = () => {
  return useQuery({
    queryKey: ["generations"],
    queryFn: async () => {
      const response = await fetch("/api/subscription/generations", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch generation");
      const { data } = await response.json();
      return data;
    },
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
};
