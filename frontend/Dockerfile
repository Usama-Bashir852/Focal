# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
# Retry settings so a flaky connection doesn't fail the whole build; bump
# --registry to https://registry.npmmirror.com here if npmjs.org is
# consistently unreachable/slow on your network.
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm install
COPY . .
# VITE_API_URL is baked in at build time -- pass it via docker-compose build args
# or a build-time --build-arg when deploying to your VPS.
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# --- serve stage ---
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
