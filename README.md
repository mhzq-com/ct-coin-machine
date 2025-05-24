# ct-coin-machine
 CT Coin Machine


## GPIO

## MONERA

### Disable bluetooth 
Have to disable bluetooth in /boot/config.txt because conflicts with /dev/ttyAMA0 serialport reading

    dtoverlay=pi3-disable-bt

### IP ADDRESS

#### In development

    DHCP

#### In production

    192.168.1.42

### Com3 used to listen "PAID" message on POS terminal

