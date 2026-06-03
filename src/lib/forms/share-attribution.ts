export interface ShareAttribution {
  sharedBy?: string;
  sharedByName?: string;
  sharedByEmail?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

const PARAM_MAP: Record<string, keyof ShareAttribution> = {
  shared_by: "sharedBy",
  shared_by_name: "sharedByName",
  shared_by_email: "sharedByEmail",
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
