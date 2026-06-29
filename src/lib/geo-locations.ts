import { cubaLocations } from "@/lib/cuba-locations";

export type MarketRegion = {
  name: string;
  localities: string[];
};

export type MarketCountry = {
  code: string;
  name: string;
  regionLabel: string;
  localityLabel: string;
  regions: MarketRegion[];
};

const usaRegions: MarketRegion[] = [
  { name: "Alabama", localities: ["Birmingham", "Montgomery", "Mobile", "Huntsville"] },
  { name: "Alaska", localities: ["Anchorage", "Fairbanks", "Juneau"] },
  { name: "Arizona", localities: ["Phoenix", "Tucson", "Mesa", "Scottsdale"] },
  { name: "Arkansas", localities: ["Little Rock", "Fort Smith", "Fayetteville"] },
  { name: "California", localities: ["Los Angeles", "San Diego", "San Francisco", "San Jose", "Sacramento", "Fresno"] },
  { name: "Colorado", localities: ["Denver", "Colorado Springs", "Aurora", "Boulder"] },
  { name: "Connecticut", localities: ["Bridgeport", "Hartford", "New Haven", "Stamford"] },
  { name: "Delaware", localities: ["Wilmington", "Dover", "Newark"] },
  { name: "Florida", localities: ["Miami", "Hialeah", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale", "Naples"] },
  { name: "Georgia", localities: ["Atlanta", "Savannah", "Augusta", "Columbus"] },
  { name: "Hawaii", localities: ["Honolulu", "Hilo", "Kailua"] },
  { name: "Idaho", localities: ["Boise", "Meridian", "Idaho Falls"] },
  { name: "Illinois", localities: ["Chicago", "Aurora", "Naperville", "Springfield"] },
  { name: "Indiana", localities: ["Indianapolis", "Fort Wayne", "Evansville"] },
  { name: "Iowa", localities: ["Des Moines", "Cedar Rapids", "Davenport"] },
  { name: "Kansas", localities: ["Wichita", "Overland Park", "Kansas City"] },
  { name: "Kentucky", localities: ["Louisville", "Lexington", "Bowling Green"] },
  { name: "Louisiana", localities: ["New Orleans", "Baton Rouge", "Lafayette", "Shreveport"] },
  { name: "Maine", localities: ["Portland", "Lewiston", "Bangor"] },
  { name: "Maryland", localities: ["Baltimore", "Rockville", "Silver Spring", "Frederick"] },
  { name: "Massachusetts", localities: ["Boston", "Worcester", "Springfield", "Cambridge"] },
  { name: "Michigan", localities: ["Detroit", "Grand Rapids", "Warren", "Ann Arbor"] },
  { name: "Minnesota", localities: ["Minneapolis", "Saint Paul", "Rochester"] },
  { name: "Mississippi", localities: ["Jackson", "Gulfport", "Southaven"] },
  { name: "Missouri", localities: ["Kansas City", "Saint Louis", "Springfield", "Columbia"] },
  { name: "Montana", localities: ["Billings", "Missoula", "Bozeman"] },
  { name: "Nebraska", localities: ["Omaha", "Lincoln", "Bellevue"] },
  { name: "Nevada", localities: ["Las Vegas", "Henderson", "Reno"] },
  { name: "New Hampshire", localities: ["Manchester", "Nashua", "Concord"] },
  { name: "New Jersey", localities: ["Newark", "Jersey City", "Paterson", "Elizabeth"] },
  { name: "New Mexico", localities: ["Albuquerque", "Santa Fe", "Las Cruces"] },
  { name: "New York", localities: ["New York City", "Buffalo", "Rochester", "Albany", "Yonkers"] },
  { name: "North Carolina", localities: ["Charlotte", "Raleigh", "Greensboro", "Durham"] },
  { name: "North Dakota", localities: ["Fargo", "Bismarck", "Grand Forks"] },
  { name: "Ohio", localities: ["Columbus", "Cleveland", "Cincinnati", "Toledo"] },
  { name: "Oklahoma", localities: ["Oklahoma City", "Tulsa", "Norman"] },
  { name: "Oregon", localities: ["Portland", "Eugene", "Salem"] },
  { name: "Pennsylvania", localities: ["Philadelphia", "Pittsburgh", "Allentown", "Harrisburg"] },
  { name: "Rhode Island", localities: ["Providence", "Warwick", "Cranston"] },
  { name: "South Carolina", localities: ["Charleston", "Columbia", "Greenville"] },
  { name: "South Dakota", localities: ["Sioux Falls", "Rapid City", "Aberdeen"] },
  { name: "Tennessee", localities: ["Nashville", "Memphis", "Knoxville", "Chattanooga"] },
  { name: "Texas", localities: ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth", "El Paso"] },
  { name: "Utah", localities: ["Salt Lake City", "Provo", "Ogden"] },
  { name: "Vermont", localities: ["Burlington", "Montpelier", "Rutland"] },
  { name: "Virginia", localities: ["Virginia Beach", "Richmond", "Norfolk", "Alexandria"] },
  { name: "Washington", localities: ["Seattle", "Spokane", "Tacoma", "Bellevue"] },
  { name: "West Virginia", localities: ["Charleston", "Huntington", "Morgantown"] },
  { name: "Wisconsin", localities: ["Milwaukee", "Madison", "Green Bay"] },
  { name: "Wyoming", localities: ["Cheyenne", "Casper", "Laramie"] }
];

export const marketCountries: MarketCountry[] = [
  {
    code: "CU",
    name: "Cuba",
    regionLabel: "Provincia",
    localityLabel: "Municipio",
    regions: cubaLocations.map((location) => ({
      name: location.province,
      localities: location.municipalities
    }))
  },
  {
    code: "US",
    name: "Estados Unidos",
    regionLabel: "Estado",
    localityLabel: "Ciudad",
    regions: usaRegions
  }
];

export function getMarketCountry(countryName?: string) {
  return marketCountries.find((country) => country.name === countryName) ?? marketCountries[0];
}

export function getRegionsForCountry(countryName?: string) {
  return getMarketCountry(countryName).regions.map((region) => region.name);
}

export function getLocalitiesForRegion(countryName: string | undefined, regionName: string) {
  return getMarketCountry(countryName).regions.find((region) => region.name === regionName)?.localities ?? [];
}
