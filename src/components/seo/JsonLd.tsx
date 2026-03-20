type LocalBusinessData = {
  "@context": "https://schema.org";
  "@type": "LocalBusiness";
  name: string;
  description: string;
  url: string;
  telephone: string;
  email: string;
  address: {
    "@type": "PostalAddress";
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo: {
    "@type": "GeoCoordinates";
    latitude: number;
    longitude: number;
  };
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification";
    dayOfWeek: string[];
    opens: string;
    closes: string;
  };
  priceRange: string;
  areaServed: string[];
};

type ServiceData = {
  "@context": "https://schema.org";
  "@type": "Service";
  name: string;
  description: string;
  url: string;
  provider: {
    "@type": "LocalBusiness";
    name: string;
  };
  areaServed: string;
};

type FAQPageData = {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: {
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }[];
};

type BreadcrumbListData = {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: {
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }[];
};

type JsonLdData =
  | LocalBusinessData
  | ServiceData
  | FAQPageData
  | BreadcrumbListData;

type JsonLdProps =
  | { type: "LocalBusiness" }
  | {
      type: "Service";
      serviceName: string;
      serviceDescription: string;
      serviceUrl: string;
    }
  | { type: "FAQPage"; faqs: Array<{ question: string; answer: string }> }
  | {
      type: "BreadcrumbList";
      items: Array<{ name: string; url: string }>;
    };

function buildData(props: JsonLdProps): JsonLdData {
  switch (props.type) {
    case "LocalBusiness":
      return {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Advantage Services",
        description:
          "One-stop shop for business consulting, tax preparation, licensing, insurance, and legal services in Queens, NYC.",
        url: "https://advantagenys.com",
        telephone: "+19299331396",
        email: "info@advantagenys.com",
        address: {
          "@type": "PostalAddress",
          streetAddress: "229-14 Linden Blvd",
          addressLocality: "Cambria Heights",
          addressRegion: "NY",
          postalCode: "11411",
          addressCountry: "US",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 40.6945,
          longitude: -73.7377,
        },
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
          opens: "10:00",
          closes: "20:00",
        },
        priceRange: "$$",
        areaServed: ["Queens", "New York City", "Long Island", "NYC Metro Area"],
      };

    case "Service":
      return {
        "@context": "https://schema.org",
        "@type": "Service",
        name: props.serviceName,
        description: props.serviceDescription,
        url: props.serviceUrl,
        provider: {
          "@type": "LocalBusiness",
          name: "Advantage Services",
        },
        areaServed: "Queens, NYC",
      };

    case "FAQPage":
      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: props.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      };

    case "BreadcrumbList":
      return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: props.items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      };
  }
}

export function JsonLd(props: JsonLdProps) {
  const data = buildData(props);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
