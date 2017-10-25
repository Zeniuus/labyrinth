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
    if (problemNum > user.progress) {
      let pastTime = res.data.pastTime;
      let hintNum = pastTime >= 30000 ? 3 : Math.floor(pastTime/10000);
      updateHint();

      axios.get('/timer')
      .then((res) => {
        timerElem.innerHTML = dateToTimer(res.data.pastTime);
      })
      .catch((err) => {
        console.log(err);
      });

      setInterval(() => {
        axios.get('/timer')
        .then((res) => {
          pastTime = res.data.pastTime;
          timerElem.innerHTML = dateToTimer(pastTime);

          if (pastTime >= 30000 && hintNum == 2
              || pastTime >= 20000 && hintNum == 1
              || pastTime >= 10000 && hintNum == 0) {
            hintNum += 1;
            updateHint();
            alert('new hint arrived!');
          }
        })
        .catch((err) => {
          console.log(err);
        });
      }, 1000);
      // axios.get('/timer')
      // .then((res) => {
      //   const pastTime = res.data.pastTime;
      //
      //   updateHint();
      //
      //   if (pastTime < 30000) {
      //     setTimeout(() => {
      //       updateHint();
      //       alert('new hint arrived!');
      //     }, 30000 - (pastTime - pastTime%1000));
      //   }
      //   if (pastTime < 20000) {
      //     setTimeout(() => {
      //       updateHint();
      //       alert('new hint arrived!');
      //     }, 20000 - (pastTime - pastTime%1000));
      //   }
      //   if (pastTime < 10000) {
      //     setTimeout(() => {
      //       updateHint();
      //       alert('new hint arrived!');
      //     }, 10000 - (pastTime - pastTime%1000));
      //   }
      //
      //   axios.get('/timer')
      //   .then((res) => {
      //     timerElem.innerHTML = dateToTimer(res.data.pastTime);
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //   });
      //   setInterval(() => {
      //     axios.get('/timer')
      //     .then((res) => {
      //       timerElem.innerHTML = dateToTimer(res.data.pastTime);
      //     })
      //     .catch((err) => {
      //       console.log(err);
      //     });
      //   }, 1000);
      // })
      // .catch((err) => {
      //   console.log(err);
      // });
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
