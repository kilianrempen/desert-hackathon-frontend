# Stage 1: Build the application
FROM node:24 AS builder
WORKDIR /home/node/app

COPY package*.json ./
# ⬇️ change this line
RUN npm ci --no-optional --loglevel=warn

FROM node:24
ARG NODE_ENV=development
ENV NODE_ENV=$NODE_ENV
ARG PORT=4200
ENV PORT=$PORT
EXPOSE $PORT 9229 9230

# ⬇️ fix path (remove the dot)
WORKDIR /home/node/app

# ⬇️ delete this line entirely (no global npm update)
# RUN npm i -g npm@10 --no-fund --no-audit --loglevel=warn

COPY tsconfig.json ./
COPY resolve-extensions-loader.mjs ./
RUN chown node:node -R ./
COPY --from=builder /home/node/app ./
USER node
CMD ["npm", "run", "dev"]
