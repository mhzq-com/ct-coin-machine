#@echo off
echo Frissítés indítása... >> update.log
echo Token: %GIT_TOKEN% >> update.log
cd /d E:\Munka\MHZQ\CityMedia\Rpi\ct-coin-machine

echo Git pull... >> update.log
git pull https://$GIT_TOKEN@github.com/mhzq-com/ct-coin-machine.git >> update.log

echo NPM install... >> update.log
npm install  --no-audit --no-fund

echo Build futtatása... >> update.log
npm run build 

echo Alkalmazás újraindítása... >> update.log
#pm2 restart your-app-name >> update.log 2>&1

echo Frissítés befejezve: %date% %time% >> update.log
echo OK