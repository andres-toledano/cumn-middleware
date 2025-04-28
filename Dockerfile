# Imagen base oficial de Node
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

EXPOSE 3000

ENV PORT=3000
ENV SPRING_BOOT_URL=http://user-classroom-crud.ahdjd3hgg6bccqcs.spaincentral.azurecontainer.io:8080
ENV FLASK_URL=http://classroom-reservation-app.hzgzgkezgua8fecg.spaincentral.azurecontainer.io:5000

CMD ["node", "app.js"]
