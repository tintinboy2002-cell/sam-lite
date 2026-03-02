const os = require('os');

function SystemIpLogger() {
  this.getSystemIp = async function () {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
           return iface.address;
        }
      }
    }
    return 'IP not found';
  };
}

module.exports = new SystemIpLogger();