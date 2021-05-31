require('dotenv').config();
const crypto = require('crypto');
//const { nextTick } = require('process');
const ctoken = require('../jwt');

module.exports = (req, res, next) => {
    let { AccessToken } = req.cookies

    if (AccessToken == undefined) {   // 토큰이 없다면
        res.redirect('/?msg=로그인을 진행해주세요')
    }

    let [header, payload, sign] = AccessToken.split('.');            //  배열에 넣는다는 얘기
    let signature = getSignature(header, payload);   // 2. 새로이 다시 암호화하기 위한 작업
    console.log(signature);         // 3. 생성이 된거임


    if (sign == signature) {   
        console.log('검증된 토큰입니다');   
       
        let { userid, exp } = JSON.parse(Buffer.from(payload, 'base64').toString())
        //console.log(userid);
        console.log(exp);       // 얘는 무슨 역할을 하는 변수일까? - 현재 시간으로부터 2시간 뒤를 저장한 getTime 내용이다.
        // 토큰을 생성한 시간으로부터 두시간뒤의 시간을 저장한 변수이다.
        let nexp = new Date().getTime();    // 현재시간을 초로 나타낸것 2시간 이내인지 비교하려고 만듬

        if (nexp > exp) {
            res.clearCookie('AccessToken')
            res.redirect('/?msg=토큰만료')
        }
       
        req.userid = userid
        next();     // 다음 로직으로 넘어가라
    } else {
        res.redirect('/?msg=부적절한토큰')
    }
}

//1.  jwt.js 에서 만들었던 signature 그대로 가져와서 인자 값만 변경해줌
function getSignature(header, payload) {
    const signature = crypto.createHmac('sha256', Buffer.from(process.env.salt))
        .update(header + "." + payload)
        .digest('base64')
        .replace('=', '')
        .replace('==', '');
    return signature;
}