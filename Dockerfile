FROM node:22-alpine

WORKDIR /app

# Install dependencies (including dev deps needed for build)
COPY package.json package-lock.json ./
RUN npm ci

# Copy all source files
COPY . .

# Build app (prisma generate + next build via package.json script)
# Dummy env vars for build — real values injected at runtime by Railway
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" \
    NEXTAUTH_SECRET="build-only-secret" \
    RESEND_API_KEY="re_build_dummy" \
    OPENAI_API_KEY="sk-build-dummy" \
    npm run build

# Remove dev dependencies for smaller image
RUN npm prune --omit=dev

ENV NODE_ENV=production
EXPOSE 3000

# At runtime, Railway injects real DATABASE_URL, NEXTAUTH_SECRET, etc.
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm start"]
