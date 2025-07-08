@echo off
echo Frissítés indítása... >> update.log
cd /d F:\Temp\ct-coin-machine

echo Git pull... >> update.log
git pull origin main >> update.log 2>&1

echo NPM install... >> update.log
npm install >> update.log 2>&1

echo Build futtatása... >> update.log
npm run build >> update.log 2>&1

echo Alkalmazás újraindítása... >> update.log
#pm2 restart your-app-name >> update.log 2>&1

echo Frissítés befejezve: %date% %time% >> update.log
echo OK