#!/bin/sh

npm run build
[ $? -eq 0 ] || exit $?; # exit if it doesnt build

# Start three archivists that will be findable on localhost
node dist/main.js -t xyo-archivist -m N1 -h 127.0.0.1 -p 15555 -s 19555 -n 100 -d &
node dist/main.js -t xyo-archivist -m N2 -h 127.0.0.1 -p 15556 -s 19556 -n 100 -d &
node dist/main.js -t xyo-archivist -m N3 -h 127.0.0.1 -p 10001 -s 11001 -n 100 -d &

# Start a diviner and a bridge that will be findable via a knownHost
# This only works if /etc/hosts is configured sucha that alpha.xyo-known-host.com
# and beta.xyo-known-host.com point to 127.0.0.1

node dist/main.js -t xyo-diviner -m N4 -h 127.0.0.1 -p 10002 -s 11002 -n 100 -d &
node dist/main.js -t xyo-bridge -m N5 -h 127.0.0.1 -p 10003 -s 11003 -n 100 -d &