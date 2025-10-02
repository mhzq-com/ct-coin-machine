#!/bin/bash

echo "Frissítés indítása..." >> update.log
echo "Használt GIT TOKEN: $GIT_TOKEN" >> update.log
cd /home/pi/ct-coin-machine

git pull https://$GIT_TOKEN@github.com/mhzq-com/ct-coin-machine.git >> update.log 2>&1
npm install >> update.log 2>&1
npm run build >> update.log 2>&1
#pm2 restart your-app-name >> update.log 2>&1  # vagy az alkalmazásod újraindítása

echo "Frissítés befejezve: $(date)" >> update.log
echo "OK"