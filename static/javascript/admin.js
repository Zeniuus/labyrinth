let $document = $(document);

$document.ready(() => {
  let titleInputElem = document.getElementById('title_input');
  let numberInputElem = document.getElementById('number_input');
  let photoInputElem = document.getElementById('photo_input');
  let solutionInputElem = document.getElementById('solution_input');
  let hint1InputElem = document.getElementById('hint1_input');
  let hint2InputElem = document.getElementById('hint2_input');
  let hint3InputElem = document.getElementById('hint3_input');

  $('#new_problem_btn').click(() => {
    let fd = new FormData();
    let photoFile = photoInputElem.files[0];
    fd.append(photoFile.name, photoFile);
    axios.post('http://localhost:3000/admin/problems/detail', {
      title: titleInputElem.value,
      number: numberInputElem.value,
      photoName: photoFile.name,
      solution: solutionInputElem.value,
      hint1: hint1InputElem.value,
      hint2: hint2InputElem.value,
      hint3: hint3InputElem.value,
    })
    .then((res) => {
      console.log('first success');
      axios.post('http://localhost:3000/admin/problems/photo', fd)
      .then((res) => {
        console.log('second success');
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
      photoName: photoFile.name,
      solution: solutionInputElem.value,
      hint1: hint1InputElem.value,
      hint2: hint2InputElem.value,
      hint3: hint3InputElem.value,
    })
  });
});
