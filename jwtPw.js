const crypto = require('crypto');  


function jwtPW(userpw){
    const cryptopw = crypto.createHash('sha256',Buffer.from(userpw).toString())
                            .digest('base64')
                            .replace('=','')
                            .replace('==','');
    return cryptopw;
}

module.exports = jwtPW;

