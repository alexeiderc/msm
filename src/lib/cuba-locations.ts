export type CubaLocation = {
  province: string;
  municipalities: string[];
};

export const cubaLocations: CubaLocation[] = [
  {
    province: "Pinar del Rio",
    municipalities: [
      "Consolacion del Sur",
      "Guane",
      "La Palma",
      "Los Palacios",
      "Mantua",
      "Minas de Matahambre",
      "Pinar del Rio",
      "San Juan y Martinez",
      "San Luis",
      "Sandino",
      "Vinales"
    ]
  },
  {
    province: "Artemisa",
    municipalities: [
      "Alquizar",
      "Artemisa",
      "Bahia Honda",
      "Bauta",
      "Caimito",
      "Candelaria",
      "Guanajay",
      "Guira de Melena",
      "Mariel",
      "San Antonio de los Banos",
      "San Cristobal"
    ]
  },
  {
    province: "La Habana",
    municipalities: [
      "Arroyo Naranjo",
      "Boyeros",
      "Centro Habana",
      "Cerro",
      "Cotorro",
      "Diez de Octubre",
      "Guanabacoa",
      "Habana del Este",
      "Habana Vieja",
      "La Lisa",
      "Marianao",
      "Playa",
      "Plaza de la Revolucion",
      "Regla",
      "San Miguel del Padron"
    ]
  },
  {
    province: "Mayabeque",
    municipalities: [
      "Batabano",
      "Bejucal",
      "Guines",
      "Jaruco",
      "Madruga",
      "Melena del Sur",
      "Nueva Paz",
      "Quivican",
      "San Jose de las Lajas",
      "San Nicolas",
      "Santa Cruz del Norte"
    ]
  },
  {
    province: "Matanzas",
    municipalities: [
      "Calimete",
      "Cardenas",
      "Cienaga de Zapata",
      "Colon",
      "Jaguey Grande",
      "Jovellanos",
      "Limonar",
      "Los Arabos",
      "Marti",
      "Matanzas",
      "Pedro Betancourt",
      "Perico",
      "Union de Reyes"
    ]
  },
  {
    province: "Villa Clara",
    municipalities: [
      "Caibarien",
      "Camajuani",
      "Cifuentes",
      "Corralillo",
      "Encrucijada",
      "Manicaragua",
      "Placetas",
      "Quemado de Guines",
      "Ranchuelo",
      "Remedios",
      "Sagua la Grande",
      "Santa Clara",
      "Santo Domingo"
    ]
  },
  {
    province: "Cienfuegos",
    municipalities: [
      "Abreus",
      "Aguada de Pasajeros",
      "Cienfuegos",
      "Cruces",
      "Cumanayagua",
      "Lajas",
      "Palmira",
      "Rodas"
    ]
  },
  {
    province: "Sancti Spiritus",
    municipalities: [
      "Cabaiguan",
      "Fomento",
      "Jatibonico",
      "La Sierpe",
      "Sancti Spiritus",
      "Taguasco",
      "Trinidad",
      "Yaguajay"
    ]
  },
  {
    province: "Ciego de Avila",
    municipalities: [
      "Baragua",
      "Bolivia",
      "Chambas",
      "Ciego de Avila",
      "Ciro Redondo",
      "Florencia",
      "Majagua",
      "Moron",
      "Primero de Enero",
      "Venezuela"
    ]
  },
  {
    province: "Camaguey",
    municipalities: [
      "Camaguey",
      "Carlos Manuel de Cespedes",
      "Esmeralda",
      "Florida",
      "Guaimaro",
      "Jimaguayu",
      "Minas",
      "Najasa",
      "Nuevitas",
      "Santa Cruz del Sur",
      "Sibanicu",
      "Sierra de Cubitas",
      "Vertientes"
    ]
  },
  {
    province: "Las Tunas",
    municipalities: [
      "Amancio",
      "Colombia",
      "Jesus Menendez",
      "Jobabo",
      "Las Tunas",
      "Majibacoa",
      "Manati",
      "Puerto Padre"
    ]
  },
  {
    province: "Holguin",
    municipalities: [
      "Antilla",
      "Baguanos",
      "Banes",
      "Cacocum",
      "Calixto Garcia",
      "Cueto",
      "Frank Pais",
      "Gibara",
      "Holguin",
      "Mayari",
      "Moa",
      "Rafael Freyre",
      "Sagua de Tanamo",
      "Urbano Noris"
    ]
  },
  {
    province: "Granma",
    municipalities: [
      "Bartolome Maso",
      "Bayamo",
      "Buey Arriba",
      "Campechuela",
      "Cauto Cristo",
      "Guisa",
      "Jiguani",
      "Manzanillo",
      "Media Luna",
      "Niquero",
      "Pilon",
      "Rio Cauto",
      "Yara"
    ]
  },
  {
    province: "Santiago de Cuba",
    municipalities: [
      "Contramaestre",
      "Guama",
      "Mella",
      "Palma Soriano",
      "San Luis",
      "Santiago de Cuba",
      "Segundo Frente",
      "Songo-La Maya",
      "Tercer Frente"
    ]
  },
  {
    province: "Guantanamo",
    municipalities: [
      "Baracoa",
      "Caimanera",
      "El Salvador",
      "Guantanamo",
      "Imias",
      "Maisi",
      "Manuel Tames",
      "Niceto Perez",
      "San Antonio del Sur",
      "Yateras"
    ]
  },
  {
    province: "Isla de la Juventud",
    municipalities: ["Isla de la Juventud"]
  }
];

export const cubaProvinces = cubaLocations.map((location) => location.province);

export function getMunicipalitiesForProvince(province: string) {
  return cubaLocations.find((location) => location.province === province)?.municipalities ?? [];
}

function demoUuidFromNumber(value: number) {
  return `00000000-0000-4000-8000-${String(value).padStart(12, "0")}`;
}

export function demoProvinceId(province: string) {
  const index = Math.max(cubaLocations.findIndex((location) => location.province === province), 0);
  return demoUuidFromNumber(700000000000 + index + 1);
}

export function demoMunicipalityId(province: string, municipality: string) {
  const provinceIndex = Math.max(cubaLocations.findIndex((location) => location.province === province), 0);
  const municipalityIndex = Math.max(getMunicipalitiesForProvince(province).indexOf(municipality), 0);
  return demoUuidFromNumber(800000000000 + provinceIndex * 100 + municipalityIndex + 1);
}
