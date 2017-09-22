let $document = $(document);

$document.ready(() => {
  console.log(window.location.pathname);
  let pathname = window.location.pathname;
  let problemNum = pathname.split('/')[2];
  let answerInputElem = document.getElementById('answer_input');

  $('#submit_btn').click((e) => {
    axios.post(pathname + '/answer', {
      answer: answerInputElem.value
    })
    .then((res) => {
      if (res.data.correct) window.location.replace('/problems/' + (Number(problemNum) + 1));
      else window.location.replace('/problems/' + problemNum);
    })
    .catch((err) => {

    });
  });
});
