# Vaccine Hunter

![Build type](https://img.shields.io/docker/cloud/automated/brbarnett/vaccine-hunter)
![Build status](https://img.shields.io/docker/cloud/build/brbarnett/vaccine-hunter)
![Image pulls](https://img.shields.io/docker/pulls/brbarnett/vaccine-hunter)
![Image size](https://img.shields.io/docker/image-size/brbarnett/vaccine-hunter/latest)

This simple node app makes use of the https://www.vaccinespotter.org/ API to constantly check for new COVID vaccine appointments.

You can filter and sort by your location and maximum distance. It refreshes every 5 minutes to alert you to new appointments as they become available.

## How to run local development environment
```
yarn

yarn start
```