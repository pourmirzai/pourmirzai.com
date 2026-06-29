# Build static site
# Node 22 required: engines >=22.12.0, npm 11 (allowScripts), Vite 8 + rolldown native toolchain.
# See docs/memory.md ERR-005. node:20 (npm 10) breaks `npm ci`.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve with nginx
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
