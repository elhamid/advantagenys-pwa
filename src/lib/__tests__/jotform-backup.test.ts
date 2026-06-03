import { describe, expect, it } from "vitest";
import { buildJotformBackupParams } from "../jotform-backup";

describe("Jotform backup mapping", () => {
  it("maps corporation services submissions into the real Corporation Services Jotform fields", () => {
    const params = buildJotformBackupParams("corporate-registration", {
      type: "corporate-registration",
      fullName: "ALEX OWNER",
      phone: "9295550102",
      email: "alex@example.com",
      desiredBusinessName: "ALEX LLC",
      businessType: "LLC",
      businessAddress: "229-14 LINDEN BLVD",
      city: "CAMBRIA HEIGHTS",
      state: "NY",
      zipCode: "11411",
      natureOfBusiness: "CONSTRUCTION",
      sharedBy: "staff-user-123",
      sharedByName: "Kedar",
      sharedByEmail: "kedar@advantagenys.com",
      utmSource: "advantageos",
      utmMedium: "staff_share",
      utmCampaign: "form_share",
    });

    expect(params.get("submission[3_first]")).toBe("ALEX");
    expect(params.get("submission[3_last]")).toBe("OWNER");
    expect(params.get("submission[4]")).toBe("alex@example.com");
    expect(params.get("submission[71]")).toBe("LLC");
    expect(params.get("submission[94]")).toBe("ALEX LLC");
    expect(params.get("submission[95_area]")).toBe("929");
    expect(params.get("submission[95_phone]")).toBe("5550102");
    expect(params.get("submission[96_addr_line1]")).toBe("229-14 LINDEN BLVD");
    expect(params.get("submission[96_city]")).toBe("CAMBRIA HEIGHTS");
    expect(params.get("submission[96_state]")).toBe("NY");
    expect(params.get("submission[96_postal]")).toBe("11411");
    expect(params.get("submission[74]")).toContain("CONSTRUCTION");
    expect(params.get("submission[74]")).toContain("Shared-by id: staff-user-123");
    expect(params.get("submission[74]")).not.toContain("Kedar");
    expect(params.get("submission[74]")).not.toContain("kedar@advantagenys.com");
    expect(params.get("submission[74]")).toContain("UTM medium: staff_share");
  });

  it("maps client intake submissions with a staff-share trace note", () => {
    const params = buildJotformBackupParams("client-info", {
      type: "client-info",
      fullName: "JANE CLIENT",
      phone: "9295550101",
      email: "jane@example.com",
      address: "100 MAIN ST",
      city: "QUEENS",
      state: "NY",
      zipCode: "11411",
      serviceType: "Tax Services",
      sharedBy: "staff-user-456",
      sharedByName: "Jay",
    });

    expect(params.get("submission[3_first]")).toBe("JANE");
    expect(params.get("submission[3_last]")).toBe("CLIENT");
    expect(params.get("submission[4]")).toBe("jane@example.com");
    expect(params.get("submission[8_addr_line1]")).toBe("100 MAIN ST");
    expect(params.get("submission[95_area]")).toBe("929");
    expect(params.get("submission[95_phone]")).toBe("5550101");
    expect(params.get("submission[96]")).toContain("Shared-by id: staff-user-456");
    expect(params.get("submission[96]")).not.toContain("Jay");
    expect(params.get("submission[96]")).toContain("Service: Tax Services");
  });
});
