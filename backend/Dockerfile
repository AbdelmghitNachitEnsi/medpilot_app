FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies explicitly (both production and development)
RUN npm install --include=dev

# Install nodemon and sequelize-cli globally to ensure they're available
RUN npm install -g nodemon sequelize-cli

# Copy source code
COPY . .

# Expose port
EXPOSE 4000

# Start command
CMD ["sh", "-c", "npx sequelize-cli db:migrate && nodemon app.js"]