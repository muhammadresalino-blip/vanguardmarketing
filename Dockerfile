# API Vanguard Marketing (opsional: untuk VPS/Fly.io/Render manual).
# Frontend dibangun terpisah (pnpm build) lalu di-host di Vercel/Netlify,
# atau disalin ke folder dist agar dilayani oleh server ini juga.

FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY server ./server
COPY src/lib ./src/lib

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:4000/api/health || exit 1

CMD ["node", "server/index.js"]
