const defaultTheme = require('tailwindcss/defaultTheme');
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/public/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}', // TODO: to be removed when depraction of pages directory occurs
    './src/config/**/*.{js,ts,jsx,tsx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
    './src/utils/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    gradientColorStops: (theme) => ({
      ...theme('colors'),
      primary: '#0D1321',
      secondary: '#151C2D',
    }),
    extend: {
      boxShadow: {
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.01)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.01)',
      },
      colors: {
        'primary-yellow': '#FFC500',
        teal: '#00C5B0',
        'secondary-cyan': '#7DEAD8',
        'bright-blue': '#005ADF',
        'secondary-blue': '#3FA9F5',
        'light-gray': '#CECECE',
        gray: '#595E68',
        'primary-dark-blue': '#1F273A',
        'secondary-deep-blue': '#192033',
        'secondary-space-blue': '#151C2D',
        'secondary-midnight': '#0D1321',
        'secondary-light-blue': '#70F0F0',
        'primary-yellow-hover': '#FFD959',
        'scrollbar-thumb-yellow': '#EBB500',
        'secondary-cyan': '#7DEAD8',
        'secondary-blue': '#3FA9F5',
        'secondary-dark-blue': '#192033',
        current: 'currentColor',
        yellow: '#EBB500',
        cyan: '#00B4A1',
        blue: '#004BB9',
        nav: '#363C4F',
        navText: '#9197AD',
        secondary: '#79D900',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        roboto: ['Roboto', ...defaultTheme.fontFamily.sans],
        rubik: ['Rubik', ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        xs: ['0.75rem', {lineHeight: '1.5'}],
        sm: ['0.875rem', {lineHeight: '1.5715'}],
        base: ['1rem', {lineHeight: '1.5', letterSpacing: '-0.01em'}],
        lg: ['1.125rem', {lineHeight: '1.5', letterSpacing: '-0.01em'}],
        xl: ['1.25rem', {lineHeight: '1.5', letterSpacing: '-0.01em'}],
        '2xl': ['1.5rem', {lineHeight: '1.33', letterSpacing: '-0.01em'}],
        '3xl': ['1.88rem', {lineHeight: '1.33', letterSpacing: '-0.01em'}],
        '4xl': ['2.25rem', {lineHeight: '1.25', letterSpacing: '-0.02em'}],
        '5xl': ['3rem', {lineHeight: '1.25', letterSpacing: '-0.02em'}],
        '6xl': ['3.75rem', {lineHeight: '1.2', letterSpacing: '-0.02em'}],
      },
      screens: {
        xs: '480px',
      },
      borderWidth: {
        3: '3px',
      },
      backgroundImage: {
        'split-yellow-gray': 'linear-gradient(to right, #111827 50%, transparent 50%)',
        'split-slate-yellow': 'linear-gradient(to right, transparent 50%, #111827 50%)',
      },
      minWidth: {
        36: '9rem',
        44: '11rem',
        56: '14rem',
        60: '15rem',
        72: '18rem',
        80: '20rem',
      },
      width: {
        56: '14rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      zIndex: {
        60: '60',
      },
    },
  },
  plugins: [
    // eslint-disable-next-line global-require
    require('@tailwindcss/forms')({
      strategy: 'class', // only generate classes
    }),
    require('tailwindcss-scoped-groups')({
      groups: ['props', 'filters', 'states'],
    }),
    require('@tailwindcss/aspect-ratio'),
    require('./src/utils/scrollbar.js'),
    // add custom variant for expanding sidebar
    plugin(({addVariant, e}) => {
      addVariant('main-sidebar-expanded', ({modifySelectors, separator}) => {
        modifySelectors(
          ({className}) => `.main-sidebar-expanded .${e(`main-sidebar-expanded${separator}${className}`)}`
        );
      });
      addVariant('project-sidebar-expanded', ({modifySelectors, separator}) => {
        modifySelectors(
          ({className}) => `.project-sidebar-expanded .${e(`project-sidebar-expanded${separator}${className}`)}`
        );
      });
      addVariant('comments-sidebar-expanded', ({modifySelectors, separator}) => {
        modifySelectors(
          ({className}) => `.comments-sidebar-expanded .${e(`comments-sidebar-expanded${separator}${className}`)}`
        );
      });
    }),
  ],
};
