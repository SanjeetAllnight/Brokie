/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "on-surface-variant": "#544246",
        "secondary-fixed": "#e8ddff",
        "surface-dim": "#dbdad8",
        "error": "#ba1a1a",
        "primary-container": "#f27fa0",
        "on-secondary-fixed-variant": "#4c3c7d",
        "background": "#fbf9f7",
        "on-primary-fixed": "#3f001a",
        "secondary-fixed-dim": "#cebdff",
        "on-primary": "#ffffff",
        "surface-container": "#efedec",
        "tertiary-container": "#ab9eb6",
        "secondary-container": "#c6b3fe",
        "on-tertiary-fixed": "#20182a",
        "on-primary-fixed-variant": "#7f2444",
        "inverse-surface": "#30302f",
        "on-error-container": "#93000a",
        "inverse-primary": "#ffb1c4",
        "error-container": "#ffdad6",
        "outline-variant": "#dac0c5",
        "on-secondary": "#ffffff",
        "on-secondary-fixed": "#200c4f",
        "on-background": "#1b1c1b",
        "surface": "#fbf9f7",
        "tertiary-fixed": "#ecddf7",
        "outline": "#877276",
        "surface-container-highest": "#e4e2e0",
        "surface-container-low": "#f5f3f1",
        "on-tertiary-fixed-variant": "#4d4357",
        "surface-bright": "#fbf9f7",
        "on-error": "#ffffff",
        "surface-container-high": "#e9e8e6",
        "surface-tint": "#9e3c5c",
        "on-tertiary-container": "#3f3549",
        "on-secondary-container": "#524284",
        "tertiary-fixed-dim": "#d0c1db",
        "inverse-on-surface": "#f2f0ee",
        "primary-fixed-dim": "#ffb1c4",
        "secondary": "#645497",
        "on-tertiary": "#ffffff",
        "on-primary-container": "#6e1637",
        "on-surface": "#1b1c1b",
        "surface-container-lowest": "#ffffff",
        "tertiary": "#655a70",
        "primary": "#9e3c5c",
        "primary-fixed": "#ffd9e0",
        "surface-variant": "#e4e2e0"
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
      spacing: {
        "container-padding": "24px",
        "base": "8px",
        "card-inner": "20px",
        "stack-gap": "16px",
        "margin-mobile": "16px"
      },
      fontFamily: {
        "body-md": ["Plus Jakarta Sans"],
        "body-lg": ["Plus Jakarta Sans"],
        "headline-lg": ["Plus Jakarta Sans"],
        "label-caps": ["Plus Jakarta Sans"],
        "display-currency": ["Plus Jakarta Sans"],
        "headline-md": ["Plus Jakarta Sans"]
      },
      fontSize: {
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "500" }],
        "headline-lg": ["32px", { "lineHeight": "40px", "fontWeight": "700" }],
        "label-caps": ["12px", { "lineHeight": "16px", "letterSpacing": "0.1em", "fontWeight": "800" }],
        "display-currency": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "800" }],
        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "700" }]
      }
    }
  },
  plugins: [],
}
