# Use official Node.js 18 LTS image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy dependency-related files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files after dependencies are installed
COPY . .

# Build the React app for production
RUN npm run build

# Install `serve` to host the production build
RUN npm install -g serve

# Expose port for the app
EXPOSE 3000

# Run the app using serve
CMD ["serve", "-s", "build", "-l", "3000"]
