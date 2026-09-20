import Razorpay from "razorpay"
import crypto from "crypto"
import { getRazorpayConfig } from "@/lib/serverConfig"

/**
 * Build a Razorpay client from the key id/secret stored in admin Settings,
 * falling back to env vars. Returns null (with the resolved keyId) when
 * Razorpay hasn't been configured yet.
 */
export async function getRazorpay(): Promise<{ client: Razorpay; keyId: string } | null> {
    const cfg = await getRazorpayConfig()
    if (!cfg.keyId || !cfg.keySecret) return null
    return {
        client: new Razorpay({ key_id: cfg.keyId, key_secret: cfg.keySecret }),
        keyId: cfg.keyId,
    }
}

/**
 * Verify the signature Razorpay Checkout returns after a successful payment:
 * HMAC-SHA256(order_id + "|" + payment_id, key_secret) must equal the signature.
 */
export async function verifyRazorpaySignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    signature: string
): Promise<boolean> {
    const cfg = await getRazorpayConfig()
    if (!cfg.keySecret || !razorpayOrderId || !razorpayPaymentId || !signature) return false
    const expected = crypto
        .createHmac("sha256", cfg.keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex")
    // Constant-time compare
    const a = Buffer.from(expected)
    const b = Buffer.from(signature)
    return a.length === b.length && crypto.timingSafeEqual(a, b)
}
