document.addEventListener('DOMContentLoaded', init2);
function init2() {
    const localJoin = document.querySelector('#localJoin');
    

    localJoin.addEventListener('click', joinFn);

    async function joinFn() {
        const userid = document.querySelector('#userid');
        const userpw = document.querySelector('#userpw');
        const username = document.querySelector('#username');

        let url = 'http://localhost:3000/auth/local/join';

        let options = {
            method: 'POST',
            headers: {
                'content-type': `application/json`,
            },
            body: JSON.stringify({
                userid: userid.value,
                userpw: userpw.value,
                username: username.value
            })
        }
        await fetch(url, options);
        window.location.href = `http://localhost:3000/user/joinSuccess?username=${username.value}`
        console.log('asdfsadfsadf')
    }
}