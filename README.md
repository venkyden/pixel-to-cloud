# Roomivo - Dual Mode Setup

This project supports **two modes** to accommodate both Lovable preview and production deployment:

## 🎨 Lovable Preview Mode (Vite)
For working with the Lovable editor/preview:
```bash
npm run dev        # Vite dev server on http://localhost:3000
npm run build:dev  # Vite development build
npm run build      # Vite production build
```

## 🚀 Production Mode (Next.js)
For actual deployment and full functionality:
```bash
npm run next:dev    # Next.js dev server
npm run next:build  # Next.js production build
npm run next:start  # Next.js production server
```

## ⚠️ Important Notes
- **Lovable mode** uses Vite and shows a simplified version
- **Production mode** uses Next.js with full App Router functionality
- Deploy to Vercel using `npm run next:build`
- For local Next.js testing, use `npm run next:dev`

## 📝 Custom Domain
- Domain: **roomivo.eu**
- See `DEPLOY.md` for DNS configuration instructions
