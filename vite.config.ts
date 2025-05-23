/// <reference types="vitest" />

import tailwindcss from '@tailwindcss/vite'
import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import path, { join } from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), legacy()],
  resolve: {
    // https://cn.vitejs.dev/config/#resolve-alias
    alias: {
      // 设置路径
      '~': path.resolve(__dirname, './'),
      // 设置别名
      '@': path.resolve(__dirname, './src')
    },
    // https://cn.vitejs.dev/config/#resolve-extensions
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  server: {
    port: 8100,
    host: '0.0.0.0',
    proxy: {
      '/webdav': {
        // target: 'http://192.168.125.116:8080',
        target: 'http://192.168.31.51:5005',
        // changeOrigin: true,
        rewrite: (path) => path.replace(/^\/webdav/, ''),
        headers: {
          // 添加 Basic 认证头（用户名密码需 Base64 编码）
          Authorization: 'Basic ' + Buffer.from('username:password').toString('base64')
        }
      }
    }
  }
})
