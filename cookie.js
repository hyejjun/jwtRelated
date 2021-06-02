let cookie = 'AccessToken=eyJ0cHkiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyaWQiOiJldGUyMyIsImV4cCI6MTYyMjYwNTU5NDExMX0.6%2FRb48bf5VmSq%2FDReaLgrzUOcOexYHKC%2BvU7WwhZM2w; aaaa=aasdfasdffasdgadfasdf; asdfasd=sdfasdfasdfasdf'

let cookieArr = cookie.split(';')
//split -> 특정 글자를 split 인자값 안에 있는 글자 기준으로 잘라서 배열 형태로 반환해준다.
//console.log(cookieArr);
cookieArr.forEach(v=>{
    let [name,value] = v.split('=');
    
    if(name.trim() == 'AccessToken'){
        let jwt = value.split('.');
        let payload = Buffer.from(jwt[1],'base64').toString() //복호화
        let {userid} = JSON.parse(payload);     //비구조 할당문
        console.log(userid);
    }
})

// 위에 코드랑 같은 의미
let [userid] = 
cookie.split(';').filter(v=>v.indexOf('AccessToken') == 0)
                 .map( v=>{
                    let [name,value] = v.trim().split('=');
                    return JSON.parse(Buffer.from(value.split('.')[1],'base64').toString()).userid
                 })
console.log('두번째 방법',userid);
                        