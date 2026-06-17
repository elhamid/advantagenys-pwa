import type { NativeFormSchema } from "./types";

// Generated from JotForm question metadata captured in .orchestra evidence on 2026-06-17.
// Customer-facing submission is native; jotformId is used only for backup mirror writes.
export const nativeFormSchemas = [
  {
    "slug": "itin-registration-form",
    "title": "ITIN Registration Form",
    "description": "Apply for your Individual Tax ID Number (W-7)",
    "taskboardType": "itin-registration",
    "serviceType": "ITIN",
    "jotformId": "210224697492156",
    "fields": [
      {
        "qid": "13",
        "name": "firstlastName",
        "label": "First/Last Name",
        "kind": "fullName",
        "required": true,
        "jotformType": "control_fullname"
      },
      {
        "qid": "31",
        "name": "usAddress",
        "label": "US Address",
        "kind": "address",
        "required": true,
        "jotformType": "control_address"
      },
      {
        "qid": "32",
        "name": "phoneNumber",
        "label": "Phone Number",
        "kind": "tel",
        "required": true,
        "jotformType": "control_phone"
      },
      {
        "qid": "33",
        "name": "email33",
        "label": "Email",
        "kind": "email",
        "required": true,
        "jotformType": "control_email"
      },
      {
        "qid": "28",
        "name": "birthDate",
        "label": "Birth Date",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime",
        "sensitive": true
      },
      {
        "qid": "14",
        "name": "cityOf",
        "label": "City of Birth",
        "kind": "text",
        "required": true,
        "jotformType": "control_textbox"
      },
      {
        "qid": "60",
        "name": "countryOf",
        "label": "Country of Birth",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "35",
        "name": "imCitizen35",
        "label": "I'm Citizen of Country",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "36",
        "name": "usVisa",
        "label": "US Visa Type",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "37",
        "name": "passportNumber",
        "label": "Passport Number",
        "kind": "text",
        "required": true,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "38",
        "name": "passportIssued",
        "label": "Passport Issued By",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "40",
        "name": "passportExpiration",
        "label": "Passport Expiration Date",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime",
        "sensitive": true
      },
      {
        "qid": "64",
        "name": "dateOf",
        "label": "Date of Entry into the United States",
        "kind": "text",
        "required": true,
        "jotformType": "control_textbox"
      },
      {
        "qid": "41",
        "name": "foreignnonus",
        "label": "YOUR COUNTRY (NOT US) Address",
        "kind": "address",
        "required": false,
        "jotformType": "control_address"
      },
      {
        "qid": "65",
        "name": "yourCountry",
        "label": "YOUR COUNTRY (NOT US) Address",
        "kind": "address",
        "required": false,
        "jotformType": "control_address"
      },
      {
        "qid": "42",
        "name": "oldItin42",
        "label": "Old ITIN Number (if any)",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "43",
        "name": "nameChange",
        "label": "Name Change (if any)",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "48",
        "name": "workAddress48",
        "label": "Work Address (US)",
        "kind": "address",
        "required": false,
        "jotformType": "control_address"
      },
      {
        "qid": "51",
        "name": "incomeUpto51",
        "label": "Income upto now (Year - Amount)",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_textarea"
      },
      {
        "qid": "29",
        "name": "uploadCopy",
        "label": "Upload a copy of your ID or prior ITIN letter (optional)",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload",
        "sensitive": true
      },
      {
        "qid": "55",
        "name": "takeYour55",
        "label": "Take a Photo your Document",
        "kind": "file",
        "required": false,
        "jotformType": "control_widget"
      },
      {
        "qid": "17",
        "name": "yourName",
        "label": "Your Name",
        "kind": "text",
        "required": true,
        "jotformType": "control_textbox"
      },
      {
        "qid": "27",
        "name": "yourSignature27",
        "label": "Your Signature",
        "kind": "signature",
        "required": true,
        "jotformType": "control_signature"
      },
      {
        "qid": "66",
        "name": "refferedBy",
        "label": "Referred By",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "8",
        "name": "autoStamp",
        "label": "Auto Stamp Date/Time of Signing (Not Editable)",
        "kind": "date",
        "required": true,
        "jotformType": "control_datetime"
      },
      {
        "qid": "61",
        "name": "typeA",
        "label": "typeA",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_widget"
      }
    ],
    "attributionFields": {
      "sharedBy": "67",
      "utmSource": "68",
      "utmMedium": "69",
      "utmCampaign": "70"
    }
  },
  {
    "slug": "profit-loss-form",
    "title": "Profit & Loss Form",
    "description": "Submit your business P&L information",
    "taskboardType": "profit-loss",
    "serviceType": "Financial Services",
    "jotformId": "220756155957061",
    "fields": [
      {
        "qid": "6",
        "name": "businessName6",
        "label": "Business Name",
        "kind": "text",
        "required": true,
        "jotformType": "control_textbox"
      },
      {
        "qid": "73",
        "name": "businessType73",
        "label": "Business Type",
        "kind": "select",
        "required": false,
        "jotformType": "control_dropdown",
        "options": [
          "C-Corp",
          "S-Corp",
          "LLC"
        ]
      },
      {
        "qid": "81",
        "name": "businessTax",
        "label": "Business Tax ID",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "5",
        "name": "phoneNumber5",
        "label": "Phone Number",
        "kind": "tel",
        "required": true,
        "jotformType": "control_phone"
      },
      {
        "qid": "4",
        "name": "email4",
        "label": "Email",
        "kind": "email",
        "required": true,
        "jotformType": "control_email"
      },
      {
        "qid": "8",
        "name": "businessAddress",
        "label": "Business Address",
        "kind": "address",
        "required": false,
        "jotformType": "control_address"
      },
      {
        "qid": "20",
        "name": "bankRouting20",
        "label": "Bank Routing #",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "19",
        "name": "bankAccount",
        "label": "Bank Account#",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "3",
        "name": "1stOwner",
        "label": "1st Owner Information",
        "kind": "fullName",
        "required": true,
        "jotformType": "control_fullname"
      },
      {
        "qid": "77",
        "name": "2ndOwner",
        "label": "2nd Owner Information",
        "kind": "fullName",
        "required": false,
        "jotformType": "control_fullname"
      },
      {
        "qid": "84",
        "name": "incomeYear",
        "label": "Income Year",
        "kind": "number",
        "required": false,
        "jotformType": "control_number"
      },
      {
        "qid": "13",
        "name": "totalSales",
        "label": "Total Sales or Revenue",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "14",
        "name": "otherIncome",
        "label": "Other Income",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "11",
        "name": "creditCard11",
        "label": "Credit Card 1099 K (1) (if any)",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "71",
        "name": "creditCard71",
        "label": "Credit Card 1099 K (2) (if any)",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "15",
        "name": "beginningInventory",
        "label": "Beginning Inventory $",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "17",
        "name": "endingInventory",
        "label": "Ending Inventory $",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "82",
        "name": "sbaLoan",
        "label": "SBA Loan Received Amount $",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "83",
        "name": "sbaGrant",
        "label": "SBA Grant Received Amount $",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "54",
        "name": "businessExpenses",
        "label": "Business Expenses",
        "kind": "textarea",
        "required": true,
        "jotformType": "control_widget"
      },
      {
        "qid": "80",
        "name": "payrollExpenses",
        "label": "Payroll Expenses",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_widget"
      },
      {
        "qid": "79",
        "name": "autoExpenses79",
        "label": "Auto Expenses (If Charge Per Milage)",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_widget"
      },
      {
        "qid": "66",
        "name": "name66",
        "label": "I Approve",
        "kind": "checkbox",
        "required": true,
        "jotformType": "control_checkbox",
        "options": [
          "I've read and accept Terms and Conditions"
        ]
      },
      {
        "qid": "63",
        "name": "signature",
        "label": "Signature",
        "kind": "signature",
        "required": true,
        "jotformType": "control_signature"
      },
      {
        "qid": "67",
        "name": "typeA67",
        "label": "typeA67",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_widget"
      }
    ],
    "attributionFields": {
      "sharedBy": "85",
      "utmSource": "86",
      "utmMedium": "87",
      "utmCampaign": "88"
    }
  },
  {
    "slug": "tax-return-questionnaire",
    "title": "Tax Return Questionnaire",
    "description": "Complete your annual tax return intake",
    "taskboardType": "tax-return",
    "serviceType": "Tax Services",
    "jotformId": "230235945738159",
    "fields": [
      {
        "qid": "285",
        "name": "typeA285",
        "label": "Please Select your Tax Preparer",
        "kind": "textarea",
        "required": true,
        "jotformType": "control_widget"
      },
      {
        "qid": "288",
        "name": "filingTax",
        "label": "Filing Tax for Year (Type Year)",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "211",
        "name": "selectFiling",
        "label": "Select Filing Status for Previous Year",
        "kind": "select",
        "required": true,
        "jotformType": "control_dropdown",
        "options": [
          "Single",
          "Married filing jointly",
          "Married filing separately (MFS)",
          "Head of household (HOH)",
          "Qualifying surviving spouse (QSS)"
        ]
      },
      {
        "qid": "3",
        "name": "name",
        "label": "Name",
        "kind": "fullName",
        "required": true,
        "jotformType": "control_fullname"
      },
      {
        "qid": "6",
        "name": "socialSecurity",
        "label": "Social Security #",
        "kind": "text",
        "required": true,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "7",
        "name": "occupation",
        "label": "Occupation",
        "kind": "text",
        "required": true,
        "jotformType": "control_textbox"
      },
      {
        "qid": "8",
        "name": "dateOf",
        "label": "Date of Birth",
        "kind": "date",
        "required": true,
        "jotformType": "control_datetime",
        "sensitive": true
      },
      {
        "qid": "9",
        "name": "email",
        "label": "Email",
        "kind": "email",
        "required": true,
        "jotformType": "control_email"
      },
      {
        "qid": "10",
        "name": "cellPhone",
        "label": "Cell Phone",
        "kind": "tel",
        "required": true,
        "jotformType": "control_phone"
      },
      {
        "qid": "19",
        "name": "address",
        "label": "Address",
        "kind": "address",
        "required": true,
        "jotformType": "control_address"
      },
      {
        "qid": "11",
        "name": "spouseName",
        "label": "Spouse Name",
        "kind": "fullName",
        "required": false,
        "jotformType": "control_fullname"
      },
      {
        "qid": "286",
        "name": "socialSecurity286",
        "label": "Social Security #",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "13",
        "name": "spouseOccupation",
        "label": "Spouse Occupation",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "14",
        "name": "spouseDate",
        "label": "Spouse Date of Birth",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime",
        "sensitive": true
      },
      {
        "qid": "15",
        "name": "spouseEmail",
        "label": "Spouse Email",
        "kind": "email",
        "required": false,
        "jotformType": "control_email"
      },
      {
        "qid": "16",
        "name": "spouseCell",
        "label": "Spouse Cell Phone",
        "kind": "tel",
        "required": false,
        "jotformType": "control_phone"
      },
      {
        "qid": "29",
        "name": "typeA",
        "label": "Dependent *(Children under 19 or full-time students under 24 years of age.  Members of your household who make under $2500 a year and you provide for more than ½ the support.",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_widget"
      },
      {
        "qid": "165",
        "name": "birthCertificate",
        "label": "Birth Certificate for each child (Take photo with Phone Camera and Upload )",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "216",
        "name": "socialSecurity216",
        "label": "Social Security for each child (Take photo with Phone Camera and Upload )",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload",
        "sensitive": true
      },
      {
        "qid": "217",
        "name": "doctorsOr",
        "label": "Doctor's or School Certificate (Upload Doc)",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "74",
        "name": "insuranceDid",
        "label": "Insurance: Did the Taxpayer, Spouse or Dependent receive Insurance through Market Place?",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "274",
        "name": "ifYes274",
        "label": "If Yes, please upload form 1095 for all",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "40",
        "name": "nameOf",
        "label": "Name of Child Care Provider",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "41",
        "name": "amountPaid",
        "label": "Amount Paid",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "43",
        "name": "typeA43",
        "label": "Address of Child Care Provider",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "287",
        "name": "socialSecurity287",
        "label": "Social Security OR EIN of the provide",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "44",
        "name": "socialSecurity288",
        "label": "Social Security OR EIN of the provide",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "45",
        "name": "typeA45",
        "label": "Name of the Child Being Cared",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_widget"
      },
      {
        "qid": "166",
        "name": "daycareInvoice",
        "label": "Daycare invoice or Letter (Upload at least 1 doc for each child)",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "61",
        "name": "wereYou",
        "label": "Were you or your spouse the qualifying person of someone else for EIC purposes?",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "62",
        "name": "wasYour",
        "label": "Was your home in the US for more than ½ of the filing year?",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "63",
        "name": "areAny",
        "label": "Are any of the children listed above married?",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "64",
        "name": "ifYes",
        "label": "If yes can anyone else claim this child as a dependent?",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "66",
        "name": "isThe",
        "label": "Is the other person claiming the EIC on the child?",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "67",
        "name": "ifThe",
        "label": "If the tiebreaker rules applied would the child be treated as the taxpayers qualifying child?",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "68",
        "name": "ifYou",
        "label": "if you took the EIC on your return, was it reduced or disallowed for any reason?",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "75",
        "name": "ifYes75",
        "label": "Additional Note",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_textarea"
      },
      {
        "qid": "213",
        "name": "upload1098t",
        "label": "Upload 1098T Form (Tuition Expenditure)",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "215",
        "name": "booksAnd",
        "label": "Books and Supplies Expenses",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "82",
        "name": "anyTime",
        "label": "Any Time in the filing year, Did the Taxpayer/Spouse Receive, Sell, Exchange or otherwise acquire any financial interest in any virtual currency (For Ex. Bitcoin)?",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "167",
        "name": "ifYes168",
        "label": "If Yes, please provide details, (Virtual Currency are Taxable, Provide list of trades)",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "90",
        "name": "foreignBank",
        "label": "Foreign Bank Accounts: (Must be reported to the United States Treasury, the Internal Revenue Service and New York State.)",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "168",
        "name": "ifYes168",
        "label": "If Yes, please provide details, (Virtual Currency are Taxable, Provide list of trades)",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "227",
        "name": "typeA227",
        "label": "typeA227",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_widget"
      },
      {
        "qid": "228",
        "name": "uploadMortgage",
        "label": "Upload",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "246",
        "name": "typeA246",
        "label": "Take Photo",
        "kind": "file",
        "required": false,
        "jotformType": "control_widget"
      },
      {
        "qid": "185",
        "name": "didYou185",
        "label": "Did you itemize deductions in previous year?",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "186",
        "name": "didYou186",
        "label": "Do you receive NYS Dept. of Finance Refund Notice (1099G)",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "172",
        "name": "mortgagePremium",
        "label": "Mortgage Premium Insurance",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "173",
        "name": "mortgageInterest",
        "label": "Mortgage Interest",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "174",
        "name": "realEstate",
        "label": "Real Estate Taxes",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "176",
        "name": "medicalInsurance",
        "label": "Medical Insurance",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "177",
        "name": "doctorsCo",
        "label": "Doctors Co Pays",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "178",
        "name": "prescriptions",
        "label": "Prescriptions",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "179",
        "name": "eyeglassescontacts",
        "label": "Eyeglasses/Contacts",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "180",
        "name": "medicalSupplies",
        "label": "Medical Supplies",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "181",
        "name": "medicalTravel",
        "label": "Medical Travel",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "182",
        "name": "otherMedical",
        "label": "Other Medical expenses",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "209",
        "name": "typeA209",
        "label": "Cash Charity Information",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_widget"
      },
      {
        "qid": "210",
        "name": "noncashCharity",
        "label": "Non-Cash Charity Information",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_widget"
      },
      {
        "qid": "98",
        "name": "validState",
        "label": "Valid State Photo Identification Card",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "137",
        "name": "w2salary137",
        "label": "W-2 (Salary Wages)",
        "kind": "file",
        "required": true,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "111",
        "name": "w2gincome",
        "label": "W-2G (income from gambling)",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "112",
        "name": "1099rIra",
        "label": "1099R IRA, 401K, etc.",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "113",
        "name": "1099intinterest",
        "label": "1099INT (Interest Income)",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "114",
        "name": "1099cCancellation",
        "label": "1099-C Cancellation of Debt",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "115",
        "name": "1099Misc",
        "label": "1099 Misc",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "118",
        "name": "1099g",
        "label": "1099G ( Unemployment )",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "119",
        "name": "anyOther",
        "label": "Any other 1099?",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "120",
        "name": "anyOther120",
        "label": "Any other 1099?",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "121",
        "name": "1099E",
        "label": "1099 E (Interest paid on Student Loan)",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "122",
        "name": "irsNotice",
        "label": "IRS notice or letters? (If Any)",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "127",
        "name": "socialSecurity127",
        "label": "Social security or railroad retirement? 1099",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload",
        "sensitive": true
      },
      {
        "qid": "130",
        "name": "anyMiscellaneous",
        "label": "Any miscellaneous income? (Prizes, awards, jury duty)",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "131",
        "name": "schedulesK1",
        "label": "Schedules K-1? - Partnership or S Corporation?",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "163",
        "name": "note",
        "label": "Note:",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_textarea"
      },
      {
        "qid": "249",
        "name": "businessName",
        "label": "Business Name",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "251",
        "name": "typeA251",
        "label": "Business Tax ID (EIN)",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "254",
        "name": "businessAddress",
        "label": "Business Address",
        "kind": "address",
        "required": false,
        "jotformType": "control_address"
      },
      {
        "qid": "259",
        "name": "totalSales",
        "label": "Total Sales or Revenue",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "261",
        "name": "creditCard",
        "label": "Credit Card 1099 K (1) (if any)",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "263",
        "name": "purchase",
        "label": "Purchase ( cost of good sold ) $",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "264",
        "name": "endingInventory",
        "label": "Ending Inventory $",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "265",
        "name": "sbaLoan",
        "label": "SBA Loan Received Amount $",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "266",
        "name": "sbaGrant",
        "label": "SBA Grant Received Amount $",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "275",
        "name": "selectType",
        "label": "Select Type of Your Business to Add Expenses...",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Constuction Business",
          "Taxi/Truck/Cab Business",
          "Other Business"
        ]
      },
      {
        "qid": "268",
        "name": "typeA268",
        "label": "Constuction Business Expenses (click \"Add another expense\" to add more...)",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_widget"
      },
      {
        "qid": "276",
        "name": "taxitruckcabBusiness",
        "label": "Taxi/Truck/Cab Business Expenses (click \"Add another expense\" to add more...)",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_widget"
      },
      {
        "qid": "277",
        "name": "constuctionBusiness277",
        "label": "Other Business Expenses (click \"Add another expense\" to add more...)",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_widget"
      },
      {
        "qid": "279",
        "name": "businessMiles",
        "label": "Business Miles",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "281",
        "name": "personalMiles",
        "label": "Personal Miles",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "282",
        "name": "totalMiles",
        "label": "Total Miles",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "272",
        "name": "iApprove",
        "label": "I Approve",
        "kind": "checkbox",
        "required": true,
        "jotformType": "control_checkbox",
        "options": [
          "I've read and accept Terms and Conditions"
        ]
      },
      {
        "qid": "78",
        "name": "typeA78",
        "label": "Take Photo",
        "kind": "file",
        "required": false,
        "jotformType": "control_widget"
      },
      {
        "qid": "77",
        "name": "fileUpload",
        "label": "Upload any tax documents you have (optional)",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "48",
        "name": "refundDirect",
        "label": "Refund Direct Deposit: Bank Routing#",
        "kind": "text",
        "required": true,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "49",
        "name": "bankAccount",
        "label": "Bank Account#",
        "kind": "text",
        "required": true,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "51",
        "name": "filerPrint",
        "label": "Filer Print Name",
        "kind": "text",
        "required": true,
        "jotformType": "control_textbox"
      },
      {
        "qid": "53",
        "name": "filerSignature",
        "label": "Filer Signature",
        "kind": "signature",
        "required": true,
        "jotformType": "control_signature"
      },
      {
        "qid": "57",
        "name": "date",
        "label": "Date",
        "kind": "date",
        "required": true,
        "jotformType": "control_datetime"
      },
      {
        "qid": "52",
        "name": "jointFiler",
        "label": "Joint Filer Print Name",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "54",
        "name": "signature54",
        "label": "Joint Filer Signature",
        "kind": "signature",
        "required": false,
        "jotformType": "control_signature"
      },
      {
        "qid": "58",
        "name": "date58",
        "label": "Date",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime"
      },
      {
        "qid": "159",
        "name": "typeA159",
        "label": "typeA159",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_widget"
      },
      {
        "qid": "146",
        "name": "typeA146",
        "label": "typeA146",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_widget"
      }
    ],
    "attributionFields": {}
  },
  {
    "slug": "immigration-form-for-petitioner",
    "title": "Immigration Form for Petitioner",
    "description": "I-130/I-864 petition filing",
    "taskboardType": "immigration-petitioner",
    "serviceType": "Legal/Immigration",
    "jotformId": "220887424251052",
    "fields": [
      {
        "qid": "4",
        "name": "name",
        "label": "Name",
        "kind": "fullName",
        "required": false,
        "jotformType": "control_fullname"
      },
      {
        "qid": "5",
        "name": "otherName",
        "label": "Other Name Used",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "6",
        "name": "birthdate",
        "label": "Birthdate",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime",
        "sensitive": true
      },
      {
        "qid": "7",
        "name": "countryOf",
        "label": "Country of Birth",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "8",
        "name": "cityOf",
        "label": "City of Birth",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "9",
        "name": "gender",
        "label": "Gender",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Male",
          "Female"
        ]
      },
      {
        "qid": "10",
        "name": "ethnicity",
        "label": "Ethnicity",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Hispanicof Latino",
          "NotHispanic or Latino"
        ]
      },
      {
        "qid": "11",
        "name": "ethnicity11",
        "label": "Ethnicity",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Black of African American",
          "White",
          "Asian",
          "American Indian Native"
        ]
      },
      {
        "qid": "13",
        "name": "input13",
        "label": "input13",
        "kind": "text",
        "required": false,
        "jotformType": "control_inline"
      },
      {
        "qid": "14",
        "name": "hairColor",
        "label": "Hair Color",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Black",
          "Brown",
          "Blonde",
          "Grey",
          "White",
          "Bold"
        ]
      },
      {
        "qid": "124",
        "name": "eyeColor",
        "label": "Eye Color",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Black",
          "Brown",
          "Hazel",
          "Maroon",
          "Unknow"
        ]
      },
      {
        "qid": "15",
        "name": "socialSecurity",
        "label": "Social Security",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "16",
        "name": "phoneNumber",
        "label": "Phone Number",
        "kind": "tel",
        "required": true,
        "jotformType": "control_phone"
      },
      {
        "qid": "17",
        "name": "email",
        "label": "Email",
        "kind": "email",
        "required": true,
        "jotformType": "control_email"
      },
      {
        "qid": "18",
        "name": "homeAddress",
        "label": "Home Address",
        "kind": "address",
        "required": false,
        "jotformType": "control_address"
      },
      {
        "qid": "19",
        "name": "mailingAddress",
        "label": "Mailing Address (Fill only if it is different than Home Address)",
        "kind": "address",
        "required": false,
        "jotformType": "control_address"
      },
      {
        "qid": "23",
        "name": "myCitizenship",
        "label": "My Citizenship was acquired through",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Birth in the U.S.",
          "Naturalization"
        ]
      },
      {
        "qid": "24",
        "name": "ifNaturalization",
        "label": "(If Naturalization) Certificate#",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "25",
        "name": "dateOf",
        "label": "Date of Issue",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime"
      },
      {
        "qid": "26",
        "name": "placeOf26",
        "label": "Place of Issue (City & State)",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_textarea"
      },
      {
        "qid": "36",
        "name": "currentMarital",
        "label": "Current Marital Status (Married, Single, Widower)",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_textarea"
      },
      {
        "qid": "37",
        "name": "dateOf37",
        "label": "Date of Marriage:",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime"
      },
      {
        "qid": "38",
        "name": "placeOf38",
        "label": "Place of Marriage (City & State)",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "40",
        "name": "fullName",
        "label": "Full Name of Previous Spouse",
        "kind": "fullName",
        "required": false,
        "jotformType": "control_fullname"
      },
      {
        "qid": "41",
        "name": "placeOf41",
        "label": "Place of Marriage:",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "42",
        "name": "dateOf42",
        "label": "Date of Marriage Termination:",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime"
      },
      {
        "qid": "43",
        "name": "placeOf43",
        "label": "Place of Marriage Termination",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_textarea"
      },
      {
        "qid": "47",
        "name": "fullName47",
        "label": "Full Name of Father",
        "kind": "fullName",
        "required": false,
        "jotformType": "control_fullname"
      },
      {
        "qid": "51",
        "name": "fathersDate",
        "label": "Father’s Date of Birth",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime",
        "sensitive": true
      },
      {
        "qid": "121",
        "name": "fathersCity121",
        "label": "Father’s City of Birth",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "49",
        "name": "fathersCountry",
        "label": "Fathers’ Country of Birth",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "50",
        "name": "fathersCountry50",
        "label": "Father’s Country of Residency (If living)",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "53",
        "name": "fullName53",
        "label": "Full Name of Mother",
        "kind": "fullName",
        "required": false,
        "jotformType": "control_fullname"
      },
      {
        "qid": "54",
        "name": "mothersDate",
        "label": "Mother's Date of Birth",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime",
        "sensitive": true
      },
      {
        "qid": "56",
        "name": "mothersCity56",
        "label": "Mother's City of Birth",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "55",
        "name": "mothersCountry",
        "label": "Mother's Country of Birth",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "122",
        "name": "mothersCountry122",
        "label": "Mother's Country of Residency (If living)",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "63",
        "name": "pleaseIndicate63",
        "label": "Please indicate if adopted or biological",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Born Biological",
          "Adopted"
        ]
      },
      {
        "qid": "64",
        "name": "child1Gender",
        "label": "Child-1 Gender",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Male",
          "Female"
        ]
      },
      {
        "qid": "58",
        "name": "child1Name58",
        "label": "Child-1 Name",
        "kind": "fullName",
        "required": false,
        "jotformType": "control_fullname"
      },
      {
        "qid": "59",
        "name": "child1Date",
        "label": "Child-1 Date of Birth",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime",
        "sensitive": true
      },
      {
        "qid": "60",
        "name": "child1If",
        "label": "Child-1 If Other Name used",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "62",
        "name": "child1Country62",
        "label": "Child-1 Country of Birth",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "61",
        "name": "child1City",
        "label": "Child-1 City of Birth",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "67",
        "name": "child1Social",
        "label": "Child-1 Social Security Number",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "65",
        "name": "isChild1",
        "label": "Is Child-1 U.S. Citizen",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "80",
        "name": "pleaseIndicate80",
        "label": "Please indicate if adopted or biological",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Born Biological",
          "Adopted"
        ]
      },
      {
        "qid": "81",
        "name": "child2Gender81",
        "label": "Child-2 Gender",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Male",
          "Female"
        ]
      },
      {
        "qid": "82",
        "name": "child2Name",
        "label": "Child-2 Name",
        "kind": "fullName",
        "required": false,
        "jotformType": "control_fullname"
      },
      {
        "qid": "83",
        "name": "child2Date83",
        "label": "Child-2 Date of Birth",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime",
        "sensitive": true
      },
      {
        "qid": "84",
        "name": "child2If84",
        "label": "Child-2 If Other Name used",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "85",
        "name": "child2Country85",
        "label": "Child-2 Country of Birth",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "86",
        "name": "child2City86",
        "label": "Child-2 City of Birth",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "87",
        "name": "child2Social87",
        "label": "Child-2 Social Security Number",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "88",
        "name": "isChild288",
        "label": "Is Child-2 U.S. Citizen",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "70",
        "name": "pleaseIndicate",
        "label": "Please indicate if adopted or biological",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Born Biological",
          "Adopted"
        ]
      },
      {
        "qid": "71",
        "name": "child3Gender",
        "label": "Child-3 Gender",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Male",
          "Female"
        ]
      },
      {
        "qid": "72",
        "name": "child3Name",
        "label": "Child-3 Name",
        "kind": "fullName",
        "required": false,
        "jotformType": "control_fullname"
      },
      {
        "qid": "73",
        "name": "child3Date",
        "label": "Child-3 Date of Birth",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime",
        "sensitive": true
      },
      {
        "qid": "74",
        "name": "child3If",
        "label": "Child-3 If Other Name used",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "75",
        "name": "child3Country",
        "label": "Child-3 Country of Birth",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "76",
        "name": "child3City",
        "label": "Child-3 City of Birth",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "77",
        "name": "child3Social",
        "label": "Child-3 Social Security Number",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "78",
        "name": "isChild3",
        "label": "Is Child-3 U.S. Citizen",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "114",
        "name": "input114",
        "label": "input114",
        "kind": "text",
        "required": false,
        "jotformType": "control_inline"
      },
      {
        "qid": "118",
        "name": "input118",
        "label": "input118",
        "kind": "text",
        "required": false,
        "jotformType": "control_inline"
      },
      {
        "qid": "119",
        "name": "input119",
        "label": "input119",
        "kind": "text",
        "required": false,
        "jotformType": "control_inline"
      },
      {
        "qid": "117",
        "name": "input117",
        "label": "input117",
        "kind": "text",
        "required": false,
        "jotformType": "control_inline"
      },
      {
        "qid": "115",
        "name": "input115",
        "label": "input115",
        "kind": "text",
        "required": false,
        "jotformType": "control_inline"
      },
      {
        "qid": "116",
        "name": "input116",
        "label": "input116",
        "kind": "text",
        "required": false,
        "jotformType": "control_inline"
      },
      {
        "qid": "127",
        "name": "marriageCertificateUpload",
        "label": "Marriage certificate",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "128",
        "name": "divorceDecreesUpload",
        "label": "Divorce decrees (if any)",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "135",
        "name": "passportPhotosUpload",
        "label": "Passport photos",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload",
        "sensitive": true
      },
      {
        "qid": "129",
        "name": "birthCertificateUpload",
        "label": "Birth certificate",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "130",
        "name": "naturalizationCertificateUpload",
        "label": "Certificate of naturalization",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "131",
        "name": "usPassportUpload",
        "label": "US passport",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload",
        "sensitive": true
      },
      {
        "qid": "132",
        "name": "taxReturnsUpload",
        "label": "Last 3 years tax returns",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "136",
        "name": "jobLetterUpload",
        "label": "Job letter",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "133",
        "name": "w2Or1099Upload",
        "label": "Last 3 years W-2s or 1099s",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "134",
        "name": "documentComments",
        "label": "Document comments (optional)",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_textarea"
      }
    ],
    "attributionFields": {}
  },
  {
    "slug": "immigration-form-for-beneficiary",
    "title": "Immigration Form for Beneficiary",
    "description": "Beneficiary information for green card",
    "taskboardType": "immigration-beneficiary",
    "serviceType": "Legal/Immigration",
    "jotformId": "220896671023154",
    "fields": [
      {
        "qid": "4",
        "name": "name",
        "label": "Name",
        "kind": "fullName",
        "required": false,
        "jotformType": "control_fullname"
      },
      {
        "qid": "5",
        "name": "otherName",
        "label": "Other Name Used",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "6",
        "name": "birthdate",
        "label": "Birthdate",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime",
        "sensitive": true
      },
      {
        "qid": "7",
        "name": "countryOf",
        "label": "Country of Birth",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "8",
        "name": "cityOf",
        "label": "City of Birth",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "9",
        "name": "gender",
        "label": "Gender",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Male",
          "Female"
        ]
      },
      {
        "qid": "10",
        "name": "ethnicity",
        "label": "Ethnicity",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Hispanicof Latino",
          "NotHispanic or Latino"
        ]
      },
      {
        "qid": "11",
        "name": "ethnicity11",
        "label": "Ethnicity",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Black of African American",
          "White",
          "Asian",
          "American Indian Native"
        ]
      },
      {
        "qid": "13",
        "name": "input13",
        "label": "input13",
        "kind": "text",
        "required": false,
        "jotformType": "control_inline"
      },
      {
        "qid": "14",
        "name": "hairColor",
        "label": "Hair Color",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Black",
          "Brown",
          "Blonde",
          "Grey",
          "White",
          "Bold"
        ]
      },
      {
        "qid": "130",
        "name": "eyeColor",
        "label": "Eye Color",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Black",
          "Brown",
          "Hazel",
          "Maroon",
          "Unknown"
        ]
      },
      {
        "qid": "15",
        "name": "socialSecurity",
        "label": "Social Security",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "16",
        "name": "phoneNumber",
        "label": "Phone Number",
        "kind": "tel",
        "required": true,
        "jotformType": "control_phone"
      },
      {
        "qid": "17",
        "name": "email",
        "label": "Email",
        "kind": "email",
        "required": true,
        "jotformType": "control_email"
      },
      {
        "qid": "18",
        "name": "homeAddress",
        "label": "Home Address",
        "kind": "address",
        "required": false,
        "jotformType": "control_address"
      },
      {
        "qid": "19",
        "name": "mailingAddress",
        "label": "Mailing Address (Fill only if it is different than Home Address)",
        "kind": "address",
        "required": false,
        "jotformType": "control_address"
      },
      {
        "qid": "36",
        "name": "placeOf",
        "label": "Place of last arrival in the U.S. (City & State)",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_textarea"
      },
      {
        "qid": "125",
        "name": "i94",
        "label": "Passport or Travel document number used at last arrival",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "126",
        "name": "nonimmigrationVisa",
        "label": "Country that issued this Passport or Travel document",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "134",
        "name": "nonimmigrationVisa134",
        "label": "Nonimmigration Visa #:",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "128",
        "name": "dateVisa",
        "label": "Date Visa Issued:",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime",
        "sensitive": true
      },
      {
        "qid": "124",
        "name": "countryOf124",
        "label": "Country of Visa Issuance (City & State)",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_textarea",
        "sensitive": true
      },
      {
        "qid": "129",
        "name": "currentMarital",
        "label": "Current Marital Status (Married, Single, Widower)",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_textarea"
      },
      {
        "qid": "37",
        "name": "dateOf37",
        "label": "Date of Marriage:",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime"
      },
      {
        "qid": "38",
        "name": "placeOf38",
        "label": "Place of Marriage (City & State)",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "40",
        "name": "fullName",
        "label": "Full Name of Previous Spouse",
        "kind": "fullName",
        "required": false,
        "jotformType": "control_fullname"
      },
      {
        "qid": "41",
        "name": "placeOf41",
        "label": "Place of Marriage:",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "42",
        "name": "dateOf42",
        "label": "Date of Marriage Termination:",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime"
      },
      {
        "qid": "43",
        "name": "placeOf43",
        "label": "Place of Marriage Termination",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_textarea"
      },
      {
        "qid": "47",
        "name": "fullName47",
        "label": "Full Name of Father",
        "kind": "fullName",
        "required": false,
        "jotformType": "control_fullname"
      },
      {
        "qid": "51",
        "name": "fathersDate",
        "label": "Father’s Date of Birth",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime",
        "sensitive": true
      },
      {
        "qid": "121",
        "name": "fathersCity121",
        "label": "Father’s City of Birth",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "49",
        "name": "fathersCountry",
        "label": "Fathers’ Country of Birth",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "50",
        "name": "fathersCountry50",
        "label": "Father’s Country of Residency (If living)",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "53",
        "name": "fullName53",
        "label": "Full Name of Mother",
        "kind": "fullName",
        "required": false,
        "jotformType": "control_fullname"
      },
      {
        "qid": "54",
        "name": "mothersDate",
        "label": "Mother's Date of Birth",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime",
        "sensitive": true
      },
      {
        "qid": "56",
        "name": "mothersCity56",
        "label": "Mother's City of Birth",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "55",
        "name": "mothersCountry",
        "label": "Mother's Country of Birth",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "122",
        "name": "mothersCountry122",
        "label": "Mother's Country of Residency (If living)",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "63",
        "name": "pleaseIndicate63",
        "label": "Please indicate if adopted or biological",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Born Biological",
          "Adopted"
        ]
      },
      {
        "qid": "64",
        "name": "child1Gender",
        "label": "Child-1 Gender",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Male",
          "Female"
        ]
      },
      {
        "qid": "58",
        "name": "child1Name58",
        "label": "Child-1 Name",
        "kind": "fullName",
        "required": false,
        "jotformType": "control_fullname"
      },
      {
        "qid": "59",
        "name": "child1Date",
        "label": "Child-1 Date of Birth",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime",
        "sensitive": true
      },
      {
        "qid": "60",
        "name": "child1If",
        "label": "Child-1 If Other Name used",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "62",
        "name": "child1Country62",
        "label": "Child-1 Country of Birth",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "61",
        "name": "child1City",
        "label": "Child-1 City of Birth",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "67",
        "name": "child1Social",
        "label": "Child-1 Social Security Number",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "65",
        "name": "isChild1",
        "label": "Is Child-1 U.S. Citizen",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "80",
        "name": "pleaseIndicate80",
        "label": "Please indicate if adopted or biological",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Born Biological",
          "Adopted"
        ]
      },
      {
        "qid": "81",
        "name": "child2Gender81",
        "label": "Child-2 Gender",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Male",
          "Female"
        ]
      },
      {
        "qid": "82",
        "name": "child2Name",
        "label": "Child-2 Name",
        "kind": "fullName",
        "required": false,
        "jotformType": "control_fullname"
      },
      {
        "qid": "83",
        "name": "child2Date83",
        "label": "Child-2 Date of Birth",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime",
        "sensitive": true
      },
      {
        "qid": "84",
        "name": "child2If84",
        "label": "Child-2 If Other Name used",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "85",
        "name": "child2Country85",
        "label": "Child-2 Country of Birth",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "86",
        "name": "child2City86",
        "label": "Child-2 City of Birth",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "87",
        "name": "child2Social87",
        "label": "Child-2 Social Security Number",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "88",
        "name": "isChild288",
        "label": "Is Child-2 U.S. Citizen",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "70",
        "name": "pleaseIndicate",
        "label": "Please indicate if adopted or biological",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Born Biological",
          "Adopted"
        ]
      },
      {
        "qid": "71",
        "name": "child3Gender",
        "label": "Child-3 Gender",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Male",
          "Female"
        ]
      },
      {
        "qid": "72",
        "name": "child3Name",
        "label": "Child-3 Name",
        "kind": "fullName",
        "required": false,
        "jotformType": "control_fullname"
      },
      {
        "qid": "73",
        "name": "child3Date",
        "label": "Child-3 Date of Birth",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime",
        "sensitive": true
      },
      {
        "qid": "74",
        "name": "child3If",
        "label": "Child-3 If Other Name used",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "75",
        "name": "child3Country",
        "label": "Child-3 Country of Birth",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "76",
        "name": "child3City",
        "label": "Child-3 City of Birth",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "77",
        "name": "child3Social",
        "label": "Child-3 Social Security Number",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "78",
        "name": "isChild3",
        "label": "Is Child-3 U.S. Citizen",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "114",
        "name": "input114",
        "label": "input114",
        "kind": "text",
        "required": false,
        "jotformType": "control_inline"
      },
      {
        "qid": "118",
        "name": "input118",
        "label": "input118",
        "kind": "text",
        "required": false,
        "jotformType": "control_inline"
      },
      {
        "qid": "119",
        "name": "input119",
        "label": "input119",
        "kind": "text",
        "required": false,
        "jotformType": "control_inline"
      },
      {
        "qid": "117",
        "name": "input117",
        "label": "input117",
        "kind": "text",
        "required": false,
        "jotformType": "control_inline"
      },
      {
        "qid": "115",
        "name": "input115",
        "label": "input115",
        "kind": "text",
        "required": false,
        "jotformType": "control_inline"
      },
      {
        "qid": "116",
        "name": "input116",
        "label": "input116",
        "kind": "text",
        "required": false,
        "jotformType": "control_inline"
      },
      {
        "qid": "131",
        "name": "lastPhysical",
        "label": "Last Physical Address of Beneficiaries Outside the United States",
        "kind": "address",
        "required": false,
        "jotformType": "control_address"
      },
      {
        "qid": "143",
        "name": "marriageCertificateUpload",
        "label": "Marriage certificate",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "135",
        "name": "divorceDecreesUpload",
        "label": "Divorce decrees (if any)",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "136",
        "name": "birthCertificateUpload",
        "label": "Birth certificate",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "137",
        "name": "visaUpload",
        "label": "Visa",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload",
        "sensitive": true
      },
      {
        "qid": "138",
        "name": "countryPassportUpload",
        "label": "Country passport",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload",
        "sensitive": true
      },
      {
        "qid": "139",
        "name": "entryStampI94Upload",
        "label": "Entry stamp or I-94 form",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "140",
        "name": "passportPhotosUpload",
        "label": "Passport photos",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload",
        "sensitive": true
      },
      {
        "qid": "141",
        "name": "medicalFormUpload",
        "label": "Medical form by immigration doctor",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "142",
        "name": "documentComments",
        "label": "Document comments (optional)",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_textarea"
      }
    ],
    "attributionFields": {}
  },
  {
    "slug": "contractor-license-qualifier",
    "title": "Contractor License Qualifier",
    "description": "Check your eligibility for a New York contractor license",
    "taskboardType": "contractor-qualifier",
    "serviceType": "Licensing",
    "jotformId": "253426701953054",
    "fields": [
      {
        "qid": "3",
        "name": "name",
        "label": "Name",
        "kind": "fullName",
        "required": true,
        "jotformType": "control_fullname"
      },
      {
        "qid": "4",
        "name": "email",
        "label": "Email",
        "kind": "email",
        "required": true,
        "jotformType": "control_email"
      },
      {
        "qid": "5",
        "name": "phoneNumber",
        "label": "Phone Number",
        "kind": "tel",
        "required": true,
        "jotformType": "control_phone"
      },
      {
        "qid": "9",
        "name": "doYou9",
        "label": "Do you already have a New York State registered business?",
        "kind": "radio",
        "required": true,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "23",
        "name": "doYou23",
        "label": "Do you already have a New York State Sales Tax Certificate?",
        "kind": "radio",
        "required": true,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "29",
        "name": "doYou29",
        "label": "Do you have employees?",
        "kind": "radio",
        "required": true,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "30",
        "name": "doYou30",
        "label": "Do you have Workers Comp/Disability Business Insurance for employees?",
        "kind": "radio",
        "required": true,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "26",
        "name": "doYou26",
        "label": "Do you work with lead paint or do renovations involving lead?",
        "kind": "radio",
        "required": true,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "27",
        "name": "doYou27",
        "label": "Do you have a RRP Certificate?",
        "kind": "radio",
        "required": true,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "32",
        "name": "asA",
        "label": "As a business owner do you have a valid ID and Social Security Number?",
        "kind": "radio",
        "required": true,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ],
        "sensitive": true
      },
      {
        "qid": "34",
        "name": "req1",
        "label": "Req1",
        "kind": "text",
        "required": true,
        "jotformType": "control_textbox"
      },
      {
        "qid": "35",
        "name": "req2",
        "label": "Req2",
        "kind": "text",
        "required": true,
        "jotformType": "control_textbox"
      },
      {
        "qid": "36",
        "name": "req3",
        "label": "Req3",
        "kind": "text",
        "required": true,
        "jotformType": "control_textbox"
      },
      {
        "qid": "37",
        "name": "req4",
        "label": "Req4",
        "kind": "text",
        "required": true,
        "jotformType": "control_textbox"
      },
      {
        "qid": "40",
        "name": "req5",
        "label": "Req5",
        "kind": "text",
        "required": true,
        "jotformType": "control_textbox"
      }
    ],
    "attributionFields": {
      "sharedBy": "61",
      "utmSource": "62",
      "utmMedium": "63",
      "utmCampaign": "64"
    }
  },
  {
    "slug": "boir-form",
    "title": "BOIR Form",
    "description": "Beneficial Ownership Information Report",
    "taskboardType": "boir",
    "serviceType": "Business Formation",
    "jotformId": "241705190161044",
    "fields": [
      {
        "qid": "3",
        "name": "companyLegal",
        "label": "Company Legal Name",
        "kind": "text",
        "required": true,
        "jotformType": "control_textbox"
      },
      {
        "qid": "7",
        "name": "dateIncorporated",
        "label": "Date Incorporated",
        "kind": "date",
        "required": true,
        "jotformType": "control_datetime"
      },
      {
        "qid": "4",
        "name": "taxId",
        "label": "Tax ID Type",
        "kind": "radio",
        "required": true,
        "jotformType": "control_radio",
        "options": [
          "EIN",
          "SSN"
        ],
        "sensitive": true
      },
      {
        "qid": "5",
        "name": "taxId5",
        "label": "Tax ID Number",
        "kind": "number",
        "required": true,
        "jotformType": "control_number",
        "sensitive": true
      },
      {
        "qid": "6",
        "name": "currentUs",
        "label": "Current US Address of the Company",
        "kind": "address",
        "required": true,
        "jotformType": "control_address"
      },
      {
        "qid": "11",
        "name": "individualsFirst",
        "label": "Individual’s First Name and Last Name",
        "kind": "fullName",
        "required": true,
        "jotformType": "control_fullname"
      },
      {
        "qid": "12",
        "name": "dateOf",
        "label": "Date of Birth",
        "kind": "date",
        "required": true,
        "jotformType": "control_datetime",
        "sensitive": true
      },
      {
        "qid": "17",
        "name": "phoneNumber",
        "label": "Phone Number",
        "kind": "tel",
        "required": true,
        "jotformType": "control_phone"
      },
      {
        "qid": "18",
        "name": "email",
        "label": "Email",
        "kind": "email",
        "required": true,
        "jotformType": "control_email"
      },
      {
        "qid": "13",
        "name": "individualsCurrent",
        "label": "Individual's Current US Address",
        "kind": "address",
        "required": true,
        "jotformType": "control_address"
      },
      {
        "qid": "14",
        "name": "identifyingDocument",
        "label": "Identifying Document Type",
        "kind": "radio",
        "required": true,
        "jotformType": "control_radio",
        "options": [
          "State Driver’s License",
          "US Passport",
          "Foreign Passport"
        ]
      },
      {
        "qid": "15",
        "name": "identifyingDocument15",
        "label": "Identifying Document Number",
        "kind": "number",
        "required": true,
        "jotformType": "control_number",
        "sensitive": true
      },
      {
        "qid": "16",
        "name": "uploadIdentifying",
        "label": "Upload Identifying Document",
        "kind": "file",
        "required": true,
        "jotformType": "control_fileupload"
      }
    ],
    "attributionFields": {
      "sharedBy": "19",
      "utmSource": "20",
      "utmMedium": "21",
      "utmCampaign": "22"
    }
  },
  {
    "slug": "citizenship-info-form",
    "title": "Citizenship Info Form",
    "description": "N-400 naturalization application",
    "taskboardType": "citizenship-info",
    "serviceType": "Legal/Immigration",
    "jotformId": "241966156522056",
    "fields": [
      {
        "qid": "3",
        "name": "howLong",
        "label": "How Long You have a Green Card?",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "3 Years",
          "5 Years"
        ]
      },
      {
        "qid": "4",
        "name": "a9",
        "label": "A (9 Digit A-Number)",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "14",
        "name": "uscisOnline",
        "label": "USCIS Online A/c No.",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "5",
        "name": "yourCurrent",
        "label": "Your Current Legal Name (Exactly As It Appears on Permanent Resident Card)",
        "kind": "fullName",
        "required": false,
        "jotformType": "control_fullname"
      },
      {
        "qid": "16",
        "name": "gender",
        "label": "Gender",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Male",
          "Female"
        ]
      },
      {
        "qid": "15",
        "name": "dateOf",
        "label": "Date of Birth (mm/dd/yyyy)",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime",
        "sensitive": true
      },
      {
        "qid": "17",
        "name": "whenYou",
        "label": "When you become Lawful Resident",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime"
      },
      {
        "qid": "19",
        "name": "countryOf",
        "label": "Country of Birth",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "20",
        "name": "countryOf20",
        "label": "Country of Citizenship/Nationality",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "7",
        "name": "yourCurrent7",
        "label": "Your Current Legal Name (Exactly As It Appears on Permanent Resident Card)",
        "kind": "fullName",
        "required": false,
        "jotformType": "control_fullname"
      },
      {
        "qid": "8",
        "name": "yourCurrent8",
        "label": "Your Current Legal Name (Exactly As It Appears on Permanent Resident Card)",
        "kind": "fullName",
        "required": false,
        "jotformType": "control_fullname"
      },
      {
        "qid": "10",
        "name": "ifYes",
        "label": "If YES, enter your New Name you would like to use.",
        "kind": "fullName",
        "required": false,
        "jotformType": "control_fullname"
      },
      {
        "qid": "12",
        "name": "input12",
        "label": "input12",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "23",
        "name": "ethnicity",
        "label": "Ethnicity",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Hispanic or Latino",
          "Not Hispanic or Latino"
        ]
      },
      {
        "qid": "24",
        "name": "raceselect",
        "label": "Race (Select all applicable)",
        "kind": "checkbox",
        "required": false,
        "jotformType": "control_checkbox",
        "options": [
          "American Indian or Alaska Native",
          "Asian",
          "Black or African American",
          "Native Hawaiian or Other Pacific Islander",
          "White"
        ]
      },
      {
        "qid": "26",
        "name": "input26",
        "label": "input26",
        "kind": "text",
        "required": false,
        "jotformType": "control_inline"
      },
      {
        "qid": "27",
        "name": "input27",
        "label": "input27",
        "kind": "text",
        "required": false,
        "jotformType": "control_inline"
      },
      {
        "qid": "28",
        "name": "eyeColor",
        "label": "Eye Color",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Black",
          "Blue",
          "Brown",
          "Gray",
          "Green",
          "Hazel",
          "Maroon",
          "Pink",
          "Unknown/Other"
        ]
      },
      {
        "qid": "29",
        "name": "hairColor",
        "label": "Hair Color",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Bald (No hair)",
          "Black",
          "Blond",
          "Brown",
          "Gray",
          "Red",
          "Sandy",
          "White",
          "Unknown/",
          "Other"
        ]
      },
      {
        "qid": "32",
        "name": "currentAddress",
        "label": "Current Address",
        "kind": "address",
        "required": false,
        "jotformType": "control_address"
      },
      {
        "qid": "34",
        "name": "dateOf34",
        "label": "Date of Residence From",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime"
      },
      {
        "qid": "35",
        "name": "dateOf35",
        "label": "Date of Residence To",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime"
      },
      {
        "qid": "37",
        "name": "typeA",
        "label": "Add Address Other then Above, Where you lived in last 5 years",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_widget"
      },
      {
        "qid": "40",
        "name": "whatIs",
        "label": "What is your current marital status?",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Married",
          "Not Married"
        ]
      },
      {
        "qid": "42",
        "name": "currentSpouses",
        "label": "Current Spouse's Legal Name",
        "kind": "fullName",
        "required": false,
        "jotformType": "control_fullname"
      },
      {
        "qid": "43",
        "name": "spousesDate",
        "label": "Spouse's Date of Birth",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime",
        "sensitive": true
      },
      {
        "qid": "44",
        "name": "dateYou",
        "label": "Date you Married",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime"
      },
      {
        "qid": "45",
        "name": "isYour",
        "label": "Is your spouse's present physical address the same as your current address?",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "46",
        "name": "whenDid",
        "label": "When did your current spouse become a U.S. Citizen?",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "By Birth in United States",
          "Other"
        ]
      },
      {
        "qid": "47",
        "name": "dateYour",
        "label": "Date your Spouse Become US Citizen",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime"
      },
      {
        "qid": "48",
        "name": "currentSpouses48",
        "label": "Current Spouse's Alien Registration # (A-Number)",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox",
        "sensitive": true
      },
      {
        "qid": "49",
        "name": "howMany",
        "label": "How many times has your current spouse been married (including annulled marriages, marriages to other people, and marriages to the same person)?",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "50",
        "name": "currentSpouses50",
        "label": "Current Spouse's Current Employer or Company",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "54",
        "name": "indicateYour",
        "label": "Indicate your total number of children under 18 years of age",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "68",
        "name": "typeA68",
        "label": "Provide the following information about all your children (sons and daughters)",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_widget"
      },
      {
        "qid": "65",
        "name": "last5",
        "label": "Last 5 Years Employment Details",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_widget"
      },
      {
        "qid": "71",
        "name": "last571",
        "label": "Last 5 Years Travel History",
        "kind": "textarea",
        "required": false,
        "jotformType": "control_widget"
      },
      {
        "qid": "72",
        "name": "doYou72",
        "label": "Do you owe any overdue Federal, state, or local taxes?",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "73",
        "name": "haveYou",
        "label": "Have you EVER been arrested, cited, or detained by any law enforcement officer (including any immigration official or any official of the U.S. armed forces) for any reason",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "74",
        "name": "areYou",
        "label": "Are you a person born as a male who lived in the United States at any time between your 18th and 26th birthdays? (Do not select “Yes” if you were a lawful nonimmigrant for all of that time period.)",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "75",
        "name": "ifYou",
        "label": "If you answered “Yes,” to previous, did you register for the Selective Service?",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "qid": "76",
        "name": "dateRegistered",
        "label": "Date Registered (mm/dd/yyyy)",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime"
      },
      {
        "qid": "78",
        "name": "selectiveService",
        "label": "Selective Service Number",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "82",
        "name": "applicantsDaytime",
        "label": "Applicant's Daytime Telephone Number",
        "kind": "tel",
        "required": false,
        "jotformType": "control_phone"
      },
      {
        "qid": "83",
        "name": "applicantsMobile",
        "label": "Applicant's Mobile Telephone Number (if any)",
        "kind": "tel",
        "required": false,
        "jotformType": "control_phone"
      },
      {
        "qid": "84",
        "name": "applicantsEmail",
        "label": "Applicant's Email Address (if any)",
        "kind": "email",
        "required": false,
        "jotformType": "control_email"
      },
      {
        "qid": "88",
        "name": "uploadGreen",
        "label": "Upload Green Card",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "89",
        "name": "uploadBirth",
        "label": "Upload Birth Certificate",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "90",
        "name": "uploadDivorce",
        "label": "Upload Divorce Certificate",
        "kind": "file",
        "required": false,
        "jotformType": "control_fileupload"
      },
      {
        "qid": "85",
        "name": "applicantsSignature",
        "label": "Applicant's Signature",
        "kind": "signature",
        "required": false,
        "jotformType": "control_signature"
      },
      {
        "qid": "86",
        "name": "dateOf86",
        "label": "Date of Signature",
        "kind": "date",
        "required": false,
        "jotformType": "control_datetime"
      }
    ],
    "attributionFields": {
      "sharedBy": "93",
      "utmSource": "94",
      "utmMedium": "95",
      "utmCampaign": "96"
    }
  },
  {
    "slug": "l1-hil-auto-02",
    "title": "L1-HIL Auto 02",
    "description": "Automated HIC license processing",
    "taskboardType": "hil-auto-02",
    "serviceType": "Licensing",
    "jotformId": "253344597070157",
    "fields": [
      {
        "qid": "3",
        "name": "name",
        "label": "Name",
        "kind": "fullName",
        "required": true,
        "jotformType": "control_fullname"
      },
      {
        "qid": "4",
        "name": "email",
        "label": "Email",
        "kind": "email",
        "required": false,
        "jotformType": "control_email"
      },
      {
        "qid": "5",
        "name": "phoneNumber",
        "label": "Phone Number",
        "kind": "tel",
        "required": false,
        "jotformType": "control_phone"
      },
      {
        "qid": "6",
        "name": "licenseType",
        "label": "Construction Work Type",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "Home renovations or repairs (non-structural)",
          "Structural construction (framing, additions, extensions)",
          "Both home improvements and structural construction"
        ]
      },
      {
        "qid": "7",
        "name": "typeA7",
        "label": "License For",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "NYC (5 Boroughs)",
          "Nassau County"
        ]
      },
      {
        "qid": "9",
        "name": "language",
        "label": "Language",
        "kind": "radio",
        "required": false,
        "jotformType": "control_radio",
        "options": [
          "English",
          "Spanish",
          "Hindi"
        ]
      },
      {
        "qid": "10",
        "name": "typeA",
        "label": "SMS and call consent",
        "kind": "checkbox",
        "required": false,
        "jotformType": "control_checkbox",
        "options": [
          "I agree to receive SMS messages and/or calls (including automated or prerecorded) from Advantage Business Consulting LLC at the number I provided. Consent isn’t required for purchase. Msg & data rates may apply. Reply STOP to opt out."
        ]
      },
      {
        "qid": "8",
        "name": "status",
        "label": "Status",
        "kind": "text",
        "required": true,
        "jotformType": "control_textbox"
      }
    ],
    "attributionFields": {
      "sharedBy": "11",
      "utmSource": "12",
      "utmMedium": "13",
      "utmCampaign": "14"
    }
  },
  {
    "slug": "hic-auto-processing",
    "title": "HIC Auto Processing",
    "description": "HIC license auto-qualification",
    "taskboardType": "hic-auto-processing",
    "serviceType": "Licensing",
    "jotformId": "253484272415054",
    "fields": [
      {
        "qid": "7",
        "name": "id7",
        "label": "ID",
        "kind": "text",
        "required": false,
        "jotformType": "control_textbox"
      },
      {
        "qid": "5",
        "name": "name",
        "label": "Name",
        "kind": "fullName",
        "required": false,
        "jotformType": "control_fullname"
      },
      {
        "qid": "4",
        "name": "email",
        "label": "Email",
        "kind": "email",
        "required": false,
        "jotformType": "control_email"
      },
      {
        "qid": "6",
        "name": "phoneNumber",
        "label": "Phone Number",
        "kind": "tel",
        "required": false,
        "jotformType": "control_phone"
      }
    ],
    "attributionFields": {
      "sharedBy": "8",
      "utmSource": "9",
      "utmMedium": "10",
      "utmCampaign": "11"
    }
  }
] as const satisfies readonly NativeFormSchema[];

export type NativeFormSchemaSlug = (typeof nativeFormSchemas)[number]["slug"];

export function getNativeFormSchema(slug: string): NativeFormSchema | undefined {
  return nativeFormSchemas.find((schema) => schema.slug === slug);
}
