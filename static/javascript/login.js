let $document = $(document);

$document.ready(() => {
  let loginBtnEle = document.getElementById('login_btn');
  let idInputEle = document.getElementById('id_input');
  let pwInputEle = document.getElementById('pw_input');

  loginBtnEle.onclick = (e) => {
    let idVal = idInputEle.value;
    let pwVal = pwInputEle.value;
    axios.post('/login', {
      id: idVal,
      password: pwVal,
    })
    .then((res) => {
      sessionStorage.setItem('id', res.data.id);
      sessionStorage.setItem('name', res.data.name);
      window.location.replace('/main');
    })
    .catch((err) => {
      document.getElementById('login_failed').style.visibility = 'visible';
    });
  };
});
