FROM node:20-slim
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /workspace
COPY package.json yarn-lock.json ./
RUN yarn install
COPY ./ ./
RUN npx prisma generate
CMD ["yarn", "start"]

