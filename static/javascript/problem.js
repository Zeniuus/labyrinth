let $document = $(document);

$document.ready(() => {
  let pathname = window.location.pathname;
  let problemNum = pathname.split('/')[2];
  let answerInputElem = document.getElementById('answer_input');
  let timerElem = document.getElementById('timer');
  let hintsElem = document.getElementById('hints');
  let wrongAnswerElem = document.getElementById('wrong_answer');

  axios.get('/user')
  .then((res) => {
    let user = res.data.user;
    if (user.progress + 1 == problemNum && user.timer_start === null)
      window.location.reload();
    if (problemNum > user.progress) {
      let pastTime = res.data.pastTime;
      let hintNum = pastTime >= 15*60*1000 ? 3 : Math.floor(pastTime/(5*60*1000));
      updateHint();

      axios.get('/user')
      .then((res) => {
        timerElem.innerHTML = dateToTimer(res.data.pastTime);
      })
      .catch((err) => {
        console.log(err);
      });

      const timerInterval = setInterval(() => {
        axios.get('/user')
        .then((res) => {
          if (res.data.user.progress + 1 != problemNum) {
            hintsElem.innerHTML = '';
            timerElem.innerHTML = '';
            clearInterval(timerInterval);
          } else {
            pastTime = res.data.pastTime;
            timerElem.innerHTML = dateToTimer(pastTime);

            if (pastTime >= 15*60*1000 && hintNum == 2
                || pastTime >= 10*60*1000 && hintNum == 1
                || pastTime >= 5*60*1000 && hintNum == 0) {
              hintNum += 1;
              updateHint();
              alert('new hint arrived!');
            }
          }
        })
        .catch((err) => {
          console.log(err);
        });
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
      if (res.data.correct) {
        wrongAnswerElem.style.visibility = 'hidden';
        window.location.replace('/stories/' + Number(problemNum));
      } else {
        wrongAnswerElem.style.visibility = 'visible';
      }
    })
    .catch((err) => {
      console.log(err);
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
