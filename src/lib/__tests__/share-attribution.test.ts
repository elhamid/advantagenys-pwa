import { describe, expect, it } from "vitest";
import { getShareAttributionFromSearch } from "../forms/share-attribution";

describe("share attribution", () => {
  it("keeps only opaque share attribution from public URLs", () => {
    expect(
      getShareAttributionFromSearch(
        "?shared_by=staff-123&shared_by_name=Kedar&shared_by_email=kedar@example.com&utm_source=advantageos&utm_medium=staff_share&utm_campaign=form_share"
      )
    ).toEqual({
      sharedBy: "staff-123",
      utmSource: "advantageos",
      utmMedium: "staff_share",
      utmCampaign: "form_share",
    });
  });
});
