import { describe, expect, it } from "vitest";

describe("configured Orka Lotus branding endpoint", () => {
  it("responds to a lightweight request for the exact supplied logo", async () => {
    const logoUrl = "https://www.orkalotusbeach.com/wp-content/themes/yktheme/assets/img/logo_sub.png";
    const response = await fetch(logoUrl, { method: "HEAD" });
    expect(response.status).toBeLessThan(500);
  }, 15_000);
});
