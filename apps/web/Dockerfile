FROM node:12

# set working directory
RUN mkdir -p /usr/app
WORKDIR /usr/app

ENV PATH /usr/app/node_modules/.bin:$PATH

# Installing dependencies
COPY package*.json ./
RUN npm install

#Copy Code
COPY . .

#Start dev server
CMD [ "npm", "start" ]