# ct-coin-machine
 Coin Machine


## GPIO
### onoff or pigpio?

The pigpio Node.js package is a wrapper for the pigpio C library. The pigpio C libray requires root/sudo privileges to access certain hardware peripherals. The pigpio Node.js package can't be modified to avoid this.

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

