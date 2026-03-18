import { describe, it, expect } from "vitest";
import { PHONE, ADDRESS, HOURS, SERVICES, TEAM, STATS, SEGMENTS } from "../constants";

describe("PHONE", () => {
  it("main phone number matches expected format", () => {
    expect(PHONE.main).toBe("929-933-1396");
  });

  it("mainTel is in E.164 format (starts with +1)", () => {
    expect(PHONE.mainTel).toMatch(/^\+1\d{10}$/);
    expect(PHONE.mainTel).toBe("+19299331396");
  });

  it("whatsapp number is defined", () => {
    expect(PHONE.whatsapp).toBe("929-933-1396");
  });

  it("whatsappLink is a valid wa.me URL", () => {
    expect(PHONE.whatsappLink).toMatch(/^https:\/\/wa\.me\/\d+$/);
    expect(PHONE.whatsappLink).toBe("https://wa.me/19299331396");
  });

  it("whatsappLink contains the whatsapp number digits", () => {
    const digits = PHONE.whatsapp.replace(/-/g, "");
    expect(PHONE.whatsappLink).toContain(digits);
  });
});

describe("ADDRESS", () => {
  it("street address is correct", () => {
    expect(ADDRESS.street).toBe("229-14 Linden Blvd");
  });

  it("city is Cambria Heights", () => {
    expect(ADDRESS.city).toBe("Cambria Heights");
  });

  it("state is NY", () => {
    expect(ADDRESS.state).toBe("NY");
  });

  it("zip code is 11411", () => {
    expect(ADDRESS.zip).toBe("11411");
  });

  it("full address includes street, city, state, zip", () => {
    expect(ADDRESS.full).toContain(ADDRESS.street);
    expect(ADDRESS.full).toContain(ADDRESS.city);
    expect(ADDRESS.full).toContain(ADDRESS.state);
    expect(ADDRESS.full).toContain(ADDRESS.zip);
  });

  it("googleMaps is a valid URL containing the address", () => {
    expect(ADDRESS.googleMaps).toMatch(/^https:\/\/maps\.google\.com/);
    expect(ADDRESS.googleMaps).toContain("229-14");
  });
});

describe("HOURS", () => {
  it("days covers Monday through Saturday", () => {
    expect(HOURS.days).toContain("Monday");
    expect(HOURS.days).toContain("Saturday");
  });

  it("time is 10:00 AM - 8:00 PM", () => {
    expect(HOURS.time).toBe("10:00 AM - 8:00 PM");
  });

  it("time contains AM and PM markers", () => {
    expect(HOURS.time).toContain("AM");
    expect(HOURS.time).toContain("PM");
  });

  it("timezone is ET", () => {
    expect(HOURS.timezone).toBe("ET");
  });
});

describe("SERVICES", () => {
  it("has 7 service entries", () => {
    expect(SERVICES).toHaveLength(7);
  });

  it("every service has name, href, icon, description", () => {
    SERVICES.forEach((service) => {
      expect(service.name).toBeTruthy();
      expect(service.href).toBeTruthy();
      expect(service.icon).toBeTruthy();
      expect(service.description).toBeTruthy();
    });
  });

  it("every href starts with '/services/'", () => {
    SERVICES.forEach((service) => {
      expect(service.href).toMatch(/^\/services\//);
    });
  });

  it("every href ends with '/'", () => {
    SERVICES.forEach((service) => {
      expect(service.href.endsWith("/")).toBe(true);
    });
  });

  it("contains Business Formation", () => {
    const found = SERVICES.find((s) => s.name === "Business Formation");
    expect(found).toBeDefined();
    expect(found?.href).toBe("/services/business-formation/");
  });

  it("contains Tax Services", () => {
    const found = SERVICES.find((s) => s.name === "Tax Services");
    expect(found).toBeDefined();
    expect(found?.href).toBe("/services/tax-services/");
  });

  it("contains Legal Services", () => {
    const found = SERVICES.find((s) => s.name === "Legal Services");
    expect(found).toBeDefined();
    expect(found?.href).toBe("/services/legal/");
  });

  it("contains Insurance", () => {
    const found = SERVICES.find((s) => s.name === "Insurance");
    expect(found).toBeDefined();
  });

  it("contains Audit Defense", () => {
    const found = SERVICES.find((s) => s.name === "Audit Defense");
    expect(found).toBeDefined();
  });

  it("contains Financial Services", () => {
    const found = SERVICES.find((s) => s.name === "Financial Services");
    expect(found).toBeDefined();
  });

  it("contains Licensing", () => {
    const found = SERVICES.find((s) => s.name === "Licensing");
    expect(found).toBeDefined();
  });

  it("all service names are unique", () => {
    const names = SERVICES.map((s) => s.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it("all hrefs are unique", () => {
    const hrefs = SERVICES.map((s) => s.href);
    const unique = new Set(hrefs);
    expect(unique.size).toBe(hrefs.length);
  });
});

describe("TEAM", () => {
  it("has 6 team members", () => {
    expect(TEAM).toHaveLength(6);
  });

  it("every member has name, fullName, role, specialties", () => {
    TEAM.forEach((member) => {
      expect(member.name).toBeTruthy();
      expect(member.fullName).toBeTruthy();
      expect(member.role).toBeTruthy();
      expect(Array.isArray(member.specialties)).toBe(true);
      expect(member.specialties.length).toBeGreaterThan(0);
    });
  });

  it("contains Jay (President)", () => {
    const jay = TEAM.find((m) => m.name === "Jay");
    expect(jay).toBeDefined();
    expect(jay?.fullName).toContain("Sanjay");
    expect(jay?.role).toContain("President");
  });

  it("contains Kedar (IRS Certified Tax Preparer)", () => {
    const kedar = TEAM.find((m) => m.name === "Kedar");
    expect(kedar).toBeDefined();
    expect(kedar?.role).toContain("IRS Certified");
  });

  it("contains Hamid (Growth Operator)", () => {
    const hamid = TEAM.find((m) => m.name === "Hamid");
    expect(hamid).toBeDefined();
    expect(hamid?.role).toBe("Growth Operator");
    expect(hamid?.specialties).toContain("Tech");
  });

  it("all team member names are unique", () => {
    const names = TEAM.map((m) => m.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });
});

describe("STATS", () => {
  it("businessSetups count is a positive number", () => {
    expect(STATS.businessSetups.count).toBeGreaterThan(0);
    expect(STATS.businessSetups.count).toBe(1700);
  });

  it("taxClients count is greater than businessSetups", () => {
    expect(STATS.taxClients.count).toBeGreaterThan(STATS.businessSetups.count);
  });

  it("every stat has a label and suffix", () => {
    Object.values(STATS).forEach((stat) => {
      expect(stat.label).toBeTruthy();
      expect(stat.suffix).toBeTruthy();
    });
  });

  it("all suffix values are '+'", () => {
    Object.values(STATS).forEach((stat) => {
      expect(stat.suffix).toBe("+");
    });
  });
});

describe("SEGMENTS", () => {
  it("has 3 industry segments", () => {
    expect(SEGMENTS).toHaveLength(3);
  });

  it("contains Contractors segment", () => {
    const contractors = SEGMENTS.find((s) => s.name === "Contractors");
    expect(contractors).toBeDefined();
    expect(contractors?.href).toBe("/industries/contractors/");
  });

  it("contains Restaurants segment", () => {
    const restaurants = SEGMENTS.find((s) => s.name === "Restaurants");
    expect(restaurants).toBeDefined();
    expect(restaurants?.href).toBe("/industries/restaurants/");
  });

  it("contains Immigrant Entrepreneurs segment", () => {
    const immigrant = SEGMENTS.find((s) => s.name === "Immigrant Entrepreneurs");
    expect(immigrant).toBeDefined();
    expect(immigrant?.href).toBe("/industries/immigrant-entrepreneurs/");
  });

  it("every segment has name, href, tagline, journey", () => {
    SEGMENTS.forEach((segment) => {
      expect(segment.name).toBeTruthy();
      expect(segment.href).toBeTruthy();
      expect(segment.tagline).toBeTruthy();
      expect(segment.journey).toBeTruthy();
    });
  });

  it("all segment hrefs start with '/industries/'", () => {
    SEGMENTS.forEach((segment) => {
      expect(segment.href).toMatch(/^\/industries\//);
    });
  });
});
