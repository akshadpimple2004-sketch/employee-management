FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY server.js ./

ENV PORT=8080
ENV MONGO_URI=mongodb://localhost:27017/employee_db

EXPOSE 8080

CMD ["node", "server.js"]
