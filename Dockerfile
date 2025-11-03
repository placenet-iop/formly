FROM node:22-bullseye
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV VITE_JWKS_ENDPOINT=https://api.placenet.app/.well-known/jwks.json

RUN npx prisma generate
RUN npm run build
RUN npm prune --production

WORKDIR /app
EXPOSE 3000
ENV NODE_ENV=production
ENV BODY_SIZE_LIMIT=10M
CMD ["sh", "-c", "node build"]
