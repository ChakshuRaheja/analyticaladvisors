FROM node:18-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci --only=production

# Create data directory
RUN mkdir -p /app/data

# Copy assets directory
COPY --chown=node:node assets/ ./assets/

# Copy source code
COPY --chown=node:node src/ ./src/

# Set environment variable for Excel file path
# ENV EXCEL_FILE_PATH=/app/data/data.xlsx

# Expose the port the app runs on
EXPOSE 8080

# Run as non-root user
USER node

# Command to run the application
CMD ["node", "src/index.js"]