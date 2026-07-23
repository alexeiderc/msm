export const msmDesignSystem = {
  colors: {
    ink: "#14171A",
    midnight: "#07111E",
    navy: "#0C3F6A",
    blue: "#197BD2",
    electric: "#35A8FF",
    gray: "#657786",
    line: "#E6E7E8",
    cloud: "#F7F9FB",
    white: "#FFFFFF"
  },
  radius: {
    control: "6px",
    card: "8px",
    modal: "8px"
  },
  shadows: {
    card: "0 14px 34px rgba(7,17,30,0.08)",
    lift: "0 22px 48px rgba(25,123,210,0.16)",
    glow: "0 14px 34px rgba(25,123,210,0.24)"
  },
  navigation: {
    mobileBottom: ["Inicio", "Productos", "Remesas", "Cajeros"],
    publicTop: ["Productos", "Remesas", "Cajeros", "Billetera"]
  }
} as const;
