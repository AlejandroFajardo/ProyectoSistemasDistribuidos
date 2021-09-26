#!/bin/bash
echo "
     _                _ _       _               _    
    | |__   ___  __ _| | |_ ___| |__   ___  ___| | __
    | '_ \ / _ \/ _' | | __/ __| '_ \ / _ \/ __| |/ /
    | | | |  __/ (_| | | || (__| | | |  __/ (__|   < 
    |_| |_|\___|\__,_|_|\__\___|_| |_|\___|\___|_|\_\  by Didier                                              

"
repositorio='https://github.com/jhonedisonrod21/lab1.git'
vm_ip_adress='192.168.1.15'
sshpass >> /dev/null || echo "no se encontro sshpass en el sistema, instalando..." && sudo apt-get install -y sshpass >> /dev/null || echo 'no se pudo instalar el sshpass'
responcetime="0,000000"
# hacemos una funcion para hacer las peticiones HTTP a la maquina virtual
healtcheck(){
    $(curl -w "%{time_starttransfer}\n" -o /dev/null -s http://${vm_ip_adress} > time.txt)
}
while true
do
    $(healtcheck) 
    responcetime=$(<time.txt) 
    if [[ $responcetime == '0,000000' ]]; then        
        sshpass -p '123' ssh "root@${vm_ip_adress}" "
            node > /dev/null || echo 'nodejs no instalado en el sistema instalando...' && curl -sL https://deb.nodesource.com/setup_14.x > /dev/null && apt-get install -y nodejs
            cd /
            nohup killall node || echo '****** El servicio no esta activo ******'
            rm -r lab1
            git clone ${repositorio} && echo '****** Clonando el repositorio ******'
            cd lab1
            npm install --loglevel=error > /dev/null
            nohup node server.js > /dev/null 2>&1 &
        "
        echo "se reinicio el servicio :-)"
    else
        echo "
    =====================================================================
    *   el servicio funciona correctamente no se requieren acciones     *
    *   reintentando en 60s                                             *
    *   CTRL +c para salir                                              *
    =====================================================================
        "
    fi
    sleep 60s
done