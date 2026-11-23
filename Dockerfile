# Dockerfile
# Current Node LTS (26 "Lithium", supported until 2029-04); SvelteKit 3 needs Node >= 22.17
FROM node:26-alpine

# curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Copy the build files
COPY build/ ./build/

# Ports
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV HOST=0.0.0.0

# Start the app
CMD ["node", "build/index.js"]