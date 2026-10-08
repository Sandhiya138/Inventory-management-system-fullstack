# ==============================================================================
# VelvetStock Frontend - Multi-Stage Dockerfile (React 18 + Vite)
# ==============================================================================

# Stage 1: Build the React SPA
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Pass VITE_API_URL during build (baked into client-side JS bundle)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Serve using lightweight, fast 'serve'
FROM node:20-alpine
WORKDIR /app

RUN npm install -g serve
COPY --from=build /app/dist ./dist

# Railway provides PORT dynamically
ENV PORT=3000
EXPOSE 3000

# -s flag enables SPA fallback to /index.html; tcp://0.0.0.0 binds to all network interfaces
CMD ["sh", "-c", "serve -s dist -l tcp://0.0.0.0:${PORT:-3000}"]
