# user-stories-backend
make dir config and add .env.development as .config example and keep port
4000 as I am using it into frontend
```

mkdir config

cd config

touch .env.development
```
write in .env.development :

NODE_ENV=example

port=4000

DATABASE_URL="mysql://root:your_root_password@localhost:3306/your_database_name"

SECRET_KEY='_VOIS'

## To start Project 

```
yarn

yarn dev
```
