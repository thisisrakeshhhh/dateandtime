import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const countriesPath = path.resolve(__dirname, "../data/countries.json");
const currentCountries = JSON.parse(fs.readFileSync(countriesPath, "utf-8"));
const existingSlugs = new Set(currentCountries.map((c) => c.slug.toLowerCase()));
const existingIsos = new Set(currentCountries.map((c) => c.iso.toUpperCase()));

// Comprehensive list of additional world countries
const additionalCountries = [
  // Europe
  { name: "Albania", iso: "AL", capital: "Tirana", lat: 41.3275, lng: 19.8187, mainZone: "Europe/Tirane", otherZones: [], continent: "Europe", slug: "albania" },
  { name: "Andorra", iso: "AD", capital: "Andorra la Vella", lat: 42.5063, lng: 1.5218, mainZone: "Europe/Andorra", otherZones: [], continent: "Europe", slug: "andorra" },
  { name: "Armenia", iso: "AM", capital: "Yerevan", lat: 40.1792, lng: 44.4991, mainZone: "Asia/Yerevan", otherZones: [], continent: "Asia", slug: "armenia" },
  { name: "Azerbaijan", iso: "AZ", capital: "Baku", lat: 40.4093, lng: 49.8671, mainZone: "Asia/Baku", otherZones: [], continent: "Asia", slug: "azerbaijan" },
  { name: "Belarus", iso: "BY", capital: "Minsk", lat: 53.9045, lng: 27.5615, mainZone: "Europe/Minsk", otherZones: [], continent: "Europe", slug: "belarus" },
  { name: "Bosnia and Herzegovina", iso: "BA", capital: "Sarajevo", lat: 43.8563, lng: 18.4131, mainZone: "Europe/Sarajevo", otherZones: [], continent: "Europe", slug: "bosnia-and-herzegovina" },
  { name: "Bulgaria", iso: "BG", capital: "Sofia", lat: 42.6977, lng: 23.3219, mainZone: "Europe/Sofia", otherZones: [], continent: "Europe", slug: "bulgaria" },
  { name: "Croatia", iso: "HR", capital: "Zagreb", lat: 45.815, lng: 15.9819, mainZone: "Europe/Zagreb", otherZones: [], continent: "Europe", slug: "croatia" },
  { name: "Cyprus", iso: "CY", capital: "Nicosia", lat: 35.1856, lng: 33.3823, mainZone: "Asia/Nicosia", otherZones: [], continent: "Europe", slug: "cyprus" },
  { name: "Estonia", iso: "EE", capital: "Tallinn", lat: 59.437, lng: 24.7536, mainZone: "Europe/Tallinn", otherZones: [], continent: "Europe", slug: "estonia" },
  { name: "Georgia", iso: "GE", capital: "Tbilisi", lat: 41.7151, lng: 44.8271, mainZone: "Asia/Tbilisi", otherZones: [], continent: "Asia", slug: "georgia" },
  { name: "Kosovo", iso: "XK", capital: "Pristina", lat: 42.6629, lng: 21.1655, mainZone: "Europe/Belgrade", otherZones: [], continent: "Europe", slug: "kosovo" },
  { name: "Latvia", iso: "LV", capital: "Riga", lat: 56.9496, lng: 24.1052, mainZone: "Europe/Riga", otherZones: [], continent: "Europe", slug: "latvia" },
  { name: "Liechtenstein", iso: "LI", capital: "Vaduz", lat: 47.141, lng: 9.5209, mainZone: "Europe/Vaduz", otherZones: [], continent: "Europe", slug: "liechtenstein" },
  { name: "Lithuania", iso: "LT", capital: "Vilnius", lat: 54.6872, lng: 25.2797, mainZone: "Europe/Vilnius", otherZones: [], continent: "Europe", slug: "lithuania" },
  { name: "Luxembourg", iso: "LU", capital: "Luxembourg", lat: 49.6116, lng: 6.1319, mainZone: "Europe/Luxembourg", otherZones: [], continent: "Europe", slug: "luxembourg" },
  { name: "Malta", iso: "MT", capital: "Valletta", lat: 35.8989, lng: 14.5146, mainZone: "Europe/Malta", otherZones: [], continent: "Europe", slug: "malta" },
  { name: "Moldova", iso: "MD", capital: "Chisinau", lat: 47.0105, lng: 28.8638, mainZone: "Europe/Chisinau", otherZones: [], continent: "Europe", slug: "moldova" },
  { name: "Monaco", iso: "MC", capital: "Monaco", lat: 43.7384, lng: 7.4246, mainZone: "Europe/Monaco", otherZones: [], continent: "Europe", slug: "monaco" },
  { name: "Montenegro", iso: "ME", capital: "Podgorica", lat: 42.4304, lng: 19.2594, mainZone: "Europe/Podgorica", otherZones: [], continent: "Europe", slug: "montenegro" },
  { name: "North Macedonia", iso: "MK", capital: "Skopje", lat: 41.9973, lng: 21.428, mainZone: "Europe/Skopje", otherZones: [], continent: "Europe", slug: "north-macedonia" },
  { name: "San Marino", iso: "SM", capital: "San Marino", lat: 43.9424, lng: 12.4578, mainZone: "Europe/San_Marino", otherZones: [], continent: "Europe", slug: "san-marino" },
  { name: "Serbia", iso: "RS", capital: "Belgrade", lat: 44.7866, lng: 20.4489, mainZone: "Europe/Belgrade", otherZones: [], continent: "Europe", slug: "serbia" },
  { name: "Slovakia", iso: "SK", capital: "Bratislava", lat: 48.1486, lng: 17.1077, mainZone: "Europe/Bratislava", otherZones: [], continent: "Europe", slug: "slovakia" },
  { name: "Slovenia", iso: "SI", capital: "Ljubljana", lat: 46.0569, lng: 14.5058, mainZone: "Europe/Ljubljana", otherZones: [], continent: "Europe", slug: "slovenia" },
  { name: "Vatican City", iso: "VA", capital: "Vatican City", lat: 41.9029, lng: 12.4534, mainZone: "Europe/Vatican", otherZones: [], continent: "Europe", slug: "vatican-city" },

  // Asia
  { name: "Afghanistan", iso: "AF", capital: "Kabul", lat: 34.5553, lng: 69.2075, mainZone: "Asia/Kabul", otherZones: [], continent: "Asia", slug: "afghanistan" },
  { name: "Bhutan", iso: "BT", capital: "Thimphu", lat: 27.4728, lng: 89.6393, mainZone: "Asia/Thimphu", otherZones: [], continent: "Asia", slug: "bhutan" },
  { name: "Brunei", iso: "BN", capital: "Bandar Seri Begawan", lat: 4.9031, lng: 114.9398, mainZone: "Asia/Brunei", otherZones: [], continent: "Asia", slug: "brunei" },
  { name: "Cambodia", iso: "KH", capital: "Phnom Penh", lat: 11.5564, lng: 104.9282, mainZone: "Asia/Phnom_Penh", otherZones: [], continent: "Asia", slug: "cambodia" },
  { name: "Iraq", iso: "IQ", capital: "Baghdad", lat: 33.3152, lng: 44.3661, mainZone: "Asia/Baghdad", otherZones: [], continent: "Asia", slug: "iraq" },
  { name: "Iran", iso: "IR", capital: "Tehran", lat: 35.6892, lng: 51.389, mainZone: "Asia/Tehran", otherZones: [], continent: "Asia", slug: "iran" },
  { name: "Jordan", iso: "JO", capital: "Amman", lat: 31.9454, lng: 35.9284, mainZone: "Asia/Amman", otherZones: [], continent: "Asia", slug: "jordan" },
  { name: "Kazakhstan", iso: "KZ", capital: "Astana", lat: 51.1694, lng: 71.4491, mainZone: "Asia/Almaty", otherZones: ["Asia/Aqtau", "Asia/Aqtobe", "Asia/Atyrau", "Asia/Oral", "Asia/Qyzylorda"], continent: "Asia", slug: "kazakhstan" },
  { name: "Kyrgyzstan", iso: "KG", capital: "Bishkek", lat: 42.8746, lng: 74.5698, mainZone: "Asia/Bishkek", otherZones: [], continent: "Asia", slug: "kyrgyzstan" },
  { name: "Laos", iso: "LA", capital: "Vientiane", lat: 17.9757, lng: 102.6331, mainZone: "Asia/Vientiane", otherZones: [], continent: "Asia", slug: "laos" },
  { name: "Lebanon", iso: "LB", capital: "Beirut", lat: 33.8938, lng: 35.5018, mainZone: "Asia/Beirut", otherZones: [], continent: "Asia", slug: "lebanon" },
  { name: "Maldives", iso: "MV", capital: "Male", lat: 4.1755, lng: 73.5093, mainZone: "Indian/Maldives", otherZones: [], continent: "Asia", slug: "maldives" },
  { name: "Mongolia", iso: "MN", capital: "Ulaanbaatar", lat: 47.8864, lng: 106.9057, mainZone: "Asia/Ulaanbaatar", otherZones: ["Asia/Hovd"], continent: "Asia", slug: "mongolia" },
  { name: "Myanmar", iso: "MM", capital: "Naypyidaw", lat: 19.7633, lng: 96.0785, mainZone: "Asia/Yangon", otherZones: [], continent: "Asia", slug: "myanmar" },
  { name: "North Korea", iso: "KP", capital: "Pyongyang", lat: 39.0392, lng: 125.7625, mainZone: "Asia/Pyongyang", otherZones: [], continent: "Asia", slug: "north-korea" },
  { name: "Syria", iso: "SY", capital: "Damascus", lat: 33.5138, lng: 36.2765, mainZone: "Asia/Damascus", otherZones: [], continent: "Asia", slug: "syria" },
  { name: "Tajikistan", iso: "TJ", capital: "Dushanbe", lat: 38.5598, lng: 68.787, mainZone: "Asia/Dushanbe", otherZones: [], continent: "Asia", slug: "tajikistan" },
  { name: "Timor-Leste", iso: "TL", capital: "Dili", lat: -8.5569, lng: 125.5603, mainZone: "Asia/Dili", otherZones: [], continent: "Asia", slug: "timor-leste" },
  { name: "Turkmenistan", iso: "TM", capital: "Ashgabat", lat: 37.9601, lng: 58.3261, mainZone: "Asia/Ashgabat", otherZones: [], continent: "Asia", slug: "turkmenistan" },
  { name: "Uzbekistan", iso: "UZ", capital: "Tashkent", lat: 41.2995, lng: 69.2401, mainZone: "Asia/Tashkent", otherZones: ["Asia/Samarkand"], continent: "Asia", slug: "uzbekistan" },
  { name: "Yemen", iso: "YE", capital: "Sanaa", lat: 15.3694, lng: 44.191, mainZone: "Asia/Aden", otherZones: [], continent: "Asia", slug: "yemen" },

  // Americas & Caribbean
  { name: "Antigua and Barbuda", iso: "AG", capital: "St. John's", lat: 17.1274, lng: -61.8468, mainZone: "America/Antigua", otherZones: [], continent: "North America", slug: "antigua-and-barbuda" },
  { name: "Bahamas", iso: "BS", capital: "Nassau", lat: 25.048, lng: -77.3554, mainZone: "America/Nassau", otherZones: [], continent: "North America", slug: "bahamas" },
  { name: "Barbados", iso: "BB", capital: "Bridgetown", lat: 13.1939, lng: -59.5432, mainZone: "America/Barbados", otherZones: [], continent: "North America", slug: "barbados" },
  { name: "Belize", iso: "BZ", capital: "Belmopan", lat: 17.251, lng: -88.759, mainZone: "America/Belize", otherZones: [], continent: "North America", slug: "belize" },
  { name: "Bolivia", iso: "BO", capital: "La Paz", lat: -16.5, lng: -68.15, mainZone: "America/La_Paz", otherZones: [], continent: "South America", slug: "bolivia" },
  { name: "Cuba", iso: "CU", capital: "Havana", lat: 23.1136, lng: -82.3666, mainZone: "America/Havana", otherZones: [], continent: "North America", slug: "cuba" },
  { name: "Dominica", iso: "DM", capital: "Roseau", lat: 15.3092, lng: -61.3794, mainZone: "America/Dominica", otherZones: [], continent: "North America", slug: "dominica" },
  { name: "Dominican Republic", iso: "DO", capital: "Santo Domingo", lat: 18.4861, lng: -69.9312, mainZone: "America/Santo_Domingo", otherZones: [], continent: "North America", slug: "dominican-republic" },
  { name: "Ecuador", iso: "EC", capital: "Quito", lat: -0.1807, lng: -78.4678, mainZone: "America/Guayaquil", otherZones: ["Pacific/Galapagos"], continent: "South America", slug: "ecuador" },
  { name: "El Salvador", iso: "SV", capital: "San Salvador", lat: 13.6929, lng: -89.2182, mainZone: "America/El_Salvador", otherZones: [], continent: "North America", slug: "el-salvador" },
  { name: "Grenada", iso: "GD", capital: "St. George's", lat: 12.0561, lng: -61.7488, mainZone: "America/Grenada", otherZones: [], continent: "North America", slug: "grenada" },
  { name: "Guatemala", iso: "GT", capital: "Guatemala City", lat: 14.6349, lng: -90.5069, mainZone: "America/Guatemala", otherZones: [], continent: "North America", slug: "guatemala" },
  { name: "Guyana", iso: "GY", capital: "Georgetown", lat: 6.8013, lng: -58.1551, mainZone: "America/Guyana", otherZones: [], continent: "South America", slug: "guyana" },
  { name: "Haiti", iso: "HT", capital: "Port-au-Prince", lat: 18.5944, lng: -72.3074, mainZone: "America/Port-au-Prince", otherZones: [], continent: "North America", slug: "haiti" },
  { name: "Honduras", iso: "HN", capital: "Tegucigalpa", lat: 14.0723, lng: -87.1921, mainZone: "America/Tegucigalpa", otherZones: [], continent: "North America", slug: "honduras" },
  { name: "Jamaica", iso: "JM", capital: "Kingston", lat: 17.9712, lng: -76.7936, mainZone: "America/Jamaica", otherZones: [], continent: "North America", slug: "jamaica" },
  { name: "Nicaragua", iso: "NI", capital: "Managua", lat: 12.115, lng: -86.2362, mainZone: "America/Managua", otherZones: [], continent: "North America", slug: "nicaragua" },
  { name: "Paraguay", iso: "PY", capital: "Asuncion", lat: -25.2637, lng: -57.5759, mainZone: "America/Asuncion", otherZones: [], continent: "South America", slug: "paraguay" },
  { name: "Puerto Rico", iso: "PR", capital: "San Juan", lat: 18.4655, lng: -66.1057, mainZone: "America/Puerto_Rico", otherZones: [], continent: "North America", slug: "puerto-rico" },
  { name: "Saint Kitts and Nevis", iso: "KN", capital: "Basseterre", lat: 17.3026, lng: -62.7177, mainZone: "America/St_Kitts", otherZones: [], continent: "North America", slug: "saint-kitts-and-nevis" },
  { name: "Saint Lucia", iso: "LC", capital: "Castries", lat: 14.0101, lng: -60.9875, mainZone: "America/St_Lucia", otherZones: [], continent: "North America", slug: "saint-lucia" },
  { name: "Saint Vincent and the Grenadines", iso: "VC", capital: "Kingstown", lat: 13.1601, lng: -61.2248, mainZone: "America/St_Vincent", otherZones: [], continent: "North America", slug: "saint-vincent-and-the-grenadines" },
  { name: "Suriname", iso: "SR", capital: "Paramaribo", lat: 5.852, lng: -55.2038, mainZone: "America/Paramaribo", otherZones: [], continent: "South America", slug: "suriname" },
  { name: "Trinidad and Tobago", iso: "TT", capital: "Port of Spain", lat: 10.6549, lng: -61.5019, mainZone: "America/Port_of_Spain", otherZones: [], continent: "North America", slug: "trinidad-and-tobago" },
  { name: "Uruguay", iso: "UY", capital: "Montevideo", lat: -34.9011, lng: -56.1645, mainZone: "America/Montevideo", otherZones: [], continent: "South America", slug: "uruguay" },
  { name: "Venezuela", iso: "VE", capital: "Caracas", lat: 10.4806, lng: -66.9036, mainZone: "America/Caracas", otherZones: [], continent: "South America", slug: "venezuela" },

  // Africa
  { name: "Algeria", iso: "DZ", capital: "Algiers", lat: 36.7538, lng: 3.0588, mainZone: "Africa/Algiers", otherZones: [], continent: "Africa", slug: "algeria" },
  { name: "Angola", iso: "AO", capital: "Luanda", lat: -8.839, lng: 13.2894, mainZone: "Africa/Luanda", otherZones: [], continent: "Africa", slug: "angola" },
  { name: "Benin", iso: "BJ", capital: "Porto-Novo", lat: 6.4969, lng: 2.6289, mainZone: "Africa/Porto-Novo", otherZones: [], continent: "Africa", slug: "benin" },
  { name: "Botswana", iso: "BW", capital: "Gaborone", lat: -24.6282, lng: 25.9231, mainZone: "Africa/Gaborone", otherZones: [], continent: "Africa", slug: "botswana" },
  { name: "Burkina Faso", iso: "BF", capital: "Ouagadougou", lat: 12.3714, lng: -1.5197, mainZone: "Africa/Ouagadougou", otherZones: [], continent: "Africa", slug: "burkina-faso" },
  { name: "Burundi", iso: "BI", capital: "Gitega", lat: -3.4264, lng: 29.9246, mainZone: "Africa/Bujumbura", otherZones: [], continent: "Africa", slug: "burundi" },
  { name: "Cameroon", iso: "CM", capital: "Yaounde", lat: 3.848, lng: 11.5021, mainZone: "Africa/Douala", otherZones: [], continent: "Africa", slug: "cameroon" },
  { name: "Cape Verde", iso: "CV", capital: "Praia", lat: 14.933, lng: -23.5133, mainZone: "Atlantic/Cape_Verde", otherZones: [], continent: "Africa", slug: "cape-verde" },
  { name: "Central African Republic", iso: "CF", capital: "Bangui", lat: 4.3947, lng: 18.5582, mainZone: "Africa/Bangui", otherZones: [], continent: "Africa", slug: "central-african-republic" },
  { name: "Chad", iso: "TD", capital: "N'Djamena", lat: 12.1348, lng: 15.0557, mainZone: "Africa/Ndjamena", otherZones: [], continent: "Africa", slug: "chad" },
  { name: "Comoros", iso: "KM", capital: "Moroni", lat: -11.7172, lng: 43.2473, mainZone: "Indian/Comoro", otherZones: [], continent: "Africa", slug: "comoros" },
  { name: "Congo", iso: "CG", capital: "Brazzaville", lat: -4.2634, lng: 15.2429, mainZone: "Africa/Brazzaville", otherZones: [], continent: "Africa", slug: "congo" },
  { name: "DR Congo", iso: "CD", capital: "Kinshasa", lat: -4.4419, lng: 15.2663, mainZone: "Africa/Kinshasa", otherZones: ["Africa/Lubumbashi"], continent: "Africa", slug: "dr-congo" },
  { name: "Djibouti", iso: "DJ", capital: "Djibouti", lat: 11.5721, lng: 43.1456, mainZone: "Africa/Djibouti", otherZones: [], continent: "Africa", slug: "djibouti" },
  { name: "Equatorial Guinea", iso: "GQ", capital: "Malabo", lat: 3.7504, lng: 8.7371, mainZone: "Africa/Malabo", otherZones: [], continent: "Africa", slug: "equatorial-guinea" },
  { name: "Eritrea", iso: "ER", capital: "Asmara", lat: 15.3229, lng: 38.9251, mainZone: "Africa/Asmara", otherZones: [], continent: "Africa", slug: "eritrea" },
  { name: "Eswatini", iso: "SZ", capital: "Mbabane", lat: -26.3055, lng: 31.1367, mainZone: "Africa/Mbabane", otherZones: [], continent: "Africa", slug: "eswatini" },
  { name: "Gabon", iso: "GA", capital: "Libreville", lat: 0.4162, lng: 9.4673, mainZone: "Africa/Libreville", otherZones: [], continent: "Africa", slug: "gabon" },
  { name: "Gambia", iso: "GM", capital: "Banjul", lat: 13.4549, lng: -16.579, mainZone: "Africa/Banjul", otherZones: [], continent: "Africa", slug: "gambia" },
  { name: "Guinea", iso: "GN", capital: "Conakry", lat: 9.6412, lng: -13.5784, mainZone: "Africa/Conakry", otherZones: [], continent: "Africa", slug: "guinea" },
  { name: "Guinea-Bissau", iso: "GW", capital: "Bissau", lat: 11.8632, lng: -15.5984, mainZone: "Africa/Bissau", otherZones: [], continent: "Africa", slug: "guinea-bissau" },
  { name: "Ivory Coast", iso: "CI", capital: "Yamoussoukro", lat: 6.8276, lng: -5.2893, mainZone: "Africa/Abidjan", otherZones: [], continent: "Africa", slug: "ivory-coast" },
  { name: "Lesotho", iso: "LS", capital: "Maseru", lat: -29.3151, lng: 27.4869, mainZone: "Africa/Maseru", otherZones: [], continent: "Africa", slug: "lesotho" },
  { name: "Liberia", iso: "LR", capital: "Monrovia", lat: 6.3156, lng: -10.8074, mainZone: "Africa/Monrovia", otherZones: [], continent: "Africa", slug: "liberia" },
  { name: "Libya", iso: "LY", capital: "Tripoli", lat: 32.8872, lng: 13.1913, mainZone: "Africa/Tripoli", otherZones: [], continent: "Africa", slug: "libya" },
  { name: "Madagascar", iso: "MG", capital: "Antananarivo", lat: -18.8792, lng: 47.5079, mainZone: "Indian/Antananarivo", otherZones: [], continent: "Africa", slug: "madagascar" },
  { name: "Malawi", iso: "MW", capital: "Lilongwe", lat: -13.9626, lng: 33.7741, mainZone: "Africa/Blantyre", otherZones: [], continent: "Africa", slug: "malawi" },
  { name: "Mali", iso: "ML", capital: "Bamako", lat: 12.6392, lng: -8.0029, mainZone: "Africa/Bamako", otherZones: [], continent: "Africa", slug: "mali" },
  { name: "Mauritania", iso: "MR", capital: "Nouakchott", lat: 18.0735, lng: -15.9582, mainZone: "Africa/Nouakchott", otherZones: [], continent: "Africa", slug: "mauritania" },
  { name: "Mauritius", iso: "MU", capital: "Port Louis", lat: -20.1609, lng: 57.5012, mainZone: "Indian/Mauritius", otherZones: [], continent: "Africa", slug: "mauritius" },
  { name: "Mozambique", iso: "MZ", capital: "Maputo", lat: -25.9692, lng: 32.5732, mainZone: "Africa/Maputo", otherZones: [], continent: "Africa", slug: "mozambique" },
  { name: "Namibia", iso: "NA", capital: "Windhoek", lat: -22.5609, lng: 17.0658, mainZone: "Africa/Windhoek", otherZones: [], continent: "Africa", slug: "namibia" },
  { name: "Niger", iso: "NE", capital: "Niamey", lat: 13.5116, lng: 2.1254, mainZone: "Africa/Niamey", otherZones: [], continent: "Africa", slug: "niger" },
  { name: "Rwanda", iso: "RW", capital: "Kigali", lat: -1.9706, lng: 30.1044, mainZone: "Africa/Kigali", otherZones: [], continent: "Africa", slug: "rwanda" },
  { name: "Sao Tome and Principe", iso: "ST", capital: "Sao Tome", lat: 0.3365, lng: 6.7273, mainZone: "Africa/Sao_Tome", otherZones: [], continent: "Africa", slug: "sao-tome-and-principe" },
  { name: "Senegal", iso: "SN", capital: "Dakar", lat: 14.7167, lng: -17.4677, mainZone: "Africa/Dakar", otherZones: [], continent: "Africa", slug: "senegal" },
  { name: "Seychelles", iso: "SC", capital: "Victoria", lat: -4.6191, lng: 55.4513, mainZone: "Indian/Mahe", otherZones: [], continent: "Africa", slug: "seychelles" },
  { name: "Sierra Leone", iso: "SL", capital: "Freetown", lat: 8.484, lng: -13.2299, mainZone: "Africa/Freetown", otherZones: [], continent: "Africa", slug: "sierra-leone" },
  { name: "Somalia", iso: "SO", capital: "Mogadishu", lat: 2.0469, lng: 45.3182, mainZone: "Africa/Mogadishu", otherZones: [], continent: "Africa", slug: "somalia" },
  { name: "South Sudan", iso: "SS", capital: "Juba", lat: 4.8594, lng: 31.5713, mainZone: "Africa/Juba", otherZones: [], continent: "Africa", slug: "south-sudan" },
  { name: "Sudan", iso: "SD", capital: "Khartoum", lat: 15.5007, lng: 32.5599, mainZone: "Africa/Khartoum", otherZones: [], continent: "Africa", slug: "sudan" },
  { name: "Tanzania", iso: "TZ", capital: "Dodoma", lat: -6.163, lng: 35.7516, mainZone: "Africa/Dar_es_Salaam", otherZones: [], continent: "Africa", slug: "tanzania" },
  { name: "Togo", iso: "TG", capital: "Lome", lat: 6.1287, lng: 1.2158, mainZone: "Africa/Lome", otherZones: [], continent: "Africa", slug: "togo" },
  { name: "Tunisia", iso: "TN", capital: "Tunis", lat: 36.8065, lng: 10.1815, mainZone: "Africa/Tunis", otherZones: [], continent: "Africa", slug: "tunisia" },
  { name: "Uganda", iso: "UG", capital: "Kampala", lat: 0.3476, lng: 32.5825, mainZone: "Africa/Kampala", otherZones: [], continent: "Africa", slug: "uganda" },
  { name: "Zambia", iso: "ZM", capital: "Lusaka", lat: -15.3875, lng: 28.3228, mainZone: "Africa/Lusaka", otherZones: [], continent: "Africa", slug: "zambia" },
  { name: "Zimbabwe", iso: "ZW", capital: "Harare", lat: -17.8252, lng: 31.0335, mainZone: "Africa/Harare", otherZones: [], continent: "Africa", slug: "zimbabwe" },

  // Oceania
  { name: "Fiji", iso: "FJ", capital: "Suva", lat: -18.1248, lng: 178.4501, mainZone: "Pacific/Fiji", otherZones: [], continent: "Oceania", slug: "fiji" },
  { name: "Kiribati", iso: "KI", capital: "Tarawa", lat: 1.4518, lng: 172.9716, mainZone: "Pacific/Tarawa", otherZones: ["Pacific/Kanton", "Pacific/Kiritimati"], continent: "Oceania", slug: "kiribati" },
  { name: "Marshall Islands", iso: "MH", capital: "Majuro", lat: 7.1315, lng: 171.1845, mainZone: "Pacific/Majuro", otherZones: ["Pacific/Kwajalein"], continent: "Oceania", slug: "marshall-islands" },
  { name: "Micronesia", iso: "FM", capital: "Palikir", lat: 6.9248, lng: 158.1611, mainZone: "Pacific/Pohnpei", otherZones: ["Pacific/Chuuk", "Pacific/Kosrae"], continent: "Oceania", slug: "micronesia" },
  { name: "Nauru", iso: "NR", capital: "Yaren", lat: -0.5477, lng: 166.9209, mainZone: "Pacific/Nauru", otherZones: [], continent: "Oceania", slug: "nauru" },
  { name: "Palau", iso: "PW", capital: "Ngerulmud", lat: 7.5004, lng: 134.6243, mainZone: "Pacific/Palau", otherZones: [], continent: "Oceania", slug: "palau" },
  { name: "Papua New Guinea", iso: "PG", capital: "Port Moresby", lat: -9.4438, lng: 147.1803, mainZone: "Pacific/Port_Moresby", otherZones: ["Pacific/Bougainville"], continent: "Oceania", slug: "papua-new-guinea" },
  { name: "Samoa", iso: "WS", capital: "Apia", lat: -13.8333, lng: -171.7667, mainZone: "Pacific/Apia", otherZones: [], continent: "Oceania", slug: "samoa" },
  { name: "Solomon Islands", iso: "SB", capital: "Honiara", lat: -9.4456, lng: 159.9729, mainZone: "Pacific/Guadalcanal", otherZones: [], continent: "Oceania", slug: "solomon-islands" },
  { name: "Tonga", iso: "TO", capital: "Nuku'alofa", lat: -21.1393, lng: -175.2018, mainZone: "Pacific/Tongatapu", otherZones: [], continent: "Oceania", slug: "tonga" },
  { name: "Tuvalu", iso: "TV", capital: "Funafuti", lat: -8.5211, lng: 179.1962, mainZone: "Pacific/Funafuti", otherZones: [], continent: "Oceania", slug: "tuvalu" },
  { name: "Vanuatu", iso: "VU", capital: "Port Vila", lat: -17.7333, lng: 168.3273, mainZone: "Pacific/Efate", otherZones: [], continent: "Oceania", slug: "vanuatu" },
];

let addedCount = 0;
for (const country of additionalCountries) {
  if (!existingSlugs.has(country.slug.toLowerCase()) && !existingIsos.has(country.iso.toUpperCase())) {
    currentCountries.push(country);
    existingSlugs.add(country.slug.toLowerCase());
    existingIsos.add(country.iso.toUpperCase());
    addedCount++;
  }
}

// Sort alphabetically by country name
currentCountries.sort((a, b) => a.name.localeCompare(b.name));

fs.writeFileSync(countriesPath, JSON.stringify(currentCountries, null, 2), "utf-8");
console.log(`Added ${addedCount} countries. Total countries now: ${currentCountries.length}`);
