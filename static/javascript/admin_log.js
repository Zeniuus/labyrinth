let $document = $(document);
$document.ready(() => {
  let logTableElem = document.getElementById('log_table');
  let problemNum = -1;

  axios.get('/admin/problems')
  .then((res) => {
    problemNum = res.data.length;
    setInterval(() => {
      axios.get('/admin/logs')
      .then((res) => {
        let logs = res.data;

        logTableElem.innerHTML = '';

        let titleRowElem = document.createElement('tr');
        titleRowElem.innerHTML = '<th></th>'
        for (let i = 0; i < problemNum; i++) {
          let titleColElem = document.createElement('th');
          titleColElem.innerHTML = `problem ${i}`;
          titleRowElem.appendChild(titleColElem);
        }
        logTableElem.appendChild(titleRowElem);

        for (let i = 1; i <= logs.length - 1; i++) {
          let rowElem = document.createElement('tr');
          let classNameElem = document.createElement('td');
          classNameElem.innerHTML = `class ${i}`;
          rowElem.appendChild(classNameElem);
          for (let j = 0; j < problemNum; j++) {
            let colElem = document.createElement('td');
            colElem.innerHTML = `${i}, ${j}`;
            rowElem.appendChild(colElem);
          }
          logTableElem.appendChild(rowElem);
        }
      })
      .catch((err) => {
        console.log(err);
      });
    }, 1000);
  })
  .catch((err) => {
    console.log(err);
  });
});
