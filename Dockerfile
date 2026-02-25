FROM node:20-alpine
WORKDIR /app
COPY server.js .
COPY content/ content/
EXPOSE 8080
CMD ["node", "server.js"]
