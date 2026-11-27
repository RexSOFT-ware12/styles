import { SITE_URL } from "@/lib/site";

/**
 * Markets Google may show our products in. Everything is a digital download,
 * so delivery is instant and free everywhere; the list just has to name
 * countries (Google has no "worldwide" value).
 */
const COUNTRIES = [
  "US", "CA", "GB", "IE", "AU", "NZ", "DE", "FR", "ES", "IT", "NL", "BE", "PT", "SE", "NO", "DK", "FI", "PL", "AT",
  "CH", "CZ", "GR", "RO", "HU", "TR", "AE", "SA", "IL", "IN", "PK", "BD", "LK", "SG", "MY", "TH", "VN", "PH", "ID",
  "JP", "KR", "TW", "HK", "CN", "ZA", "NG", "GH", "KE", "EG", "MA", "TZ", "UG", "BR", "MX", "AR", "CL", "CO", "PE",
];

/** Instant, free delivery by download link. */
export const shippingDetails = {
  "@type": "OfferShippingDetails",
  shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "USD" },
  shippingDestination: COUNTRIES.map((c) => ({ "@type": "DefinedRegion", addressCountry: c })),
  deliveryTime: {
    "@type": "ShippingDeliveryTime",
    handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
    transitTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
  },
};

/**
 * Mirrors /returns exactly: no standard returns on digital downloads (help is
 * given for broken files, wrong product and double charges). If that policy
 * page ever changes, change this with it.
 */
export const merchantReturnPolicy = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: COUNTRIES,
  returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
  merchantReturnLink: `${SITE_URL}/returns`,
};
