# cm-coin-machine
 Coin Machine

## Install OpenVPN

    sudo apt-get install openvpn unzip

### Timezone check

    sudo dpkg-reconfigure tzdata

### AutoStart OpenVPN

    Download the OpenVPNConfigFile.ovpn. Note that you can rename the file to anything you like.

    Move the ovpn file to /etc/openvpn

    cd /etc/openvpn folder and enter sudo nano yourserver.txt

    your_server_user_name
    your_server_passowrd
    Save and Close

    sudo nano OpenVPNConfigFile.ovpn

    Find auth-user-pass and add yourserver.txt next to it so that it becomes

    auth-user-pass yourserver.txt
    This will allow you to skip entering your credentials everytime you start openvpn connection

    Rename OpenVPNConfigFile.ovpn to OpenVPNConfigFile.conf

    sudo mv OpenVPNConfigFile.ovpn OpenVPNConfigFile.conf
    sudo nano /etc/default/openvpn

    Uncomment AUTOSTART="all"

    sudo service openvpn start

    You should see a message saying that you are connected. The connection will be established every time you start your computer.

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

### Com3 used to listen "PAID" message

