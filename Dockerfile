FROM python:3-alpine
LABEL maintainer ="Bolaji Aina <neoandey@yahoo.com>"

ARG FLASK_APP=cill.py
ARG FLASK_ENV=production
ARG MONGODB_URL
ARG MONGODB_DB
ARG MONGODB_HOST
ARG MONGODB_PORT
ARG MONGODB_USERNAME
ARG MONGODB_PASSWORD
ARG MONGODB_USE_SSL
ARG MONGODB_REPLICASET
ARG MONGODB_DIRECT_CONNECTION
ARG MONGODB_AUTH_MECHANISM
ARG SESSION_TYPE
ARG REDIS_URL
ARG REDIS_QUEUE_NAME
ARG PORT

ENV FLASK_APP=$FLASK_APP
ENV FLASK_ENV=$FLASK_ENV
ENV MONGODB_URL=$MONGODB_URL
ENV MONGODB_DB=$MONGODB_DB
ENV MONGODB_HOST=$MONGODB_HOST
ENV MONGODB_PORT=$MONGODB_PORT
ENV MONGODB_USERNAME=$MONGODB_USERNAME
ENV MONGODB_PASSWORD=$MONGODB_PASSWORD
ENV MONGODB_USE_SSL=$MONGODB_USE_SSL
ENV MONGODB_REPLICASET=$MONGODB_REPLICASET
ENV MONGODB_DIRECT_CONNECTION=$MONGODB_DIRECT_CONNECTION
ENV MONGODB_AUTH_MECHANISM=$MONGODB_DIRECT_CONNECTION
ENV SESSION_TYPE=$SESSION_TYPE
ENV REDIS_URL=$REDIS_URL
ENV REDIS_QUEUE_NAME=$REDIS_QUEUE_NAME
ENV PORT=$PORT

RUN  mkdir -p "/opt/$FLASK_APP/app"  &&  mkdir -p "opt/$FLASK_APP/settings" &&  apk update && apk upgrade && apk add --no-cache --update bash \
   gcc \
   libcurl \
   python3-dev \
   gpgme-dev \
   libc-dev \
   g++ \
   libxslt-dev \
   libxslt-dev \
   libffi-dev

COPY [".flaskenv","./config.py","./$FLASK_APP.py","./$FLASK_APP.py","./Procfile","./redis_worker.py","./requirements.txt", "/opt/$FLASK_APP/"]
COPY ["./settings","/opt/$FLASK_APP/settings"]
COPY ["./app",  "/opt/$FLASK_APP/app"]
RUN  python -m pip install --upgrade pip &&  python -m pip install -r  /opt/$FLASK_APP/requirements.txt && apk add bash #&&  pyversion1=$$(ls /usr/local/lib | grep python| tail -1)  && sed -i -e 's/flask.json/json/g' "/usr/local/lib/$$pyversion1/site-packages/flask_mongoengine/json.py"
WORKDIR /opt/$FLASK_APP
EXPOSE $PORT 6379 443 80
CMD python redis_worker.py & gunicorn -w 2 -b 0.0.0.0:$PORT  '$FLASK_APP:app' 