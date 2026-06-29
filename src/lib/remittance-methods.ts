export type SeedRemittanceMethod = {
  id: string;
  name: string;
  country: string;
  currency: string;
  type: string;
  priority: number;
};

const baseId = "00000000-0000-4000-8000-000000000";

export const seedRemittanceMethods: SeedRemittanceMethod[] = [
  { id: `${baseId}801`, name: "Tropical", country: "Cuba", currency: "CUP", type: "Tropical", priority: 1 },
  { id: `${baseId}802`, name: "Clasica", country: "Cuba", currency: "CUP", type: "Clasica", priority: 2 },
  { id: `${baseId}803`, name: "USD", country: "Estados Unidos", currency: "USD", type: "USD", priority: 3 },
  { id: `${baseId}804`, name: "Zelle", country: "Estados Unidos", currency: "USD", type: "Zelle", priority: 4 },
  { id: `${baseId}805`, name: "Cash App", country: "Estados Unidos", currency: "USD", type: "Cash App", priority: 5 },
  { id: `${baseId}806`, name: "Venmo", country: "Estados Unidos", currency: "USD", type: "Venmo", priority: 6 },
  { id: `${baseId}807`, name: "Euro", country: "Europa", currency: "EUR", type: "Euro", priority: 7 },
  { id: `${baseId}808`, name: "IBAN", country: "Europa", currency: "EUR", type: "IBAN", priority: 8 },
  { id: `${baseId}809`, name: "Bizum", country: "Espana", currency: "EUR", type: "Bizum", priority: 9 },
  { id: `${baseId}810`, name: "Tropipay", country: "Global", currency: "USD", type: "Tropipay", priority: 10 },
  { id: `${baseId}811`, name: "PayPal EUR", country: "Europa", currency: "EUR", type: "PayPal EUR", priority: 11 },
  { id: `${baseId}812`, name: "PayPal USA", country: "Estados Unidos", currency: "USD", type: "PayPal USA", priority: 12 },
  { id: `${baseId}813`, name: "Postepay", country: "Italia", currency: "EUR", type: "Postepay", priority: 13 },
  { id: `${baseId}814`, name: "USDT BEP20", country: "Global", currency: "USDT", type: "USDT BEP20", priority: 14 },
  { id: `${baseId}815`, name: "Canada", country: "Canada", currency: "CAD", type: "Canada", priority: 15 },
  { id: `${baseId}816`, name: "Mexico", country: "Mexico", currency: "MXN", type: "Mexico", priority: 16 },
  { id: `${baseId}817`, name: "Ecuador", country: "Ecuador", currency: "USD", type: "Ecuador", priority: 17 },
  { id: `${baseId}818`, name: "Brasil", country: "Brasil", currency: "BRL", type: "Brasil", priority: 18 },
  { id: `${baseId}819`, name: "Rublos", country: "Rusia", currency: "RUB", type: "Rublos", priority: 19 },
  { id: `${baseId}820`, name: "Republica Dominicana", country: "Republica Dominicana", currency: "DOP", type: "Republica Dominicana", priority: 20 },
  { id: `${baseId}821`, name: "Panama", country: "Panama", currency: "USD", type: "Panama", priority: 21 },
  { id: `${baseId}822`, name: "Colombia", country: "Colombia", currency: "COP", type: "Colombia", priority: 22 },
  { id: `${baseId}823`, name: "Portugal", country: "Portugal", currency: "EUR", type: "Portugal", priority: 23 },
  { id: `${baseId}824`, name: "Dubai", country: "Emiratos Arabes Unidos", currency: "AED", type: "Dubai", priority: 24 },
  { id: `${baseId}825`, name: "Soles", country: "Peru", currency: "PEN", type: "Soles", priority: 25 },
  { id: `${baseId}826`, name: "Dolar en Peru", country: "Peru", currency: "USD", type: "Dolar en Peru", priority: 26 },
  { id: `${baseId}827`, name: "China", country: "China", currency: "CNY", type: "China", priority: 27 },
  { id: `${baseId}828`, name: "Serbia", country: "Serbia", currency: "RSD", type: "Serbia", priority: 28 },
  { id: `${baseId}829`, name: "Venezuela", country: "Venezuela", currency: "VES", type: "Venezuela", priority: 29 },
  { id: `${baseId}830`, name: "Bolivia", country: "Bolivia", currency: "BOB", type: "Bolivia", priority: 30 },
  { id: `${baseId}831`, name: "Argentina", country: "Argentina", currency: "ARS", type: "Argentina", priority: 31 },
  { id: `${baseId}832`, name: "Chile", country: "Chile", currency: "CLP", type: "Chile", priority: 32 },
  { id: `${baseId}833`, name: "Dolar Nicaragua", country: "Nicaragua", currency: "USD", type: "Dolar Nicaragua", priority: 33 },
  { id: `${baseId}834`, name: "Pesos uruguayos", country: "Uruguay", currency: "UYU", type: "Pesos uruguayos", priority: 34 },
  { id: `${baseId}835`, name: "Dolar Uruguay", country: "Uruguay", currency: "USD", type: "Dolar Uruguay", priority: 35 },
  { id: `${baseId}836`, name: "Paraguay", country: "Paraguay", currency: "PYG", type: "Paraguay", priority: 36 },
  { id: `${baseId}837`, name: "Guyana", country: "Guyana", currency: "GYD", type: "Guyana", priority: 37 },
  { id: `${baseId}838`, name: "Suriname", country: "Suriname", currency: "SRD", type: "Suriname", priority: 38 },
  { id: `${baseId}839`, name: "Costa Rica", country: "Costa Rica", currency: "CRC", type: "Costa Rica", priority: 39 },
  { id: `${baseId}840`, name: "Puerto Rico PayPal", country: "Puerto Rico", currency: "USD", type: "Puerto Rico PayPal", priority: 40 }
];

export const receiveMethods = [
  { value: "usd_efectivo", label: "USD efectivo", currency: "USD" },
  { value: "cup_efectivo", label: "CUP efectivo", currency: "CUP" },
  { value: "cup_transferencia", label: "CUP transferencia", currency: "CUP" },
  { value: "mlc_clasica", label: "MLC clasica", currency: "MLC" },
  { value: "mlc_tropical", label: "MLC tropical", currency: "MLC" }
] as const;
