FROM node:20.17.0-alpine AS development

# this is the image for backend server only
WORKDIR /usr/src/frontend

# install dependencies
COPY package*.json .
RUN npm install

# copy src codes
COPY . .

# environment variables before the project is built
ENV NEXT_PUBLIC_API_URL=http://localhost:8000

# build the project
RUN npm run build

FROM node:20.17-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/frontend

COPY package*.json .

RUN npm install --omit=dev

# only copy the necessary files
COPY --from=development /usr/src/frontend/package.json ./
COPY --from=development /usr/src/frontend/.next ./.next
COPY --from=development /usr/src/frontend/public ./public


CMD ["npm", "run", "start"]
