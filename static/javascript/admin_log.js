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
        let logs = res.data.sort(compareLogs).slice(1);

        logTableElem.innerHTML = '';

        let titleRowElem = document.createElement('tr');
        titleRowElem.innerHTML = '<th></th>'
        for (let i = 0; i < problemNum; i++) {
          let titleColElem = document.createElement('th');
          titleColElem.innerHTML = `problem ${i + 1}`;
          titleRowElem.appendChild(titleColElem);
        }
        logTableElem.appendChild(titleRowElem);

        for (let i = 1; i <= logs.length; i++) {
          let rowElem = document.createElement('tr');
          let classNameElem = document.createElement('td');
          classNameElem.innerHTML = `class ${i}`;
          rowElem.appendChild(classNameElem);

          let log = logs[i - 1];
          for (let j = 0; j < problemNum; j++) {
            let colElem = document.createElement('td');
            if (j < log.log_start.length) colElem.innerHTML = `${dateToTime(new Date(log.log_start[j]))}<br />`;
            else colElem.innerHTML = '--:--:--<br />';
            if (j < log.log_end.length) colElem.innerHTML += `${dateToTime(new Date(log.log_end[j]))}`;
            else colElem.innerHTML += '--:--:--';
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

function dateToTime(date) {
  return `${date.getHours() < 10 ? 0 + String(date.getHours()) : date.getHours()}`
          + `:${date.getMinutes() < 10 ? 0 + String(date.getMinutes()) : date.getMinutes()}`
          + `:${date.getSeconds() < 10 ? 0 + String(date.getSeconds()) : date.getSeconds()}`;
}

function compareLogs(log1, log2) {
  if (log1 === 'admin') return -1;
  if (log2 === 'admin') return 1;

  let num1 = Number(log1.id.substring(5)), num2 = Number(log2.id.substring(5));
  if (num1 < num2) return -1;
  if (num1 == num2) return 0;
  return 1;
}
