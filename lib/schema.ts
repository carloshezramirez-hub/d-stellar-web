import { BUSINESS, SITE_URL } from "@/data/site";
import type { EventRecord } from "@/data/events";

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    "@id": `${SITE_URL}/#business`,
    name: BUSINESS.name,
    alternateName: BUSINESS.legalName,
    url: SITE_URL,
    image: `${SITE_URL}/images/og/d-stellar-storefront.jpg`,
    priceRange: "$$",
    servesCuisine: ["Bakery", "Coffee", "Desserts"],
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.streetAddress,
      addressLocality: BUSINESS.addressLocality,
      addressRegion: BUSINESS.addressRegion,
      postalCode: BUSINESS.postalCode,
      addressCountry: BUSINESS.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS.geo.latitude,
      longitude: BUSINESS.geo.longitude,
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
        "Sunday",
      ],
      opens: BUSINESS.hours.opens,
      closes: BUSINESS.hours.closes,
    },
    sameAs: Object.values(BUSINESS.social),
    menu: `${SITE_URL}/menu`,
    hasMap: BUSINESS.mapsUrl,
    petsAllowed: true,
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: BUSINESS.name,
    publisher: { "@id": `${SITE_URL}/#business` },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function eventSchema(event: EventRecord, locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `${SITE_URL}/${locale === "en" ? "en/" : ""}events/${event.slug}#event`,
    name: event.title,
    startDate: event.dateISO,
    endDate: event.endISO,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    description: event.summary[locale as "es" | "en"],
    image: `${SITE_URL}${event.coverImage}`,
    maximumAttendeeCapacity: event.capacity,
    location: {
      "@type": "Place",
      name: BUSINESS.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: BUSINESS.streetAddress,
        addressLocality: BUSINESS.addressLocality,
        addressRegion: BUSINESS.addressRegion,
        postalCode: BUSINESS.postalCode,
        addressCountry: BUSINESS.addressCountry,
      },
    },
    organizer: {
      "@type": "Organization",
      name: BUSINESS.name,
      url: SITE_URL,
    },
    ...(event.priceMXN
      ? {
          offers: {
            "@type": "Offer",
            price: event.priceMXN,
            priceCurrency: "MXN",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/${locale === "en" ? "en/" : ""}events/${event.slug}`,
          },
        }
      : {}),
  };
}

export function menuSchema(
  sections: Array<{ title: string; items: Array<{ name: string; description: string }> }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: `${BUSINESS.name} menu`,
    hasMenuSection: sections.map((section) => ({
      "@type": "MenuSection",
      name: section.title,
      hasMenuItem: section.items.map((item) => ({
        "@type": "MenuItem",
        name: item.name,
        description: item.description,
      })),
    })),
  };
}
