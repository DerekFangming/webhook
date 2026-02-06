FROM node:25-alpine3.22 AS builder

WORKDIR /app
COPY . .

RUN npm i -g @vercel/ncc
RUN npm i -g @angular/cli@latest

RUN npm run build
RUN ncc build index.js -o dist


FROM node:25-alpine3.22
WORKDIR /app
COPY --from=builder /app/dist .
CMD ["node", "."]