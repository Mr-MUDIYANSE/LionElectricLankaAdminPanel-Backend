FROM node:lts-alpine3.20
WORKDIR /server
COPY . .
COPY .env .
RUN npm install
RUN npx prisma generate
EXPOSE 4000
CMD ["npm","start"]
