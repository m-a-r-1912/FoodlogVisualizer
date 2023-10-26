#Use official node image as a parent image
FROM node:18

#setting up the working directory in the container
WORKDIR /usr/src/app

#copy the package.json and package-lock.json into the container at /usr/src/app
COPY package*.json ./

#install dependencies
RUN npm install

#copy the current directory contents into the container at /usr/src/app
COPY . .

#build the app
RUN npm run build

#run the command to start the app
CMD ["npm", "start"]

EXPOSE 3000