FROM node:18-alpine

# Set production environment
ENV NODE_ENV=production

# Create app directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache wget curl

# Install application dependencies
COPY package*.json ./
RUN npm install

# Copy source code and models
COPY --chown=node:node . .

# Create a non-root user and switch to it
RUN chown -R node:node /app
USER node

# Print environment variables for debugging
RUN echo "Environment variables:" && env

# Print directory structure for debugging
RUN echo "=== /app directory ===" && ls -la /app && \
    echo "\n=== /app/src directory ===" && ls -la /app/src && \
    echo "\n=== /app/src/models directory ===" && ls -la /app/src/models 2>/dev/null || echo "models directory not found"

# Check if the entry file exists
RUN if [ ! -f "/app/src/index.js" ]; then echo "ERROR: index.js not found" && exit 1; fi

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3001}/health || exit 1

# Command to run the application with debugging
CMD ["node", "--trace-warnings", "--unhandled-rejections=strict", "src/index.js"]