FROM node:18-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy repo
COPY . .

# Install dependencies
RUN pnpm install

# Build workspace
RUN pnpm run build

# Production image
FROM node:18-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy from build image
COPY --from=base /app /app

# Expose port
EXPOSE 3001

# Run the API
CMD ["pnpm", "--filter", "api", "run", "start:prod"]
