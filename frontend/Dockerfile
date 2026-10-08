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

# Stage 2: Serve using Node.js native server
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
COPY server.js ./
COPY --from=build /app/dist ./dist

# Railway provides PORT dynamically
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
