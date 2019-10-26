# INFO

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
```

## DEV

```
$ yarn dev
```

## Debug

You can simple POST with `util/curl.sh`.

## DEPLOY

```
$ git add .
$ git commit
$ git push heroku master
```

※ I've setted up master branch to heroku/master
