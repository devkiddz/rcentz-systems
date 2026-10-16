import { createHmac, timingSafeEqual } from "node:crypto";
import {
  parseServiceChoice,
  ServiceChoiceError,
  type ServiceChoice,
} from "../lib/service-selection";
export const SERVICE_CHOICE_COOKIE = "rcentz_service_choice_v1";
const ttl = 2 * 60 * 60 * 1000;
function sign(value: string, secret: string) {
  return createHmac("sha256", secret)
    .update("rcentz-service-choice-v1:" + value)
    .digest("hex");
}
export function sealServiceChoice(
  choice: ServiceChoice,
  userId: string,
  secret: string,
  now = Date.now(),
) {
  if (secret.length < 32)
    throw new ServiceChoiceError(
      "Project selection is not configured. Please contact the team.",
    );
  const encoded = Buffer.from(
    JSON.stringify({ choice, userId, expires: now + ttl }),
  ).toString("base64url");
  const token = encoded + "." + sign(encoded, secret);
  if (token.length > 3800)
    throw new ServiceChoiceError(
      "Please shorten the additional requirements before continuing.",
    );
  return token;
}
export function openServiceChoice(
  token: string | undefined,
  userId: string,
  secret: string,
  now = Date.now(),
): ServiceChoice | null {
  if (!token || token.length > 3800 || secret.length < 32) return null;
  const [encoded, signature, extra] = token.split(".");
  if (
    extra ||
    !/^[a-f0-9]{64}$/.test(signature ?? "") ||
    !timingSafeEqual(Buffer.from(sign(encoded, secret)), Buffer.from(signature))
  )
    return null;
  try {
    const v = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    return v.userId === userId &&
      Number.isSafeInteger(v.expires) &&
      v.expires > now &&
      v.expires <= now + ttl
      ? parseServiceChoice(v.choice)
      : null;
  } catch {
    return null;
  }
}
