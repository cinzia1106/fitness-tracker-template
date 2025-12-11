import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 記得這裡要改成您的 Repo 名稱 (例如 /fitness-tracker/)
  base: '/fitness-tracker/',

  build: {
    // 增加這個設定來解決 500kb 警告
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 將 node_modules 裡的程式碼獨立打包成 vendor
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    // 稍微放寬警告限制 (例如改為 1000kb)，讓警告不那麼敏感
    chunkSizeWarningLimit: 1000
  }
})