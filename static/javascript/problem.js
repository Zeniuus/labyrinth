let $document = $(document);

$document.ready(() => {
  let pathname = window.location.pathname;
  let problemNum = pathname.split('/')[2];
  let answerInputElem = document.getElementById('answer_input');
  let timerElem = document.getElementById('timer');
  let hintsElem = document.getElementById('hints');

  axios.get('/user')
  .then((res) => {
    let user = res.data.user;
    if (problemNum > user.progress) {
      // let pastTime = new Date() - new Date(user.timer_start);
      // let hintNum = pastTime >= 30000 ? 3 : Math.floor(pastTime/10000);
      // updateHint();
      //
      // setInterval(() => {
      //   pastTime = new Date() - new Date(user.timer_start);
      //   timerElem.innerHTML = dateToTimer(pastTime);
      //
      //   if (pastTime >= 30000 && hintNum == 2
      //       || pastTime >= 20000 && hintNum == 1
      //       || pastTime >= 10000 && hintNum == 0) {
      //     hintNum += 1;
      //     updateHint();
      //     alert('new hint arrived!');
      //   }
      // }, 100);
      const pastTime = res.data.pastTime;
      let timer = res.data.pastTime;

      updateHint();

      if (pastTime < 30000) {
        setTimeout(() => {
          updateHint();
        }, 30000 - (pastTime - pastTime%1000));
      }
      if (pastTime < 20000) {
        setTimeout(() => {
          updateHint();
        }, 20000 - (pastTime - pastTime%1000));
      }
      if (pastTime < 10000) {
        setTimeout(() => {
          updateHint();
        }, 10000 - (pastTime - pastTime%1000));
      }

      timerElem.innerHTML = dateToTimer(timer);
      setInterval(() => {
        timer += 1000;
        timerElem.innerHTML = dateToTimer(timer);
        console.log(timer);
      }, 1000);
    }
  })
  .catch((err) => {
    console.log(err);
  });

  $('#submit_btn').click((e) => {
    axios.post(pathname + '/answer', {
      answer: answerInputElem.value
    })
    .then((res) => {
      if (res.data.correct) window.location.replace('/stories/' + Number(problemNum));
      else window.location.replace('/problems/' + problemNum);
    })
    .catch((err) => {

    });
  });

  function updateHint() {
    axios.get(`/problems/${problemNum}/hints`)
    .then((res) => {
      let hints = res.data.hints;
      hintsElem.innerHTML = '';
      for (let i = 0; i < hints.length; i++) {
        hintsElem.innerHTML += `<p>${hints[i]}`;
      }
    })
    .catch((err) => {
      console.log(err);
    });
  }
});

function dateToTimer(millisec) {
  let hour = millisec < 3600000 ? 0 : Math.floor(millisec/3600000);
  if (hour == 0) hour = '00';
  else if (hour < 10) hour = '0' + hour;
  let min = millisec < 60000 ? 0 : Math.floor((millisec%3600000)/60000);
  if (min == 0) min = '00';
  else if (min < 10) min = '0' + min;
  let sec = Math.floor((millisec%60000)/1000);
  if (sec == 0) sec = '00';
  else if (sec < 10) sec = '0' + sec;

  return `${hour}:${min}:${sec}`;
}
