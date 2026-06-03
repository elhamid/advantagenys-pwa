type LeadType =
  | "corporate-registration"
  | "client-info"
  | "home-improvement"
  | "insurance"
  | "immigration-petitioner"
  | "immigration-beneficiary"
  | "tax-return";

interface BackupPayload {
  type?: string;
  fullName: string;
  phone: string;
  email?: string;
  businessName?: string;
  desiredBusinessName?: string;
  businessType?: string;
  businessAddress?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  serviceType?: string;
  services?: string[];
  message?: string;
  additionalNotes?: string;
  natureOfBusiness?: string;
  industryTrade?: string;
  numberOfEmployees?: string;
  annualRevenue?: string;
  insuranceTypesNeeded?: string[];
  licenseType?: string;
  hasExistingLicense?: string;
  licenseNumber?: string;
  birthdate?: string;
  dateOfBirth?: string;
  countryOfBirth?: string;
  cityOfBirth?: string;
  socialSecurity?: string;
  homeAddress?: string;
  mailingAddress?: string;
  sharedBy?: string;
  sharedByName?: string;
  sharedByEmail?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  [key: string]: unknown;
}

interface BackupResult {
  attempted: boolean;
  ok: boolean;
  formId?: string;
  submissionId?: string;
  error?: string;
}

const DEFAULT_FORM_IDS: Record<LeadType, string> = {
  "corporate-registration": "220796553658166",
  "client-info": "220805681432149",
  insurance: "220836887470163",
  "home-improvement": "222275688928169",
  "immigration-petitioner": "220887424251052",
  "immigration-beneficiary": "220896671023154",
  "tax-return": "230235945738159",
};

const ENV_FORM_ID_KEYS: Record<LeadType, string> = {
  "corporate-registration": "JOTFORM_CORPORATION_FORM_ID",
  "client-info": "JOTFORM_CLIENT_INFO_FORM_ID",
  insurance: "JOTFORM_INSURANCE_FORM_ID",
  "home-improvement": "JOTFORM_HOME_IMPROVEMENT_FORM_ID",
  "immigration-petitioner": "JOTFORM_IMMIGRATION_PETITIONER_FORM_ID",
  "immigration-beneficiary": "JOTFORM_IMMIGRATION_BENEFICIARY_FORM_ID",
  "tax-return": "JOTFORM_TAX_RETURN_FORM_ID",
};

function asLeadType(type: string | undefined): LeadType | null {
  if (!type) return null;
  return Object.prototype.hasOwnProperty.call(DEFAULT_FORM_IDS, type)
    ? (type as LeadType)
    : null;
}

function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts.slice(0, -1).join(" "), last: parts.at(-1) ?? "" };
}

function appendFullName(params: URLSearchParams, qid: string, fullName: string) {
  const { first, last } = splitName(fullName);
  if (first) params.append(`submission[${qid}_first]`, first);
  if (last) params.append(`submission[${qid}_last]`, last);
  if (!first && !last && fullName.trim()) {
    params.append(`submission[${qid}]`, fullName.trim());
  }
}

function appendPhone(params: URLSearchParams, qid: string, phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) {
    params.append(`submission[${qid}_area]`, digits.slice(0, 3));
    params.append(`submission[${qid}_phone]`, digits.slice(3));
    return;
  }

  params.append(`submission[${qid}_full]`, phone.trim());
}

function appendAddress(
  params: URLSearchParams,
  qid: string,
  data: Pick<BackupPayload, "address" | "businessAddress" | "city" | "state" | "zipCode">
) {
  const line1 = (data.address || data.businessAddress || "").trim();
  if (line1) params.append(`submission[${qid}_addr_line1]`, line1);
  if (data.city) params.append(`submission[${qid}_city]`, String(data.city));
  if (data.state) params.append(`submission[${qid}_state]`, String(data.state));
  if (data.zipCode) params.append(`submission[${qid}_postal]`, String(data.zipCode));
}

function appendIsoDate(params: URLSearchParams, qid: string, value: unknown) {
  if (typeof value !== "string" || !value.trim()) return;
  const [year, month, day] = value.split("-");
  if (year && month && day) {
    params.append(`submission[${qid}_month]`, month);
    params.append(`submission[${qid}_day]`, day);
    params.append(`submission[${qid}_year]`, year);
    return;
  }
  params.append(`submission[${qid}]`, value.trim());
}

function traceNote(data: BackupPayload): string {
  const parts = [
    "Backup copy from advantagenys.com",
    data.sharedBy && `Shared-by id: ${data.sharedBy}`,
    data.utmSource && `UTM source: ${data.utmSource}`,
    data.utmMedium && `UTM medium: ${data.utmMedium}`,
    data.utmCampaign && `UTM campaign: ${data.utmCampaign}`,
    data.serviceType && `Service: ${data.serviceType}`,
    data.services?.length && `Services: ${data.services.join(", ")}`,
    data.message && `Message: ${data.message}`,
    data.additionalNotes && `Notes: ${data.additionalNotes}`,
  ].filter(Boolean);

  return parts.join(" | ");
}

export function buildJotformBackupParams(type: LeadType, data: BackupPayload): URLSearchParams {
  const params = new URLSearchParams();
  const businessName = data.businessName || data.desiredBusinessName || "";
  const notes = traceNote(data);

  switch (type) {
    case "corporate-registration":
      appendFullName(params, "3", data.fullName);
      if (data.email) params.append("submission[4]", data.email);
      appendAddress(params, "8", data);
      if (data.businessType) params.append("submission[71]", data.businessType);
      if (businessName) params.append("submission[94]", businessName);
      appendPhone(params, "95", data.phone);
      appendAddress(params, "96", {
        address: data.businessAddress,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
      });
      if (data.natureOfBusiness || data.message || notes) {
        params.append(
          "submission[74]",
          [data.natureOfBusiness || data.message, notes].filter(Boolean).join(" | ")
        );
      }
      break;

    case "client-info":
      appendFullName(params, "3", data.fullName);
      if (data.email) params.append("submission[4]", data.email);
      appendAddress(params, "8", data);
      appendPhone(params, "95", data.phone);
      if (notes) params.append("submission[96]", notes);
      break;

    case "insurance":
      appendFullName(params, "3", data.fullName);
      if (data.email) params.append("submission[4]", data.email);
      if (data.businessType) params.append("submission[71]", data.businessType);
      if (businessName) params.append("submission[94]", businessName);
      appendPhone(params, "95", data.phone);
      if (data.numberOfEmployees) params.append("submission[98]", data.numberOfEmployees);
      if (data.annualRevenue) params.append("submission[99]", data.annualRevenue);
      if (notes || data.industryTrade || data.insuranceTypesNeeded?.length) {
        params.append(
          "submission[96]",
          [data.industryTrade, data.insuranceTypesNeeded?.join(", "), notes].filter(Boolean).join(" | ")
        );
      }
      break;

    case "home-improvement":
      appendFullName(params, "4", data.fullName);
      if (data.email) params.append("submission[5]", data.email);
      appendPhone(params, "6", data.phone);
      if (notes) params.append("submission[16]", notes);
      if (data.licenseType) params.append("submission[17]", data.licenseType);
      if (data.hasExistingLicense) params.append("submission[18]", data.hasExistingLicense);
      break;

    case "immigration-petitioner":
    case "immigration-beneficiary":
      appendFullName(params, "4", data.fullName);
      if (data.birthdate || data.dateOfBirth) appendIsoDate(params, "6", data.birthdate || data.dateOfBirth);
      if (data.countryOfBirth) params.append("submission[7]", data.countryOfBirth);
      if (data.cityOfBirth) params.append("submission[8]", data.cityOfBirth);
      if (data.socialSecurity) params.append("submission[15]", data.socialSecurity);
      appendPhone(params, "16", data.phone);
      if (data.email) params.append("submission[17]", data.email);
      if (typeof data.homeAddress === "string" && data.homeAddress) {
        params.append("submission[18_addr_line1]", data.homeAddress);
      }
      if (typeof data.mailingAddress === "string" && data.mailingAddress) {
        params.append("submission[19_addr_line1]", data.mailingAddress);
      }
      if (notes) {
        const noteQid = type === "immigration-petitioner" ? "26" : "36";
        params.append(`submission[${noteQid}]`, notes);
      }
      break;

    case "tax-return":
      appendFullName(params, "3", data.fullName);
      if (data.socialSecurity) params.append("submission[6]", String(data.socialSecurity));
      if (typeof data.occupation === "string") params.append("submission[7]", data.occupation);
      appendIsoDate(params, "8", data.dateOfBirth);
      if (data.email) params.append("submission[9]", data.email);
      appendPhone(params, "10", data.phone);
      appendAddress(params, "19", data);
      if (businessName) params.append("submission[249]", businessName);
      if (notes) params.append("submission[163]", notes);
      break;
  }

  return params;
}

export async function submitLeadToJotformBackup(data: BackupPayload): Promise<BackupResult> {
  const type = asLeadType(data.type);
  if (!type) {
    return { attempted: false, ok: false, error: "Unsupported form type" };
  }

  const apiKey = process.env.JOTFORM_API_KEY;
  if (!apiKey) {
    console.warn("[JotForm Backup] JOTFORM_API_KEY not set — backup write skipped");
    return { attempted: false, ok: false, formId: DEFAULT_FORM_IDS[type], error: "Missing JOTFORM_API_KEY" };
  }

  const formId = process.env[ENV_FORM_ID_KEYS[type]] || DEFAULT_FORM_IDS[type];
  const params = buildJotformBackupParams(type, data);

  try {
    const response = await fetch(`https://api.jotform.com/form/${formId}/submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        APIKEY: apiKey,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("[JotForm Backup] Submission failed:", response.status, text);
      return { attempted: true, ok: false, formId, error: `HTTP ${response.status}` };
    }

    const json = await response.json().catch(() => null);
    const submissionId =
      typeof json?.content?.submissionID === "string" ? json.content.submissionID : undefined;
    console.log("[JotForm Backup] Submission created:", submissionId || "ok");
    return { attempted: true, ok: true, formId, submissionId };
  } catch (err) {
    console.error("[JotForm Backup] Submission error:", err);
    return {
      attempted: true,
      ok: false,
      formId,
      error: err instanceof Error ? err.message : "Unknown Jotform backup error",
    };
  }
}
