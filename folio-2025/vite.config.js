import { defineConfig } from 'vite'

// import restart from 'vite-plugin-restart'

export default defineConfig({
    server: {
        port: 3001
    },
    publicDir: 'static',
    plugins: [
        // Restart server on static file change
        // restart({ restart: ['../static/**' ]})
    ]
})
