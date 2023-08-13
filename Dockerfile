FROM node:20-slim
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /workspace
COPY package.json package-lock.json ./
RUN npm install
COPY ./ ./
RUN npx prisma generate
CMD ["npm", "start"]

