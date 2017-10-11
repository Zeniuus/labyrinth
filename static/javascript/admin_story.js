let $document = $(document);

$document.ready(() => {
  let storyListElem = document.getElementById('story_list');
  let titleInputElem = document.getElementById('title_input');
  let numberInputElem = document.getElementById('number_input');
  let imageInputElem = document.getElementById('image_input');

  axios.get('/admin/stories')
  .then((res) => {
    res.data.sort((p1, p2) => {
      if (p1.number < p2.number) return -1;
      if (p1.number == p2.number) {
        if (p1.title < p2.title) return -1;
        if (p1.title > p2.title) return 1;
        return 0;
      }
      return 1;
    });
    for (let i = 0; i < res.data.length; i++) {
      let storyItemElem = document.createElement('div');
      storyItemElem.innerHTML = `
        <div>
          <span>스토리 이름 : ${res.data[i].title}</span>
          <button onclick="deleteStory('${res.data[i].title}')" style="float: right">삭제</button>
        </div>
        <p>스토리 번호 : ${res.data[i].number}</p>
        <p>스토리 사진 :</p>
        <img src="/static/storyImages/${res.data[i].imageName}" width="600"/>
        <hr />
      `
      storyListElem.appendChild(storyItemElem);
    }
  })
  .catch((err) => {
    console.log(err);
  });

  $('#new_story_btn').click((e) => {
    let fd = new FormData();
    let imageFile = imageInputElem.files[0];
    fd.append(imageFile.name, imageFile);
    axios.post('/admin/stories/detail', {
      title: titleInputElem.value,
      number: numberInputElem.value,
      imageName: imageFile.name,
    })
    .then((res) => {
      console.log('first success');
      axios.post('/admin/stories/image', fd)
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
  });
});

function deleteStory(title) {
  axios.delete(`/admin/stories/${title}`)
  .then((res) => {
    window.location.reload();
  })
  .catch((err) => {
    console.log(err);
  });
}
