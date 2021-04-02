# Vaccine Hunter

![Build type](https://img.shields.io/docker/cloud/automated/brbarnett/vaccine-hunter)
![Build status](https://img.shields.io/docker/cloud/build/brbarnett/vaccine-hunter)
![Image pulls](https://img.shields.io/docker/pulls/brbarnett/vaccine-hunter)
![Image size](https://img.shields.io/docker/image-size/brbarnett/vaccine-hunter/latest)

Live now at [www.vaccine-hunter.com](https://www.vaccine-hunter.com/)!

This simple node app makes use of the https://www.vaccinespotter.org/ API to constantly check for new COVID vaccine appointments.

You can filter and sort by your location and maximum distance. It refreshes every 5 minutes to alert you to new appointments as they become available.

## How to run local development environment
```
yarn

yarn start
```

## Automated build and release
This repository is linked to a Docker Hub repository: [brbarnett/vaccine-hunter](https://hub.docker.com/repository/docker/brbarnett/vaccine-hunter). Pushes to `main` trigger an automated Docker build, which in turn calls a webhook from an Azure app service ([Web Apps for Containers](https://azure.microsoft.com/en-us/services/app-service/containers/)) to trigger a new image pull.