let $document = $(document);

$document.ready(() => {
  let loginBtnEle = document.getElementById('login_btn');
  let idInputEle = document.getElementById('id_input');
  let pwInputEle = document.getElementById('pw_input');
  
  if (sessionStorage.id) {
    document.getElementById('before_login').style.visibility = 'hidden';
    document.getElementById('after_login').style.visibility = 'visible';
  }

  loginBtnEle.onclick = (e) => {
    let idVal = idInputEle.value;
    let pwVal = pwInputEle.value;
    axios.post('/login', {
      id: idVal,
      pw: pwVal,
    })
    .then((res) => {
      sessionStorage.setItem('id', idVal);
      sessionStorage.setItem('pw', pwVal);
      location.reload();
    })
    .catch((err) => {

    });
  };
});
