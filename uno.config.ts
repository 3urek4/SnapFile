import { defineConfig, presetIcons, presetWind } from 'unocss'

export default defineConfig({
  presets: [
    presetWind(),
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  theme: {
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        500: '#3b82f6',
        600: '#2563eb',
      },
      purple: {
        50: '#faf5ff',
        100: '#f3e8ff',
        500: '#a855f7',
        600: '#9333ea',
      },
      pink: {
        500: '#ec4899',
        600: '#db2777',
      },
    },
  },
  shortcuts: {
    'btn-gradient': 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-medium rounded-xl hover:shadow-xl transition-all duration-300',
    'card-glass': 'bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20',
    'input-gradient': 'bg-gradient-to-br from-blue-50/50 to-purple-50/50 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:outline-none transition-all',
  },
  safelist: ['i-carbon-copy', 'i-carbon-checkmark', 'i-carbon-download', 'i-carbon-view'],
})