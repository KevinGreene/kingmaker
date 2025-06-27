const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
    content: [
        './public/*.html',
        './app/**/*.{js,jsx,ts,tsx,erb,haml,html,slim}'
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter var', ...defaultTheme.fontFamily.sans],
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/aspect-ratio'),
        require('@tailwindcss/typography'),
        require('daisyui')
    ],
    daisyui: {
        themes: ["light", "dark", "cupcake"],
    },
    safelist: [
        'py-4', 'py-6', 'py-8', 'py-12', 'py-16', 'py-20',
        'px-4', 'px-6', 'px-8', 'px-12', 'px-16', 'px-20',
        'mb-4', 'mb-6', 'mb-8', 'mb-12', 'mb-20',
        'm-2', 'mb-3', 'mb-4', 'mb-6', 'mb-8', 'mb-12',
        'text-sm', 'text-md', 'text-lg', 'text-xl', 'text-2xl'
    ]
}