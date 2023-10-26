#use official Python runtime as a parent image
FROM python:3.10-buster

#setting up the working directory in the container
WORKDIR /usr/src/app

#to prevent delays in the output
ENV PYTHONUNBUFFERED=1

#tell docker where the settings file is
ENV DJANGO_SETTINGS_MODULE=backend.settings

#copy the requirements into the container at /usr/src/app
COPY requirements.txt ./

#install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

#copy the current directory contents into the container at /usr/src/app
COPY . .

EXPOSE 8000

#Run the command to start uWSGI
CMD ["uwsgi", "--http", ":8000", "--module", "backend.wsgi"]


