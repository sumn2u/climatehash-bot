# Use lightweight Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (including TypeScript)
RUN npm install --only=production

# Copy the rest of the project
COPY . .

# Build TypeScript code
RUN npm run build

# Expose a port (optional, useful for future extensions)
EXPOSE 3000

# Start the bot
CMD ["node", "dist/index.js"]
