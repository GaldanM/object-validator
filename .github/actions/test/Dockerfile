FROM 12.16.3-alpine

RUN apk update && apk upgrade && apk add git openssh

ADD entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
