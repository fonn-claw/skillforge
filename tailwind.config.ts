import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "void-black": "#0A0E17",
        "forge-gray": "#151A28",
        "anvil-gray": "#1E2438",
        "steel-edge": "#2A3150",
        "arcane-blue": "#4A7CFF",
        "ember-gold": "#F0A830",
        "forge-fire": "#FF6B35",
        moonlight: "#E8ECF4",
        mist: "#8892A8",
        verdant: "#34D399",
        "amber-glow": "#FBBF24",
        "blood-ruby": "#EF4444",
        "mastery-novice": "rgba(74, 124, 255, 0.4)",
        "mastery-apprentice": "#4A7CFF",
        "mastery-journeyman": "#14B8A6",
        "mastery-expert": "#F0A830",
        "mastery-master": "#FFF7DB",
        "archetype-builder": "#FF6B35",
        "archetype-analyst": "#38BDF8",
        "archetype-explorer": "#34D399",
        "archetype-collaborator": "#A78BFA",
      },
      fontFamily: {
        heading: ["var(--font-cinzel)", "serif"],
        body: ["var(--font-ibm-plex-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
