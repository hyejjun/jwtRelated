const express = require('express');
const cookieParser = require('cookie-parser');
const ctoken = require('./jwt');
const chash = require('./chash')
const app = express();
const nunjucks = require('nunjucks')
const bodyParser = require('body-parser')
const auth = require('./middleware/auth')
const { sequelize, User } = require('./models')
//npm install socket.io
const socket = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = socket(server);
// app.listen -> server.listen 변경하기

app.set('view engine', 'html')

app.use(express.static('public'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

nunjucks.configure('views', {
    express: app,
})

app.use(cookieParser());

sequelize.sync({ force: false })
    .then(() => { // resolve
        console.log('DB접속이 완료되었습니다.')
    })
    .catch((err) => { // reject
        console.log(err)
    })

app.get('/', (req, res) => {
    let { msg } = req.query;
    res.render('index')
})

app.get('/user/info', auth, (req, res) => {
    res.send(`Hello ${req.userid}`)
})

app.get('/user/join', (req, res) => {
    res.render('join')
})

app.get('/user/userid_check', async (req, res) => {
    userid = req.query.userid
    result = await User.findOne({
        where: { userid }
    })
    if (result == undefined) {
        check = true;
    } else {
        check = false;
    }
    res.json({ check })
})


app.post('/user/join_success', async (req, res) => {
    let { userid, userpw, username, gender, userimage, useremail } = req.body
    let token = chash(userpw)
    let result = await User.create({
        userid, token, username, gender, useremail, userimage
    })
    res.json({ result })
})


app.post('/auth/local/login', async (req, res) => {
    let { userid, userpw } = req.body
    // let {userid2, userpw2} = JSON.parse(req.get('data'))
    console.log('body req :', userid, userpw)
    // console.log('data req :',userid2, userpw2)
    let result = {}
    let token = chash(userpw)
    let check = await User.findOne({
        where: { userid, token }
    })
    let token2 = ctoken(userid)
    if (check == null) {
        result = {
            result: false,
            msg: '아이디와 패스워드를 확인해주세요'
        }
    } else {
        result = {
            result: true,
            msg: '로그인에 성공하셨습니다.'
        }
        res.cookie('AccessToken', token2, { httpOnly: true, secure: true, })
    }
    res.json(result)
})

// 로그인 안되면 채팅 쪽 못들어가게
app.get('/chat', auth, (req, res) => {
    //console.log('asdf')
    res.render('chat')
})
// 웹 소켓이 왔을때 한번의 http 통신을 할 때 
// 접속한 사람의 id값을 가져올 수 있도록 처리함
let id;
io.sockets.on('connection', socket => {

    let cookieString = socket.handshake.headers.cookie;

    if (cookieString != undefined) {     // cookie 값이 없을 때(로그인 안되어있으면)는 이 밑에 부분을 실행하지 않겠다
        let cookieArr = cookieString.split(';')         // 특정 글자 기준으로 배열에 담겠다는 매서드
        cookieArr.forEach(v => {
            let [name, value] = v.split('=');

            if (name.trim() == 'AccessToken') {
                let jwt = value.split('.');
                let payload = Buffer.from(jwt[1], 'base64').toString() //복호화
                let { userid } = JSON.parse(payload);     //비구조 할당문
                //console.log(userid);
                id = userid;
            }
        })
    }
    console.log("로그인한 id = ",id);        //접속한 사람의 아이디를 가져옴
    socket.emit('id',id);
    //send 했을때
    socket.on('send', data=>{
        console.log(id,"msg 전송 = ",data);
        socket.broadcast.emit('msg',data);  // 3-1. 여기서 메시지 보내줌
    })
})


server.listen(3000, () => {
    console.log('server start port: 3000');
})