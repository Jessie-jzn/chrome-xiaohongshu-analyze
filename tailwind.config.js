module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#ff2442',
        secondary: '#ff9999'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms')
  ]
}; 