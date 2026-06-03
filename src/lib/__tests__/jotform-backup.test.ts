import { describe, expect, it } from "vitest";
import { JOTFORM_BACKUP_MARKER, buildJotformBackupParams } from "../jotform-backup";

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
    expect(params.get("submission[74]")).toContain(JOTFORM_BACKUP_MARKER);
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

  it("maps insurance submissions into the insurance backup fields", () => {
    const params = buildJotformBackupParams("insurance", {
      type: "insurance",
      fullName: "INES INSURED",
      phone: "5165550199",
      email: "ines@example.com",
      businessName: "INES MARKET INC",
      businessType: "Corporation",
      numberOfEmployees: "7",
      annualRevenue: "$450,000",
      industryTrade: "Grocery",
      insuranceTypesNeeded: ["Workers Comp", "General Liability"],
      sharedBy: "staff-user-789",
    });

    expect(params.get("submission[3_first]")).toBe("INES");
    expect(params.get("submission[3_last]")).toBe("INSURED");
    expect(params.get("submission[4]")).toBe("ines@example.com");
    expect(params.get("submission[71]")).toBe("Corporation");
    expect(params.get("submission[94]")).toBe("INES MARKET INC");
    expect(params.get("submission[95_area]")).toBe("516");
    expect(params.get("submission[95_phone]")).toBe("5550199");
    expect(params.get("submission[98]")).toBe("7");
    expect(params.get("submission[99]")).toBe("$450,000");
    expect(params.get("submission[96]")).toContain("Grocery");
    expect(params.get("submission[96]")).toContain("Workers Comp, General Liability");
    expect(params.get("submission[96]")).toContain("Shared-by id: staff-user-789");
  });

  it("maps home-improvement submissions into the active HIC backup fields", () => {
    const params = buildJotformBackupParams("home-improvement", {
      type: "home-improvement",
      fullName: "HECTOR CONTRACTOR",
      phone: "3475550106",
      email: "hector@example.com",
      licenseType: "Home improvement",
      hasExistingLicense: "No",
      message: "Needs NYC license",
      sharedBy: "staff-user-hic",
    });

    expect(params.get("submission[4_first]")).toBe("HECTOR");
    expect(params.get("submission[4_last]")).toBe("CONTRACTOR");
    expect(params.get("submission[5]")).toBe("hector@example.com");
    expect(params.get("submission[6_area]")).toBe("347");
    expect(params.get("submission[6_phone]")).toBe("5550106");
    expect(params.get("submission[17]")).toBe("Home improvement");
    expect(params.get("submission[18]")).toBe("No");
    expect(params.get("submission[16]")).toContain("Needs NYC license");
    expect(params.get("submission[16]")).toContain("Shared-by id: staff-user-hic");
  });

  it("maps immigration petitioner submissions with DOB and trace notes", () => {
    const params = buildJotformBackupParams("immigration-petitioner", {
      type: "immigration-petitioner",
      fullName: "PETRA SPONSOR",
      phone: "7185550144",
      email: "petra@example.com",
      birthdate: "1982-04-09",
      countryOfBirth: "Guyana",
      cityOfBirth: "Georgetown",
      socialSecurity: "123-45-6789",
      homeAddress: "10 Home St",
      mailingAddress: "PO Box 11",
      sharedBy: "staff-user-imm",
    });

    expect(params.get("submission[4_first]")).toBe("PETRA");
    expect(params.get("submission[4_last]")).toBe("SPONSOR");
    expect(params.get("submission[6_month]")).toBe("04");
    expect(params.get("submission[6_day]")).toBe("09");
    expect(params.get("submission[6_year]")).toBe("1982");
    expect(params.get("submission[7]")).toBe("Guyana");
    expect(params.get("submission[8]")).toBe("Georgetown");
    expect(params.get("submission[15]")).toBe("123-45-6789");
    expect(params.get("submission[16_area]")).toBe("718");
    expect(params.get("submission[16_phone]")).toBe("5550144");
    expect(params.get("submission[17]")).toBe("petra@example.com");
    expect(params.get("submission[18_addr_line1]")).toBe("10 Home St");
    expect(params.get("submission[19_addr_line1]")).toBe("PO Box 11");
    expect(params.get("submission[26]")).toContain("Shared-by id: staff-user-imm");
  });

  it("maps immigration beneficiary submissions to the beneficiary note field", () => {
    const params = buildJotformBackupParams("immigration-beneficiary", {
      type: "immigration-beneficiary",
      fullName: "BEN BENEFICIARY",
      phone: "9295550155",
      email: "ben@example.com",
      dateOfBirth: "1990-12-31",
      sharedBy: "staff-user-beneficiary",
    });

    expect(params.get("submission[4_first]")).toBe("BEN");
    expect(params.get("submission[4_last]")).toBe("BENEFICIARY");
    expect(params.get("submission[6_month]")).toBe("12");
    expect(params.get("submission[6_day]")).toBe("31");
    expect(params.get("submission[6_year]")).toBe("1990");
    expect(params.get("submission[16_area]")).toBe("929");
    expect(params.get("submission[16_phone]")).toBe("5550155");
    expect(params.get("submission[17]")).toBe("ben@example.com");
    expect(params.get("submission[36]")).toContain("Shared-by id: staff-user-beneficiary");
  });

  it("maps tax-return submissions into the annual tax backup fields", () => {
    const params = buildJotformBackupParams("tax-return", {
      type: "tax-return",
      fullName: "TARA TAXPAYER",
      phone: "6465550177",
      email: "tara@example.com",
      dateOfBirth: "1975-01-20",
      socialSecurity: "111-22-3333",
      occupation: "Driver",
      address: "12 Tax Ave",
      city: "Queens",
      state: "NY",
      zipCode: "11411",
      businessName: "TARA RIDES LLC",
      sharedBy: "staff-user-tax",
    });

    expect(params.get("submission[3_first]")).toBe("TARA");
    expect(params.get("submission[3_last]")).toBe("TAXPAYER");
    expect(params.get("submission[6]")).toBe("111-22-3333");
    expect(params.get("submission[7]")).toBe("Driver");
    expect(params.get("submission[8_month]")).toBe("01");
    expect(params.get("submission[8_day]")).toBe("20");
    expect(params.get("submission[8_year]")).toBe("1975");
    expect(params.get("submission[9]")).toBe("tara@example.com");
    expect(params.get("submission[10_area]")).toBe("646");
    expect(params.get("submission[10_phone]")).toBe("5550177");
    expect(params.get("submission[19_addr_line1]")).toBe("12 Tax Ave");
    expect(params.get("submission[19_city]")).toBe("Queens");
    expect(params.get("submission[19_state]")).toBe("NY");
    expect(params.get("submission[19_postal]")).toBe("11411");
    expect(params.get("submission[249]")).toBe("TARA RIDES LLC");
    expect(params.get("submission[163]")).toContain("Shared-by id: staff-user-tax");
  });
});
