# Stage 1: Build dependencies
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm install --only=production

# Copy application source
COPY . .

# Stage 2: Production image
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy installed dependencies & app source from builder
COPY --from=builder /usr/src/app /usr/src/app

# Prisma requires generating client
RUN npx prisma generate

# Expose the port your Express app runs on
EXPOSE 3000

# Start the server
CMD ["node", "index.js"]