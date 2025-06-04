import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import { fileURLToPath } from 'url'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

import {NodeGlobalsPolyfillPlugin} from '@esbuild-plugins/node-globals-polyfill'

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // nodePolyfills({
    //   // Whether to polyfill `node:` protocol imports.
    //   protocolImports: true,
    //   // Polyfills for specific Node.js globals and modules
    //   globals: {
    //     Buffer: true,
    //     global: true,
    //   },
    // }),
  ],
  
  // build: {
  //   commonjsOptions: {
  //     include: [/node_modules/],
  //     transformMixedEsModules: true
  //   },
  //   rollupOptions: {
  //     plugins: [
  //       // Enable rollup polyfills plugin
  //       // used during production bundling
  //       rollupNodePolyFill()
  //     ]
  //   }
  // },


  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'process.env': {}
  },
  optimizeDeps: {
    esbuildOptions: {

      plugins: [
         NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],

   
 
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer:true
        }),
        // nodeModulesPolyfillPlugin()
      ],
    

      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
    },
    include: ["@solana/web3.js", "buffer"],
  },
})
