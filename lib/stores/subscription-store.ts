import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

export type SubscriptionStatus =
    | 'active'
    | 'trialing'
    | 'past_due'
    | 'canceled'
    | 'unpaid'
    | 'incomplete'
    | 'incomplete_expired'
    | 'paused'
    | 'inactive'; // Default for non-subscribers

export interface SubscriptionState {
    isLoading: boolean;
    isPro: boolean;
    status: SubscriptionStatus;
    planId: string | null;
    currentPeriodEnd: Date | null;
    features: {
        unlimitedResumes: boolean;
        aiInterviewAccess: boolean;
        advancedAnalytics: boolean;
        removeBranding: boolean;
    };
    checkSubscription: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
    isLoading: true,
    isPro: false,
    status: 'inactive',
    planId: null,
    currentPeriodEnd: null,
    features: {
        unlimitedResumes: false,
        aiInterviewAccess: false,
        advancedAnalytics: false,
        removeBranding: false,
    },

    checkSubscription: async () => {
        try {
            set({ isLoading: true });
            const supabase = createClient();

            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                set({
                    isLoading: false,
                    isPro: false,
                    status: 'inactive',
                    features: {
                        unlimitedResumes: false,
                        aiInterviewAccess: false,
                        advancedAnalytics: false,
                        removeBranding: false,
                    }
                });
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('subscription_status, stripe_price_id, stripe_current_period_end')
                .eq('id', user.id)
                .single();

            if (!profile) return;

            const status = (profile.subscription_status as SubscriptionStatus) || 'inactive';
            const isActive = status === 'active' || status === 'trialing';

            set({
                isLoading: false,
                isPro: isActive,
                status,
                planId: profile.stripe_price_id,
                currentPeriodEnd: profile.stripe_current_period_end ? new Date(profile.stripe_current_period_end) : null,
                features: {
                    unlimitedResumes: isActive,
                    aiInterviewAccess: isActive, // Or limited logic for free
                    advancedAnalytics: isActive,
                    removeBranding: isActive,
                }
            });
        } catch (error) {
            console.error('Error checking subscription:', error);
            set({ isLoading: false });
        }
    }
}));
