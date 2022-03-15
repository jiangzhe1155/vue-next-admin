import { defineConfig } from 'windicss/helpers'

export default defineConfig({
    theme: {
        extend: {
            backgroundColor: {
                'primary': 'rgba(var(--primary), var(--tw-bg-opacity))',
            },
            textColor: {
                'primary': 'rgba(var(--primary), var(--tw-text-opacity))',
            }
        },
    },
})
