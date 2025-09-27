/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html","./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                brand: {
                    ink: "#302F4D",
                    sun: "#FFD639",   // medium priority
                    blush: "#FF99A7", // high priority
                    sky: "#0092E0",
                    leaf: "#00AF54"   // low priority
                }
            },
            fontFamily: {
                heading: ['"Archivo Black"','system-ui','sans-serif'],
                body: ['Roboto','system-ui','sans-serif']
            },
            borderRadius: { card: "20px" },
            boxShadow: { soft: "0 6px 24px rgba(0,0,0,.08)" },
            keyframes: {
                fadeUp: { "0%":{opacity:0,transform:"translateY(20px) scale(.98)"},
                    "100%":{opacity:1,transform:"translateY(0) scale(1)"} }
            },
            animation: { fadeUp: "fadeUp 600ms ease-out both" }
        }
    },
    plugins: [require("@tailwindcss/forms")]
}
