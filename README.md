# Project Eco #1

# Getting started
To get started, run the following commands:

	git clone https://github.com/MrPoll0/e1.git
	cd api && npm install
	cd ../app && npm install

# Configuring NGINX
We use NGINX as a reverse proxy. You can find the configuration in [`nginx`](https://github.com/MrPoll0/e1/tree/prod/nginx).

https://digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-20-04

# Running locally in development mode
To run [`api`](https://github.com/MrPoll0/e1/tree/prod/api) and [`app`](https://github.com/MrPoll0/e1/tree/prod/app), use PM2: 

	cd api/src && pm2 start server.js --name api
	cd ../../app && pm2 start npm --name "app" -- run dev
