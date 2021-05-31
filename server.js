const express = require('express');
const nunjucks = require('nunjucks');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const {sequelize} = require('./models/index');    //객체
const {User} = require('./models/index');       //User라는 객체를 가져오기 위해서 접근
const Sequelize = require('sequelize');
const jwtPW = require('./jwtPw');

const mysql = require('mysql2');

const ctoken = require('./jwt'); //jwt.js 가져옴
const auth = require('./middleware/auth')   // auth.js 가져옴
const app = express();

const crypto = require('crypto');  

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());

app.use(express.static('public'));

app.set('view engine','html');
nunjucks.configure('views',{
    express:app,
})

sequelize.sync({ force : false, })
.then(()=>{
    console.log('접속 성공');
})
.catch(()=>{
    console.log('접속 실패');
})


app.get('/',(req,res)=>{
    res.render('index')
})

app.post('/auth/local/login', async (req,res)=>{
    console.log(req.body);
    let {userid, userpw} = req.body;

    let Cuserpw = crypto.createHash('sha256',Buffer.from(userpw).toString())
                        .digest('base64')
                        .replace('=','')
                        .replace('==','');
    console.log(Cuserpw);

    let loginResult = await User.findOne({
        where:{userid,userpw:Cuserpw}
    })

    //console.log(loginResult);

    // 로그인 할때 암호화된 것을 풀어서 이게 사용자가 입력한 값이랑 맞는지를 봐야된다

    if(loginResult != null){
        result = {
            result : true,
            msg : '로그인 성공'
        }
        let token = ctoken(userid);
        console.log(token)
        res.cookie('AccessToken',token,{httpOnly:true,secure:true});
    } else{
        result = {
            result : false,
            msg : '아이디 패스워드 확인해주세요'
        }
    }
    res.json(result)
})
   

app.get('/user/info',auth, (req,res)=>{
    // session에 저장해서 id값을 저장해서 받아오자
    //console.log(req);
    res.send(`hello ${req.userid}`);

})

app.get('/user/join',(req,res)=>{
    res.render('join');
})

app.post('/auth/local/join', async (req,res)=>{
    console.log(req.body);
    let {userid, userpw, username} = req.body;

    
    let pwtoken = jwtPW(userpw)

    
    //console.log(Cuserpw);
    // 계정 만들때 암호화
    let result = await User.create({
        userid,
        userpw:pwtoken,
        username
    });
    res.json({result})
})

app.get('/user/joinSuccess',(req,res)=>{
    //console.log(req.query);
    //let{username} = req.body;
    res.render('join_success.html',{username:req.query.username})
})

app.listen(3000,()=>{
    console.log('server 3000');
})