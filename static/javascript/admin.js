let $document = $(document);

$document.ready(() => {
  let problemListElem = document.getElementById('problem_list');
  let titleInputElem = document.getElementById('title_input');
  let numberInputElem = document.getElementById('number_input');
  let imageInputElem = document.getElementById('image_input');
  let answerInputElem = document.getElementById('answer_input');
  let hint1InputElem = document.getElementById('hint1_input');
  let hint2InputElem = document.getElementById('hint2_input');
  let hint3InputElem = document.getElementById('hint3_input');

  axios.get('/admin/problems')
  .then((res) => {
    for (let i = 0; i < res.data.length; i++) {
      let problemItemElem = document.createElement('div');
      problemItemElem.innerHTML = `
        <p>문제 이름 : ${res.data[i].title}</p>
        <p>문제 번호 : ${res.data[i].number}</p>
        <p>문제 사진 :</p>
        <img src="/problemImages/${res.data[i].imageName}" width="600"/>
        <p>문제 답 : ${res.data[i].answer}</p>
        <p>문제 힌트1 : ${res.data[i].hint[0]}</p>
        <p>문제 힌트2 : ${res.data[i].hint[1]}</p>
        <p>문제 힌트3 : ${res.data[i].hint[2]}</p>
        <hr />
      `
      problemListElem.appendChild(problemItemElem);
    }
  })
  .catch((err) => {
    console.log(err);
  });

  $('#new_problem_btn').click((e) => {
    let fd = new FormData();
    let imageFile = imageInputElem.files[0];
    fd.append(imageFile.name, imageFile);
    axios.post('/admin/problems/detail', {
      title: titleInputElem.value,
      number: numberInputElem.value,
      imageName: imageFile.name,
      answer: answerInputElem.value,
      hint1: hint1InputElem.value,
      hint2: hint2InputElem.value,
      hint3: hint3InputElem.value,
    })
    .then((res) => {
      console.log('first success');
      axios.post('/admin/problems/image', fd)
      .then((res) => {
        console.log('second success');
        location.reload();
      })
      .catch((err) => {
        console.log(err);
      });
    })
    .catch((err) => {
      console.log(err);
    });

    console.log({
      title: titleInputElem.value,
      number: numberInputElem.value,
      imageName: imageFile.name,
      answer: answerInputElem.value,
      hint1: hint1InputElem.value,
      hint2: hint2InputElem.value,
      hint3: hint3InputElem.value,
    });
  });
});
