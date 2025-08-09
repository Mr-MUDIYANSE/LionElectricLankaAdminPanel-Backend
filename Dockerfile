FROM node:lts-alpine3.20
# Install required system dependencies for Prisma
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies for Prisma)
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application
COPY .env .
COPY . .

# Install only production dependencies
RUN npm prune --production

# Set environment to production
ENV NODE_ENV=production

# Expose port
EXPOSE 4000

# Run the app
CMD ["npm", "start"]