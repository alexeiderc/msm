export const atmStatuses = {
  activo: "Activo",
  mantenimiento: "Mantenimiento",
  fuera_servicio: "Fuera de servicio"
} as const;

export const atmReservationStatuses = [
  "pendiente_pago",
  "pago_confirmado",
  "reservado",
  "listo_para_retirar",
  "entregado",
  "expirado",
  "cancelado"
] as const;

export const demoAtmMachines = [
  {
    id: "ATM-SCU-SF-001",
    name: "Cajero MSM Digital Segundo Frente",
    province: "Santiago de Cuba",
    municipality: "Segundo Frente",
    zone: "Mayari Arriba y Segundo Frente",
    status: "activo",
    lastSync: "Demo local",
    dailyLimit: 2500,
    technician: "Equipo MSM",
    currencies: [
      { currency: "USD", availability: "Reserva por confirmacion", amountLabel: "Liquidez demo" },
      { currency: "CUP", availability: "Bajo gestion", amountLabel: "Segun zona" },
      { currency: "MLC", availability: "Transferencia coordinada", amountLabel: "Digital" }
    ]
  },
  {
    id: "ATM-HAB-MIR-001",
    name: "Cajero MSM Digital Habana",
    province: "La Habana",
    municipality: "Miramar",
    zone: "Habana oeste",
    status: "mantenimiento",
    lastSync: "Demo local",
    dailyLimit: 5000,
    technician: "Equipo MSM",
    currencies: [
      { currency: "USD", availability: "Pausado", amountLabel: "Mantenimiento" },
      { currency: "CUP", availability: "Pausado", amountLabel: "Mantenimiento" }
    ]
  }
];

export const demoWallet = {
  owner: "Cliente demo MSM",
  status: "Activa en modo prueba",
  balances: [
    { currency: "USD", label: "Saldo reservado", amount: 0 },
    { currency: "CUP", label: "Credito interno demo", amount: 0 },
    { currency: "MSM", label: "Puntos/confianza futura", amount: 0 }
  ],
  transactions: [
    {
      id: "WALLET-DEMO-001",
      type: "Reserva futura",
      status: "Preparada",
      detail: "Reserva de efectivo con QR temporal para Cajeros MSM Digital."
    },
    {
      id: "WALLET-DEMO-002",
      type: "Pago manual",
      status: "Conectado al ledger",
      detail: "Los pagos aprobados por Economia alimentaran saldo, ledger y auditoria."
    }
  ]
};

export const demoExchangePairs = [
  {
    from: "USD efectivo",
    to: "CUP efectivo",
    status: "Cotizacion bajo confirmacion MSM",
    route: "VIP o Cajero MSM disponible por zona"
  },
  {
    from: "Zelle",
    to: "CUP transferencia",
    status: "Cotizacion bajo confirmacion MSM",
    route: "Cuenta rotativa + entrega VIP"
  },
  {
    from: "USDT BEP20",
    to: "USD/CUP segun zona",
    status: "Revision economica obligatoria",
    route: "Pago manual + antifraude"
  }
];
