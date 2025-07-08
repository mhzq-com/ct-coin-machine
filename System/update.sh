#!/bin/bash

echo "Frissítés indítása..." >> update.log
cd /home/pi/ct-coin-machine

git pull origin main >> update.log 2>&1
npm install >> update.log 2>&1
npm run build >> update.log 2>&1
#pm2 restart your-app-name >> update.log 2>&1  # vagy az alkalmazásod újraindítása

echo "Frissítés befejezve: $(date)" >> update.log
echo "OK"