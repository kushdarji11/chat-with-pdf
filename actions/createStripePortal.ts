'use server'

import { adminDb } from "@/firebaseAdmin";
import getBaseUrl from "@/lib/getBaseUrl";
import { auth } from "@clerk/nextjs/server";
import stripe from "@/lib/stripe";

export async function createStripePortal(){
    auth.protect();

    const {userId} = await auth();

    if(!userId) {
        throw new Error("User not found");
    }

    const user = await adminDb.collection("users").doc(userId).get();
    const stripeCustomerId = user.data()?.stripeCustomerId;

    if(!stripeCustomerId){
        throw new Error("Stripe customer not found");
    }

    const session = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: `${getBaseUrl()}/dashboard`,
    });

    return session.url;
}