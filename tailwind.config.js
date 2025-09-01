/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(240, 10%, 4%)',
        foreground: 'hsl(0, 0%, 97%)',
        muted: 'hsl(240, 3.7%, 15.9%)',
        'muted-foreground': 'hsl(240, 5%, 64%)',
        popover: 'hsla(220, 13%, 18%, 0.5)',
        'popover-foreground': 'hsl(0, 0%, 97%)',
        card: 'hsla(220, 13%, 18%, 0.5)',
        'card-foreground': 'hsl(0, 0%, 97%)',
        border: 'hsla(220, 13%, 40%, 0.5)',
        input: 'hsla(220, 13%, 18%, 0.5)',
        primary: 'hsl(199, 89%, 48%)',
        'primary-foreground': 'hsl(240, 10%, 4%)',
        secondary: 'hsla(220, 13%, 18%, 0.5)',
        'secondary-foreground': 'hsl(0, 0%, 97%)',
        accent: 'hsla(220, 13%, 18%, 0.5)',
        'accent-foreground': 'hsl(0, 0%, 97%)',
        destructive: 'hsl(346, 87%, 43%)',
        'destructive-foreground': 'hsl(0, 0%, 97%)',
        ring: 'hsl(199, 89%, 48%)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-campaign': 'pulse-campaign 2.5s infinite',
      },
      keyframes: {
        'pulse-campaign': {
          '0%, 100%': { 
            opacity: '1',
            transform: 'scale(1)',
            boxShadow: '0 0 12px rgba(34, 197, 94, 0.8)'
          },
          '50%': { 
            opacity: '0.6',
            transform: 'scale(1.3)',
            boxShadow: '0 0 20px rgba(34, 197, 94, 1)'
          }
        }
      }
    },
  },
  plugins: [],
}