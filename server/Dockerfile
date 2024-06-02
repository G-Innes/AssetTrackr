# Use node:alpine as the base image
FROM node:18.19.0-alpine3.18 AS builder

# Set the working directory inside the container
WORKDIR /app

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
WORKDIR /app

# Copy only necessary files from the builder stage
COPY package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Expose the port your app runs on
EXPOSE 3000

# Before the CMD instruction, add a step to copy the src directory
COPY src/ /app/src/

# Command to run your application
CMD ["npm", "run", "start"]
