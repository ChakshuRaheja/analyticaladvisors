FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Set environment to production
ENV NODE_ENV=production

# Expose the application port
EXPOSE 3001

# Start the application
CMD ["node", "src/index.js"] 