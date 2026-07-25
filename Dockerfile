# Stage 1: Build the Vite frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source files
COPY . .

# Build arguments for Vite environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Set as environment variables for Vite build
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

# Build the frontend
RUN npm run build

# Stage 2: Install backend production dependencies
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy server package files
COPY server/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Stage 3: Final combined image
FROM node:20-alpine AS final

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy backend production dependencies from backend-builder
COPY --from=backend-builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs server/package*.json ./

# Copy server source to a server subdirectory to match expected structure
RUN mkdir -p server
COPY --chown=nodejs:nodejs server/index.js ./server/

# Copy built frontend from frontend-builder to match server path structure
COPY --from=frontend-builder --chown=nodejs:nodejs /app/dist ./dist

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8080

# Set environment variable for port
ENV PORT=8080

# Start the server
CMD ["node", "server/index.js"]
