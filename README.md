# This is Simple Line Bot on Heroku with FireBase

## INFO

https://kakeibot-buta.herokuapp.com/
https://git.heroku.com/kakeibot-buta.git

## SETUP

```
$ heroku login
$ heroku apps:create kakeibot-buta
```

```
$heroku config:set LINE_CHANNEL_ID=<your secret ...>
$heroku config:set LINE_CHANNEL_SECRET=<your secret ...>
$heroku config:set LINE_ACCESS_TOKEN=<your secret ...>
$heroku config:set FIRE_BASE_API_KEY=<it's not secret. but manage on env ...>
$heroku config:set FIRE_BASE_PROJECT_ID=<it's not secret. but manage on env ...>
```

## DEV

```
$ yarn dev
```

## DEBUG

You can simple POST with `util/curl.sh`.

## DEPLOY

```
$ git add .
$ git commit
$ git push heroku master
```

※ I've setted up master branch to heroku/master

## TEST

jest + supertest + typescript.
