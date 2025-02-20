# Vibezz.live

## Getting started
To get started, run the following commands:

	git clone https://github.com/MrPoll0/e1.git
	cd api && npm install
	cd ../app && npm install

## Configuring NGINX
We use NGINX as a reverse proxy. You can find the configuration in [`nginx`](https://github.com/MrPoll0/e1/tree/prod/nginx).

https://digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-20-04

## Configuring COTURN
You can find the configuration of [COTURN](https://github.com/coturn/coturn) in the directory [`coturn`](https://github.com/MrPoll0/e1/tree/prod/coturn).

To get your own cli-password:
	
	turnadmin -P -p mypassword

https://ourcodeworld.com/articles/read/1175/how-to-create-and-configure-your-own-stun-turn-server-with-coturn-in-ubuntu-18-04

https://stackoverflow.com/questions/31161864/how-to-create-stun-turn-server-instance-using-aws-ec2/32113146#32113146

https://gyazo.com/282acca705b768d0696d195dff98c9ff

## Configuring LETSENCRYPT
We use Letsencrypt for HTTPS. To configure it, use the following commands:

	sudo apt install certbot python3-certbot-nginx
	sudo certbot --nginx -d vibezz.live -d www.vibezz.live -d api.vibezz.live -d turn.vibezz.live

## Ports to open
You will need to open the following ports: (remember too see your ip with `ip a`)

`HTTP`: 80

`Node`: 3000

`SSL`: 443

`turn1`: 3478

`turn2`: 5349

`MySQL`: 3306 (not at the moment)

`SSH`: 22

## Running locally in development mode
To run [`api`](https://github.com/MrPoll0/e1/tree/prod/api) and [`app`](https://github.com/MrPoll0/e1/tree/prod/app), use PM2:

	cd api/src && pm2 start server.js --name api
	cd ../../app && pm2 start npm --name "app" -- run dev
	pm2 save

# How to Git

	git init
	git add . (add all [.] or specific files)
	git commit -m "Commit message"
	git push origin [local branch]:[remote branch]
To check local branch: `git branch`.
