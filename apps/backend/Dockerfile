FROM node:20
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 4000
CMD ["npx", "nodemon", "./bin/www"]
