import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const citiesFilePath = path.join(__dirname, "../data/cities.json");

const existing = JSON.parse(fs.readFileSync(citiesFilePath, "utf8"));
const existingSlugs = new Set(existing.map((c) => c.slug.toLowerCase()));

const additionalCities = [
  // India Regional & Heritage Cities
  { name: "Varanasi", country: "India", countrySlug: "india", countryIso: "IN", lat: 25.3176, lng: 82.9739, timezone: "Asia/Kolkata", population: 1435114, areaKm2: 82 },
  { name: "Agra", country: "India", countrySlug: "india", countryIso: "IN", lat: 27.1767, lng: 78.0081, timezone: "Asia/Kolkata", population: 1585704, areaKm2: 120 },
  { name: "Coimbatore", country: "India", countrySlug: "india", countryIso: "IN", lat: 11.0168, lng: 76.9558, timezone: "Asia/Kolkata", population: 1601438, areaKm2: 247 },
  { name: "Mysore", country: "India", countrySlug: "india", countryIso: "IN", lat: 12.2958, lng: 76.6394, timezone: "Asia/Kolkata", population: 920550, areaKm2: 128 },
  { name: "Kochi", country: "India", countrySlug: "india", countryIso: "IN", lat: 9.9312, lng: 76.2673, timezone: "Asia/Kolkata", population: 677381, areaKm2: 95 },
  { name: "Guwahati", country: "India", countrySlug: "india", countryIso: "IN", lat: 26.1445, lng: 91.7362, timezone: "Asia/Kolkata", population: 962334, areaKm2: 216 },
  { name: "Chandigarh", country: "India", countrySlug: "india", countryIso: "IN", lat: 30.7333, lng: 76.7794, timezone: "Asia/Kolkata", population: 1055450, areaKm2: 114 },
  { name: "Dehradun", country: "India", countrySlug: "india", countryIso: "IN", lat: 30.3165, lng: 78.0322, timezone: "Asia/Kolkata", population: 578420, areaKm2: 300 },
  { name: "Amritsar", country: "India", countrySlug: "india", countryIso: "IN", lat: 31.6340, lng: 74.8723, timezone: "Asia/Kolkata", population: 1132761, areaKm2: 170 },
  { name: "Jodhpur", country: "India", countrySlug: "india", countryIso: "IN", lat: 26.2389, lng: 73.0243, timezone: "Asia/Kolkata", population: 1033918, areaKm2: 214 },
  { name: "Ranchi", country: "India", countrySlug: "india", countryIso: "IN", lat: 23.3441, lng: 85.3096, timezone: "Asia/Kolkata", population: 1073427, areaKm2: 175 },
  { name: "Raipur", country: "India", countrySlug: "india", countryIso: "IN", lat: 21.2514, lng: 81.6296, timezone: "Asia/Kolkata", population: 1010087, areaKm2: 226 },
  { name: "Bhubaneswar", country: "India", countrySlug: "india", countryIso: "IN", lat: 20.2961, lng: 85.8245, timezone: "Asia/Kolkata", population: 837737, areaKm2: 161 },
  { name: "Visakhapatnam", country: "India", countrySlug: "india", countryIso: "IN", lat: 17.6868, lng: 83.2185, timezone: "Asia/Kolkata", population: 1728128, areaKm2: 681 },
  { name: "Madurai", country: "India", countrySlug: "india", countryIso: "IN", lat: 9.9252, lng: 78.1198, timezone: "Asia/Kolkata", population: 1017865, areaKm2: 148 },
  { name: "Salem", country: "India", countrySlug: "india", countryIso: "IN", lat: 11.6643, lng: 78.1460, timezone: "Asia/Kolkata", population: 829267, areaKm2: 91 },
  { name: "Mangalore", country: "India", countrySlug: "india", countryIso: "IN", lat: 12.9141, lng: 74.8560, timezone: "Asia/Kolkata", population: 499487, areaKm2: 132 },
  { name: "Hubli", country: "India", countrySlug: "india", countryIso: "IN", lat: 15.3647, lng: 75.1240, timezone: "Asia/Kolkata", population: 943788, areaKm2: 213 },
  { name: "Nashik", country: "India", countrySlug: "india", countryIso: "IN", lat: 19.9975, lng: 73.7898, timezone: "Asia/Kolkata", population: 1486053, areaKm2: 259 },
  { name: "Aurangabad", country: "India", countrySlug: "india", countryIso: "IN", lat: 19.8762, lng: 75.3433, timezone: "Asia/Kolkata", population: 1175116, areaKm2: 139 },
  { name: "Udaipur", country: "India", countrySlug: "india", countryIso: "IN", lat: 24.5854, lng: 73.7125, timezone: "Asia/Kolkata", population: 451100, areaKm2: 64 },
  { name: "Gwalior", country: "India", countrySlug: "india", countryIso: "IN", lat: 26.2183, lng: 78.1828, timezone: "Asia/Kolkata", population: 1069276, areaKm2: 289 },
  { name: "Jabalpur", country: "India", countrySlug: "india", countryIso: "IN", lat: 23.1815, lng: 79.9864, timezone: "Asia/Kolkata", population: 1055525, areaKm2: 263 },
  { name: "Ujjain", country: "India", countrySlug: "india", countryIso: "IN", lat: 23.1765, lng: 75.7885, timezone: "Asia/Kolkata", population: 515215, areaKm2: 93 },
  { name: "Shimla", country: "India", countrySlug: "india", countryIso: "IN", lat: 31.1048, lng: 77.1734, timezone: "Asia/Kolkata", population: 169578, areaKm2: 35 },
  { name: "Dharamshala", country: "India", countrySlug: "india", countryIso: "IN", lat: 32.2190, lng: 76.3234, timezone: "Asia/Kolkata", population: 53543, areaKm2: 29 },
  { name: "Rishikesh", country: "India", countrySlug: "india", countryIso: "IN", lat: 30.0869, lng: 78.2676, timezone: "Asia/Kolkata", population: 102138, areaKm2: 41 },
  { name: "Haridwar", country: "India", countrySlug: "india", countryIso: "IN", lat: 29.9457, lng: 78.1642, timezone: "Asia/Kolkata", population: 228832, areaKm2: 63 },
  { name: "Srinagar", country: "India", countrySlug: "india", countryIso: "IN", lat: 34.0837, lng: 74.7973, timezone: "Asia/Kolkata", population: 1180570, areaKm2: 294 },
  { name: "Jammu", country: "India", countrySlug: "india", countryIso: "IN", lat: 32.7266, lng: 74.8570, timezone: "Asia/Kolkata", population: 502197, areaKm2: 112 },
  { name: "Leh", country: "India", countrySlug: "india", countryIso: "IN", lat: 34.1526, lng: 77.5771, timezone: "Asia/Kolkata", population: 30870, areaKm2: 45 },
  { name: "Gangtok", country: "India", countrySlug: "india", countryIso: "IN", lat: 27.3389, lng: 88.6065, timezone: "Asia/Kolkata", population: 100286, areaKm2: 19 },
  { name: "Shillong", country: "India", countrySlug: "india", countryIso: "IN", lat: 25.5788, lng: 91.8933, timezone: "Asia/Kolkata", population: 143229, areaKm2: 64 },

  // United States Small & Renowned Towns
  { name: "Boulder", country: "United States", countrySlug: "united-states", countryIso: "US", lat: 40.0150, lng: -105.2705, timezone: "America/Denver", population: 108250, areaKm2: 71 },
  { name: "Aspen", country: "United States", countrySlug: "united-states", countryIso: "US", lat: 39.1911, lng: -106.8175, timezone: "America/Denver", population: 7004, areaKm2: 10 },
  { name: "Santa Barbara", country: "United States", countrySlug: "united-states", countryIso: "US", lat: 34.4208, lng: -119.6982, timezone: "America/Los_Angeles", population: 88665, areaKm2: 108 },
  { name: "Palo Alto", country: "United States", countrySlug: "united-states", countryIso: "US", lat: 37.4419, lng: -122.1430, timezone: "America/Los_Angeles", population: 68572, areaKm2: 66 },
  { name: "Berkeley", country: "United States", countrySlug: "united-states", countryIso: "US", lat: 37.8715, lng: -122.2730, timezone: "America/Los_Angeles", population: 124341, areaKm2: 46 },
  { name: "Pasadena", country: "United States", countrySlug: "united-states", countryIso: "US", lat: 34.1478, lng: -118.1445, timezone: "America/Los_Angeles", population: 138699, areaKm2: 60 },
  { name: "Santa Cruz", country: "United States", countrySlug: "united-states", countryIso: "US", lat: 36.9741, lng: -122.0308, timezone: "America/Los_Angeles", population: 62956, areaKm2: 41 },
  { name: "Sedona", country: "United States", countrySlug: "united-states", countryIso: "US", lat: 34.8697, lng: -111.7610, timezone: "America/Phoenix", population: 9684, areaKm2: 49 },
  { name: "Flagstaff", country: "United States", countrySlug: "united-states", countryIso: "US", lat: 35.1983, lng: -111.6513, timezone: "America/Phoenix", population: 76831, areaKm2: 166 },
  { name: "Savannah", country: "United States", countrySlug: "united-states", countryIso: "US", lat: 32.0809, lng: -81.0912, timezone: "America/New_York", population: 147780, areaKm2: 281 },
  { name: "Charleston", country: "United States", countrySlug: "united-states", countryIso: "US", lat: 32.7765, lng: -79.9311, timezone: "America/New_York", population: 150227, areaKm2: 334 },
  { name: "Asheville", country: "United States", countrySlug: "united-states", countryIso: "US", lat: 35.5951, lng: -82.5515, timezone: "America/New_York", population: 94589, areaKm2: 117 },
  { name: "Key West", country: "United States", countrySlug: "united-states", countryIso: "US", lat: 24.5551, lng: -81.7800, timezone: "America/New_York", population: 26444, areaKm2: 19 },
  { name: "Burlington", country: "United States", countrySlug: "united-states", countryIso: "US", lat: 44.4759, lng: -73.2121, timezone: "America/New_York", population: 44743, areaKm2: 40 },
  { name: "Providence", country: "United States", countrySlug: "united-states", countryIso: "US", lat: 41.8240, lng: -71.4128, timezone: "America/New_York", population: 190934, areaKm2: 53 },
  { name: "Newport", country: "United States", countrySlug: "united-states", countryIso: "US", lat: 41.4901, lng: -71.3128, timezone: "America/New_York", population: 25163, areaKm2: 29 },
  { name: "Ann Arbor", country: "United States", countrySlug: "united-states", countryIso: "US", lat: 42.2808, lng: -83.7430, timezone: "America/Detroit", population: 123851, areaKm2: 75 },
  { name: "Madison", country: "United States", countrySlug: "united-states", countryIso: "US", lat: 43.0731, lng: -89.4012, timezone: "America/Chicago", population: 269840, areaKm2: 263 },
  { name: "Duluth", country: "United States", countrySlug: "united-states", countryIso: "US", lat: 46.7867, lng: -92.1005, timezone: "America/Chicago", population: 86697, areaKm2: 226 },
  { name: "Bozeman", country: "United States", countrySlug: "united-states", countryIso: "US", lat: 45.6770, lng: -111.0429, timezone: "America/Denver", population: 53293, areaKm2: 50 },
  { name: "Jackson", country: "United States", countrySlug: "united-states", countryIso: "US", lat: 43.4799, lng: -110.7624, timezone: "America/Denver", population: 10760, areaKm2: 8 },
  { name: "Bend", country: "United States", countrySlug: "united-states", countryIso: "US", lat: 44.0582, lng: -121.3153, timezone: "America/Los_Angeles", population: 99178, areaKm2: 86 },
  { name: "Eugene", country: "United States", countrySlug: "united-states", countryIso: "US", lat: 44.0521, lng: -123.0868, timezone: "America/Los_Angeles", population: 176654, areaKm2: 113 },
  { name: "Olympia", country: "United States", countrySlug: "united-states", countryIso: "US", lat: 47.0379, lng: -122.9007, timezone: "America/Los_Angeles", population: 55605, areaKm2: 52 },
  { name: "Reno", country: "United States", countrySlug: "united-states", countryIso: "US", lat: 39.5296, lng: -119.8138, timezone: "America/Los_Angeles", population: 264165, areaKm2: 288 },

  // United Kingdom Historic Towns
  { name: "Oxford", country: "United Kingdom", countrySlug: "united-kingdom", countryIso: "GB", lat: 51.7520, lng: -1.2577, timezone: "Europe/London", population: 152450, areaKm2: 46 },
  { name: "Cambridge", country: "United Kingdom", countrySlug: "united-kingdom", countryIso: "GB", lat: 52.2053, lng: 0.1218, timezone: "Europe/London", population: 145700, areaKm2: 41 },
  { name: "Bath", country: "United Kingdom", countrySlug: "united-kingdom", countryIso: "GB", lat: 51.3758, lng: -2.3599, timezone: "Europe/London", population: 101106, areaKm2: 29 },
  { name: "York", country: "United Kingdom", countrySlug: "united-kingdom", countryIso: "GB", lat: 53.9599, lng: -1.0873, timezone: "Europe/London", population: 211000, areaKm2: 271 },
  { name: "Canterbury", country: "United Kingdom", countrySlug: "united-kingdom", countryIso: "GB", lat: 51.2802, lng: 1.0789, timezone: "Europe/London", population: 55240, areaKm2: 23 },
  { name: "Windsor", country: "United Kingdom", countrySlug: "united-kingdom", countryIso: "GB", lat: 51.4839, lng: -0.6044, timezone: "Europe/London", population: 32184, areaKm2: 12 },
  { name: "Brighton", country: "United Kingdom", countrySlug: "united-kingdom", countryIso: "GB", lat: 50.8225, lng: -0.1372, timezone: "Europe/London", population: 277200, areaKm2: 83 },
  { name: "Inverness", country: "United Kingdom", countrySlug: "united-kingdom", countryIso: "GB", lat: 57.4778, lng: -4.2247, timezone: "Europe/London", population: 46870, areaKm2: 26 },
  { name: "St Andrews", country: "United Kingdom", countrySlug: "united-kingdom", countryIso: "GB", lat: 56.3398, lng: -2.7967, timezone: "Europe/London", population: 16800, areaKm2: 9 },

  // Europe Scenic & Historic Cities
  { name: "Bruges", country: "Belgium", countrySlug: "belgium", countryIso: "BE", lat: 51.2093, lng: 3.2247, timezone: "Europe/Brussels", population: 118509, areaKm2: 138 },
  { name: "Ghent", country: "Belgium", countrySlug: "belgium", countryIso: "BE", lat: 51.0543, lng: 3.7174, timezone: "Europe/Brussels", population: 263927, areaKm2: 156 },
  { name: "Heidelberg", country: "Germany", countrySlug: "germany", countryIso: "DE", lat: 49.3988, lng: 8.6724, timezone: "Europe/Berlin", population: 159245, areaKm2: 109 },
  { name: "Freiburg", country: "Germany", countrySlug: "germany", countryIso: "DE", lat: 47.9990, lng: 7.8421, timezone: "Europe/Berlin", population: 230940, areaKm2: 153 },
  { name: "Salzburg", country: "Austria", countrySlug: "austria", countryIso: "AT", lat: 47.8095, lng: 13.0550, timezone: "Europe/Vienna", population: 155021, areaKm2: 66 },
  { name: "Innsbruck", country: "Austria", countrySlug: "austria", countryIso: "AT", lat: 47.2692, lng: 11.4041, timezone: "Europe/Vienna", population: 132493, areaKm2: 105 },
  { name: "Lucerne", country: "Switzerland", countrySlug: "switzerland", countryIso: "CH", lat: 47.0502, lng: 8.3093, timezone: "Europe/Zurich", population: 82257, areaKm2: 29 },
  { name: "Interlaken", country: "Switzerland", countrySlug: "switzerland", countryIso: "CH", lat: 46.6863, lng: 7.8632, timezone: "Europe/Zurich", population: 5719, areaKm2: 4 },
  { name: "Zermatt", country: "Switzerland", countrySlug: "switzerland", countryIso: "CH", lat: 45.9763, lng: 7.7491, timezone: "Europe/Zurich", population: 5746, areaKm2: 242 },
  { name: "Lausanne", country: "Switzerland", countrySlug: "switzerland", countryIso: "CH", lat: 46.5197, lng: 6.6323, timezone: "Europe/Zurich", population: 141418, areaKm2: 41 },
  { name: "Nice", country: "France", countrySlug: "france", countryIso: "FR", lat: 43.7102, lng: 7.2620, timezone: "Europe/Paris", population: 342669, areaKm2: 72 },
  { name: "Cannes", country: "France", countrySlug: "france", countryIso: "FR", lat: 43.5528, lng: 7.0174, timezone: "Europe/Paris", population: 74152, areaKm2: 20 },
  { name: "Strasbourg", country: "France", countrySlug: "france", countryIso: "FR", lat: 48.5734, lng: 7.7521, timezone: "Europe/Paris", population: 291313, areaKm2: 78 },
  { name: "Colmar", country: "France", countrySlug: "france", countryIso: "FR", lat: 48.0794, lng: 7.3585, timezone: "Europe/Paris", population: 68670, areaKm2: 66 },
  { name: "Bordeaux", country: "France", countrySlug: "france", countryIso: "FR", lat: 44.8378, lng: -0.5792, timezone: "Europe/Paris", population: 260958, areaKm2: 49 },
  { name: "Florence", country: "Italy", countrySlug: "italy", countryIso: "IT", lat: 43.7696, lng: 11.2558, timezone: "Europe/Rome", population: 382258, areaKm2: 102 },
  { name: "Venice", country: "Italy", countrySlug: "italy", countryIso: "IT", lat: 45.4408, lng: 12.3155, timezone: "Europe/Rome", population: 261905, areaKm2: 414 },
  { name: "Pisa", country: "Italy", countrySlug: "italy", countryIso: "IT", lat: 43.7228, lng: 10.4017, timezone: "Europe/Rome", population: 90488, areaKm2: 185 },
  { name: "Verona", country: "Italy", countrySlug: "italy", countryIso: "IT", lat: 45.4384, lng: 10.9916, timezone: "Europe/Rome", population: 257353, areaKm2: 199 },
  { name: "Seville", country: "Spain", countrySlug: "spain", countryIso: "ES", lat: 37.3891, lng: -5.9845, timezone: "Europe/Madrid", population: 688711, areaKm2: 141 },
  { name: "Granada", country: "Spain", countrySlug: "spain", countryIso: "ES", lat: 37.1773, lng: -3.5986, timezone: "Europe/Madrid", population: 232208, areaKm2: 88 },
  { name: "San Sebastian", country: "Spain", countrySlug: "spain", countryIso: "ES", lat: 43.3183, lng: -1.9812, timezone: "Europe/Madrid", population: 188240, areaKm2: 60 },
  { name: "Porto", country: "Portugal", countrySlug: "portugal", countryIso: "PT", lat: 41.1579, lng: -8.6291, timezone: "Europe/Lisbon", population: 231800, areaKm2: 41 },
  { name: "Faro", country: "Portugal", countrySlug: "portugal", countryIso: "PT", lat: 37.0194, lng: -7.9304, timezone: "Europe/Lisbon", population: 67566, areaKm2: 202 },

  // Canada & Oceania
  { name: "Banff", country: "Canada", countrySlug: "canada", countryIso: "CA", lat: 51.1784, lng: -115.5708, timezone: "America/Edmonton", population: 7851, areaKm2: 5 },
  { name: "Jasper", country: "Canada", countrySlug: "canada", countryIso: "CA", lat: 52.8737, lng: -118.0814, timezone: "America/Edmonton", population: 4590, areaKm2: 924 },
  { name: "Victoria", country: "Canada", countrySlug: "canada", countryIso: "CA", lat: 48.4284, lng: -123.3656, timezone: "America/Vancouver", population: 91861, areaKm2: 19 },
  { name: "Whistler", country: "Canada", countrySlug: "canada", countryIso: "CA", lat: 50.1163, lng: -122.9574, timezone: "America/Vancouver", population: 13982, areaKm2: 240 },
  { name: "Niagara Falls", country: "Canada", countrySlug: "canada", countryIso: "CA", lat: 43.0896, lng: -79.0849, timezone: "America/Toronto", population: 88071, areaKm2: 210 },
  { name: "Cairns", country: "Australia", countrySlug: "australia", countryIso: "AU", lat: -16.9186, lng: 145.7781, timezone: "Australia/Brisbane", population: 153951, areaKm2: 254 },
  { name: "Hobart", country: "Australia", countrySlug: "australia", countryIso: "AU", lat: -42.8821, lng: 147.3272, timezone: "Australia/Hobart", population: 247068, areaKm2: 1695 },
  { name: "Darwin", country: "Australia", countrySlug: "australia", countryIso: "AU", lat: -12.4634, lng: 130.8456, timezone: "Australia/Darwin", population: 147255, areaKm2: 112 },
  { name: "Queenstown", country: "New Zealand", countrySlug: "new-zealand", countryIso: "NZ", lat: -45.0312, lng: 168.6626, timezone: "Pacific/Auckland", population: 16000, areaKm2: 25 },
  { name: "Rotorua", country: "New Zealand", countrySlug: "new-zealand", countryIso: "NZ", lat: -38.1368, lng: 176.2497, timezone: "Pacific/Auckland", population: 58500, areaKm2: 2614 },

  // Asia & World Culture Centers
  { name: "Kyoto", country: "Japan", countrySlug: "japan", countryIso: "JP", lat: 35.0116, lng: 135.7681, timezone: "Asia/Tokyo", population: 1463723, areaKm2: 827 },
  { name: "Nara", country: "Japan", countrySlug: "japan", countryIso: "JP", lat: 34.6851, lng: 135.8048, timezone: "Asia/Tokyo", population: 354630, areaKm2: 276 },
  { name: "Hiroshima", country: "Japan", countrySlug: "japan", countryIso: "JP", lat: 34.3853, lng: 132.4553, timezone: "Asia/Tokyo", population: 1199391, areaKm2: 906 },
  { name: "Chiang Mai", country: "Thailand", countrySlug: "thailand", countryIso: "TH", lat: 18.7883, lng: 98.9853, timezone: "Asia/Bangkok", population: 127240, areaKm2: 40 },
  { name: "Phuket", country: "Thailand", countrySlug: "thailand", countryIso: "TH", lat: 7.8804, lng: 98.3923, timezone: "Asia/Bangkok", population: 79308, areaKm2: 12 },
  { name: "Da Nang", country: "Vietnam", countrySlug: "vietnam", countryIso: "VN", lat: 16.0544, lng: 108.2022, timezone: "Asia/Ho_Chi_Minh", population: 1220190, areaKm2: 1285 },
  { name: "Hoi An", country: "Vietnam", countrySlug: "vietnam", countryIso: "VN", lat: 15.8801, lng: 108.3380, timezone: "Asia/Ho_Chi_Minh", population: 121716, areaKm2: 60 },
  { name: "Ubud", country: "Indonesia", countrySlug: "indonesia", countryIso: "ID", lat: -8.5069, lng: 115.2625, timezone: "Asia/Makassar", population: 74800, areaKm2: 42 },
  { name: "Pokhara", country: "Nepal", countrySlug: "nepal", countryIso: "NP", lat: 28.2096, lng: 83.9856, timezone: "Asia/Kathmandu", population: 518452, areaKm2: 464 },
  { name: "Cusco", country: "Peru", countrySlug: "peru", countryIso: "PE", lat: -13.5319, lng: -71.9675, timezone: "America/Lima", population: 428450, areaKm2: 142 },
  { name: "Luxor", country: "Egypt", countrySlug: "egypt", countryIso: "EG", lat: 25.6872, lng: 32.6396, timezone: "Africa/Cairo", population: 506588, areaKm2: 416 },
  { name: "Zanzibar", country: "Tanzania", countrySlug: "tanzania", countryIso: "TZ", lat: -6.1659, lng: 39.2026, timezone: "Africa/Dar_es_Salaam", population: 223033, areaKm2: 16 },
  { name: "Marrakech", country: "Morocco", countrySlug: "morocco", countryIso: "MA", lat: 31.6295, lng: -7.9811, timezone: "Africa/Casablanca", population: 928850, areaKm2: 230 },
];

let added = 0;
for (const city of additionalCities) {
  const slug = city.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!existingSlugs.has(slug)) {
    existing.push({
      name: city.name,
      slug,
      country: city.country,
      countrySlug: city.countrySlug,
      countryIso: city.countryIso,
      lat: city.lat,
      lng: city.lng,
      timezone: city.timezone,
      population: city.population,
      areaKm2: city.areaKm2,
    });
    existingSlugs.add(slug);
    added++;
  }
}

// Sort alphabetically by name
existing.sort((a, b) => a.name.localeCompare(b.name));

fs.writeFileSync(citiesFilePath, JSON.stringify(existing, null, 2), "utf8");
console.log(`Added ${added} new small and regional cities! Total cities in database now: ${existing.length}`);
