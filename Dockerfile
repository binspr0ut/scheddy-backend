# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy source
COPY . .

# Generate Prisma Client (jika pakai Prisma)
RUN npx prisma generate

# Stage 2: Production image
FROM node:20-alpine
WORKDIR /usr/src/app

# Copy hasil build
COPY --from=builder /usr/src/app /usr/src/app

# Expose port yang akan dipakai Cloud Run
EXPOSE 8080

# Start server
CMD ["node", "index.js"]
