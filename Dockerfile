# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY . .

# Optional: generate Prisma client if schema is in src/prisma
RUN npx prisma generate --schema=prisma/schema.prisma

# Stage 2: Production
FROM node:20-alpine
WORKDIR /usr/src/app

# Copy dependencies and source
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/package*.json ./

EXPOSE 8080
CMD ["node", "src/index.js"]
