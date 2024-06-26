# Use node:alpine as the base image
FROM node:18.19.0-alpine3.18 AS builder

# Set the working directory inside the container
WORKDIR /app/server

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the server (if applicable)
RUN npm run build

# Start from a new, smaller image
FROM node:18.19.0-alpine3.18

# Set the working directory inside the container
WORKDIR /app/server

# Copy only necessary files from the builder stage
COPY --from=builder /app/server .

# Expose the port your app runs on
EXPOSE 3000:3000

# Command to run your application
CMD ["npm", "run", "start:prod"]