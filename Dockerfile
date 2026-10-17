
FROM node:22-alpine

WORKDIR /app

COPY server/package*.json ./
COPY server/prisma ./prisma/

RUN npm ci

RUN npx prisma generate

COPY server/tsconfig*.json ./
COPY server/src ./src/

RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]
