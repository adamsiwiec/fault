
FROM ubuntu
ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update
RUN apt-get install build-essential cmake git tini libwebsockets-dev libjson-c-dev -y
RUN git clone https://github.com/tsl0922/ttyd.git
RUN cd ttyd && mkdir build && cd build && cmake .. && make && make install

EXPOSE 7681
COPY html.h /
WORKDIR "/data"

# ENTRYPOINT ["/sbin/tini", "--"]

CMD ttyd -o -I /html.h bash
