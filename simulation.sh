#!/bin/sh

npm run build
[ $? -eq 0 ] || exit $?; # exit if it doesnt build

node dist/main.js -t xyo-archivist -m N1 -h 127.0.0.1 -p 15555 -s 19555 -n 100 -d &
node dist/main.js -t xyo-archivist -m N2 -h 127.0.0.1 -p 15556 -s 19556 -n 100 -d &
node dist/main.js -t xyo-archivist -m N3 -h 127.0.0.1 -p 15557 -s 19557 -n 100 -d &
node dist/main.js -t xyo-archivist -m N4 -h 127.0.0.1 -p 15558 -s 19558 -n 100 -d &
node dist/main.js -t xyo-archivist -m N5 -h 127.0.0.1 -p 15559 -s 19559 -n 100 -d &