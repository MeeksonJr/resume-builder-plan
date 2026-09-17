import { describe, it, expect } from "vitest";
import {
  verifyCredential,
  generateCandidateDid,
  formatAddressOrHash,
  DEMO_VERIFIABLE_CREDENTIALS,
  VERIFIED_ISSUERS,
  VerifiableCredential,
} from "./verifiable-credentials";

describe("Web3 & Verifiable Credential Badges (Phase 56)", () => {
  it("successfully verifies standard Stanford University degree credential", () => {
    const stanfordDegree = DEMO_VERIFIABLE_CREDENTIALS[0];
    const result = verifyCredential(stanfordDegree);

    expect(result.isValid).toBe(true);
    expect(result.issuerVerified).toBe(true);
    expect(result.signatureVerified).toBe(true);
    expect(result.network).toBe("polygon-mainnet");
    expect(result.explorerUrl).toContain("polygonscan.com/tx/0x892a7f");
    expect(result.errors.length).toBe(0);
  });

  it("successfully verifies AWS professional certification credential", () => {
    const awsCert = DEMO_VERIFIABLE_CREDENTIALS[1];
    const result = verifyCredential(awsCert);

    expect(result.isValid).toBe(true);
    expect(result.isExpired).toBe(false);
    expect(result.issuerVerified).toBe(true);
    expect(result.network).toBe("polygon-mainnet");
  });

  it("successfully verifies Google employment proof credential", () => {
    const googleExp = DEMO_VERIFIABLE_CREDENTIALS[2];
    const result = verifyCredential(googleExp);

    expect(result.isValid).toBe(true);
    expect(result.signatureVerified).toBe(true);
    expect(result.issuerVerified).toBe(true);
  });

  it("detects expired credentials and reports clear validation errors", () => {
    const expiredCert: VerifiableCredential = {
      ...DEMO_VERIFIABLE_CREDENTIALS[1],
      expirationDate: "2020-01-01T00:00:00Z", // In the past
    };

    const result = verifyCredential(expiredCert);
    expect(result.isValid).toBe(false);
    expect(result.isExpired).toBe(true);
    expect(result.errors.some((e) => e.includes("expired"))).toBe(true);
  });

  it("correctly generates W3C DID identifiers and formats transaction hashes", () => {
    const did = generateCandidateDid("0xc06ed617e53847b89455120a0a58b21000000001");
    expect(did).toBe("did:pkh:eip155:137:0xc06ed617e53847b89455120a0a58b21000000001");

    const formatted = formatAddressOrHash("0x892a7f3417c80b5e28491d9047b1e8471928374a51082c4789123847abfe7291");
    expect(formatted).toBe("0x892a...7291");
  });
});
