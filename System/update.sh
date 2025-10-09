#!/bin/bash

echo "Frissítés indítása..." #>> update.log
cd /home/pi/ct-coin-machine

echo "GIT frissítése ..." #>> update.log
git pull https://$GIT_TOKEN@github.com/mhzq-com/ct-coin-machine.git #>> update.log 2>&1
echo "Csomagok frissítése ..." #>> update.log
npm install #>> update.log 2>&1
echo "Build indítása ..." #>> update.log
npm run build #>> update.log 2>&1
echo "Futó folyamatok lezárása ..." #>> update.log
pkill -f "node"
echo "Szerver újraindítása ..." #>> update.log
nohup npm run start &
#pm2 restart your-app-name >> update.log 2>&1  # vagy az alkalmazásod újraindítása

echo "Frissítés befejezve: $(date)" #>> update.log
echo "OK"