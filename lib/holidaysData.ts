export interface PublicHoliday {
  name: string;
  dateStr: string; // e.g. "January 1" or "July 4"
  type: "National" | "Statutory" | "Public" | "Federal" | "Bank Holiday";
}

// Curated statutory holiday profiles for top countries with fallbacks for global territories
const COUNTRY_HOLIDAYS: Record<string, PublicHoliday[]> = {
  US: [
    { name: "New Year's Day", dateStr: "January 1", type: "Federal" },
    { name: "Memorial Day", dateStr: "Last Monday in May", type: "Federal" },
    { name: "Independence Day", dateStr: "July 4", type: "National" },
    { name: "Labor Day", dateStr: "First Monday in September", type: "Federal" },
    { name: "Thanksgiving Day", dateStr: "Fourth Thursday in November", type: "Federal" },
    { name: "Christmas Day", dateStr: "December 25", type: "Federal" },
  ],
  GB: [
    { name: "New Year's Day", dateStr: "January 1", type: "Bank Holiday" },
    { name: "Good Friday", dateStr: "Spring (Varies)", type: "Bank Holiday" },
    { name: "Early May Bank Holiday", dateStr: "First Monday in May", type: "Bank Holiday" },
    { name: "Summer Bank Holiday", dateStr: "Late August", type: "Bank Holiday" },
    { name: "Christmas Day", dateStr: "December 25", type: "Public" },
    { name: "Boxing Day", dateStr: "December 26", type: "Public" },
  ],
  IN: [
    { name: "Republic Day", dateStr: "January 26", type: "National" },
    { name: "Independence Day", dateStr: "August 15", type: "National" },
    { name: "Mahatma Gandhi Jayanti", dateStr: "October 2", type: "National" },
    { name: "Diwali (Deepavali)", dateStr: "Autumn (Varies)", type: "Public" },
    { name: "Holi", dateStr: "Spring (Varies)", type: "Public" },
  ],
  CA: [
    { name: "New Year's Day", dateStr: "January 1", type: "Statutory" },
    { name: "Victoria Day", dateStr: "Late May", type: "Statutory" },
    { name: "Canada Day", dateStr: "July 1", type: "National" },
    { name: "Labour Day", dateStr: "First Monday in September", type: "Statutory" },
    { name: "Thanksgiving Day", dateStr: "Second Monday in October", type: "Statutory" },
    { name: "Christmas Day", dateStr: "December 25", type: "Statutory" },
  ],
  AU: [
    { name: "New Year's Day", dateStr: "January 1", type: "Public" },
    { name: "Australia Day", dateStr: "January 26", type: "National" },
    { name: "Anzac Day", dateStr: "April 25", type: "National" },
    { name: "King's Birthday", dateStr: "June (Varies by state)", type: "Public" },
    { name: "Christmas Day", dateStr: "December 25", type: "Public" },
    { name: "Boxing Day", dateStr: "December 26", type: "Public" },
  ],
  DE: [
    { name: "New Year's Day", dateStr: "January 1", type: "Public" },
    { name: "Labour Day (Tag der Arbeit)", dateStr: "May 1", type: "Public" },
    { name: "German Unity Day", dateStr: "October 3", type: "National" },
    { name: "Christmas Day", dateStr: "December 25", type: "Public" },
  ],
  FR: [
    { name: "New Year's Day", dateStr: "January 1", type: "Public" },
    { name: "Labor Day (Fête du Travail)", dateStr: "May 1", type: "Public" },
    { name: "Bastille Day", dateStr: "July 14", type: "National" },
    { name: "Armistice Day", dateStr: "November 11", type: "National" },
    { name: "Christmas Day", dateStr: "December 25", type: "Public" },
  ],
  JP: [
    { name: "New Year's Day (Gantan)", dateStr: "January 1", type: "National" },
    { name: "National Foundation Day", dateStr: "February 11", type: "National" },
    { name: "Showa Day", dateStr: "April 29", type: "National" },
    { name: "Constitution Memorial Day", dateStr: "May 3", type: "National" },
    { name: "Culture Day", dateStr: "November 3", type: "National" },
  ],
};

export function getCountryPublicHolidays(countryIso: string, countryName: string): PublicHoliday[] {
  const upper = (countryIso || "").toUpperCase();
  if (COUNTRY_HOLIDAYS[upper]) {
    return COUNTRY_HOLIDAYS[upper];
  }

  return [
    { name: "New Year's Day", dateStr: "January 1", type: "Public" },
    { name: `${countryName} National Day`, dateStr: "Mid-Year", type: "National" },
    { name: "International Workers' Day", dateStr: "May 1", type: "Public" },
    { name: "Year-End Public Holiday", dateStr: "Late December", type: "Public" },
  ];
}
