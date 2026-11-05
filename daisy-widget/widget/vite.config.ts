import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    define: { 'process.env.NODE_ENV': JSON.stringify('producction') },
    build: {
        lib: {
            entry:'widget/main.tsx',
            name: 'DaisyWidget',
            formats: ['iife'],
            fileName: () => 'v1.js',
        },
        outDir: 'public',
        emptyOutDir: false,
    },
});