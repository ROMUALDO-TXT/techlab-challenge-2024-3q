FROM node:22-alpine

COPY . ./app

WORKDIR /app

RUN yarn install

VOLUME ./backend/src:/app/backend/src

RUN cp -r ./backend/src/migrations dist/

CMD ["sh", "-c", "yarn workspace techlab-challenge-2024-3q-backend start:dev"]


