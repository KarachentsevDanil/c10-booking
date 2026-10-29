import { createHmac } from "node:crypto";
import { verifyPayLinkSignature } from "./paylink";

const secret = "whsec_test";
const body = Buffer.from(JSON.stringify({ type: "refund.succeeded", refundId: "rf_1" }));
const sign = (raw: Buffer) => createHmac("sha256", secret).update(raw).digest("hex");

describe("verifyPayLinkSignature", () => {
  it("приймає підпис від того самого тіла", () => {
    expect(verifyPayLinkSignature(body, sign(body), secret)).toBe(true);
  });

  it("відхиляє підпис від іншого тіла", () => {
    expect(verifyPayLinkSignature(body, sign(Buffer.from("{}")), secret)).toBe(false);
  });

  it("відхиляє запит без підпису", () => {
    expect(verifyPayLinkSignature(body, undefined, secret)).toBe(false);
  });
});
