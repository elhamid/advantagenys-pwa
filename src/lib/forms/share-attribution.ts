export interface ShareAttribution {
  sharedBy?: string;
  formSendId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

const PARAM_MAP: Record<string, keyof ShareAttribution> = {
  shared_by: "sharedBy",
  send_id: "formSendId",
  form_send_id: "formSendId",
  formSendId: "formSendId",
  sendId: "formSendId",
  utm_source: "utmSource",
  utm_medium: "utmMedium",
  utm_campaign: "utmCampaign",
};

export function getShareAttributionFromSearch(search: string): ShareAttribution {
  const params = new URLSearchParams(search);
  const attribution: ShareAttribution = {};

  for (const [param, key] of Object.entries(PARAM_MAP)) {
    const value = params.get(param)?.trim();
    if (value) {
      attribution[key] = value;
    }
  }

  return attribution;
}

export function getShareAttributionFromLocation(): ShareAttribution {
  if (typeof window === "undefined") {
    return {};
  }

  return getShareAttributionFromSearch(window.location.search);
}
