# Use lightweight Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --only=production

# Copy all source files
COPY . .

# Copy environment file
COPY .env .env

# Build TypeScript code
RUN npm run build

# Expose Cloud Run's required port
EXPOSE 3000

# Start the bot
CMD ["node", "dist/index.js"]
