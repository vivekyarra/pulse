export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        pulse: {
          ink: "#0f172a",
          muted: "#64748b",
          paper: "#f8fafc",
          accent: "#1e40af",
          green: "#22c55e",
          amber: "#eab308",
          orange: "#f97316",
          red: "#ef4444",
        },
      },
      boxShadow: {
        clinical: "0 18px 60px rgba(15, 23, 42, 0.08)",
        panel: "0 12px 36px rgba(15, 23, 42, 0.06)",
      },
      gridTemplateColumns: {
        31: "repeat(31, minmax(0, 1fr))",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-12%)", opacity: "0" },
          "8%": { opacity: "1" },
          "92%": { opacity: "1" },
          "100%": { transform: "translateY(112%)", opacity: "0" },
        },
        pulseSoft: {
          "0%, 100%": { filter: "drop-shadow(0 0 0 rgba(34, 197, 94, 0.0))", transform: "scale(1)" },
          "50%": { filter: "drop-shadow(0 0 16px rgba(34, 197, 94, 0.38))", transform: "scale(1.025)" },
        },
        pulseUrgent: {
          "0%, 100%": { filter: "drop-shadow(0 0 0 rgba(239, 68, 68, 0.0))", opacity: "0.86" },
          "50%": { filter: "drop-shadow(0 0 18px rgba(239, 68, 68, 0.48))", opacity: "1" },
        },
        drip: {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "15%": { opacity: "1" },
          "100%": { transform: "translateY(34px)", opacity: "0" },
        },
      },
      animation: {
        scan: "scan 2.3s ease-in-out infinite",
        pulseSoft: "pulseSoft 2.8s ease-in-out infinite",
        pulseUrgent: "pulseUrgent 2.1s ease-in-out infinite",
        drip: "drip 1.7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
