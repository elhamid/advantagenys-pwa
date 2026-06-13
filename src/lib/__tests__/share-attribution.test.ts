import { describe, expect, it } from "vitest";
import { getShareAttributionFromSearch } from "../forms/share-attribution";

describe("share attribution", () => {
  it("keeps only opaque share attribution from public URLs", () => {
    expect(
      getShareAttributionFromSearch(
        "?shared_by=staff-123&shared_by_name=Kedar&shared_by_email=kedar@example.com&send_id=event-123&utm_source=advantageos&utm_medium=staff_share&utm_campaign=form_share"
      )
    ).toEqual({
      sharedBy: "staff-123",
      formSendId: "event-123",
      utmSource: "advantageos",
      utmMedium: "staff_share",
      utmCampaign: "form_share",
    });
  });

  it("accepts form send id aliases used by taskboard links", () => {
    expect(getShareAttributionFromSearch("?form_send_id=event-a")).toEqual({
      formSendId: "event-a",
    });
    expect(getShareAttributionFromSearch("?formSendId=event-b")).toEqual({
      formSendId: "event-b",
    });
    expect(getShareAttributionFromSearch("?sendId=event-c")).toEqual({
      formSendId: "event-c",
    });
  });
});
