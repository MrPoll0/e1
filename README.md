# Project Eco #1

# Getting started
To get started, run the following commands:

	git clone https://github.com/MrPoll0/e1.git
	cd api && npm install
	cd ../app && npm install

# Configuring NGINX
We use NGINX as a reverse proxy. You can find the configuration in [`nginx`](https://github.com/MrPoll0/e1/tree/prod/nginx).

https://digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-20-04

# Configuring COTURN
You can see how to configure [COTURN](https://github.com/coturn/coturn) here:

https://ourcodeworld.com/articles/read/1175/how-to-create-and-configure-your-own-stun-turn-server-with-coturn-in-ubuntu-18-04

# Ports to open
You will need to open the following ports: (remember too see your ip with `ip a`)

HTTP -> 80
Node -> 3000
SSL -> 443
turn1 -> 3478
turn2 -> 5349
turn3 -> 49152
MySQL -> 3306
SSH -> 22

# Running locally in development mode
To run [`api`](https://github.com/MrPoll0/e1/tree/prod/api) and [`app`](https://github.com/MrPoll0/e1/tree/prod/app)

        cd api/src && pm2 start server.js --name api
        cd ../../app && pm2 start npm --name "app" -- run dev

