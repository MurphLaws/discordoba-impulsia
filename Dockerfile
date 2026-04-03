FROM node:22-alpine

WORKDIR /app

# Install dependencies (including dev deps needed for build)
COPY package.json package-lock.json ./
RUN npm ci

# Copy all source files
COPY . .

# Build app (prisma generate + next build via package.json script)
# Dummy DATABASE_URL for prisma generate (it doesn't connect, just generates types)
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" \
    NEXTAUTH_SECRET="build-only-secret" \
    npm run build

# Remove dev dependencies for smaller image
RUN npm prune --omit=dev

ENV NODE_ENV=production
EXPOSE 3000

# At runtime, Railway injects real DATABASE_URL, NEXTAUTH_SECRET, etc.
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm start"]
