document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose2').addEventListener('click', compose_email);
  document.querySelector('#sendmail').addEventListener('click', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email').style.display = 'none';
  document.querySelector('#intro').style.display = 'none';
  document.querySelector('#compose2').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  document.querySelector('#compose-photo').value = '';

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'grid';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email').style.display = 'none';
  document.querySelector('#intro').style.display = 'none';
  document.querySelector('#compose2').style.display = 'none';
  

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  fetch('/emails/'+ mailbox)
  .then(response => response.json())
  .then(emails => {

      // Print emails
      for (let i = 0; i < emails.length; i++) {
        const email_div = document.createElement('div');
        email_div.classList.add('email');
        email_div.innerHTML = `<div class="subject">Subject: ${emails[i].subject}</div><div class="from">From: ${emails[i].sender}</div><div class="image"><img src="${emails[i].photo}"></div><div class="date">Date: ${emails[i].timestamp}</div>`;

        document.querySelector('#emails-view').append(email_div);


        email_div.addEventListener('click', () => load_email(emails[i].id));

        email_div.style.backgroundColor = 'white';


        if (mailbox == 'inbox') {

          document.querySelector('#intro').style.display = 'block';
          document.querySelector('#compose2').style.display = 'block';

          const archived_btn = document.createElement('input');

          archived_btn.setAttribute('type','submit')
          archived_btn.setAttribute('class', 'archive_btn')
          
          archived_btn.setAttribute('value','Archive')

          archived_btn.classList.add('archivedbtn');

          email_div.append(archived_btn);

          archived_btn.addEventListener('click', () => {

            fetch(`emails/${emails[i].id}`,{
              method: 'PUT',

              body: JSON.stringify({
                archived: true
              })
            })
            location.reload();
          });          
        }

        
        if (mailbox == 'archive') {

          const unarchived_btn = document.createElement('input');
          unarchived_btn.setAttribute('type','submit')
          unarchived_btn.setAttribute('class','archive_btn')
          unarchived_btn.setAttribute('value','Unarchive')

          unarchived_btn.classList.add('unarchivedbtn');

          email_div.append(unarchived_btn);

          unarchived_btn.addEventListener('click', () => {
            fetch(`emails/${emails[i].id}`,{
              method: 'PUT',

              body: JSON.stringify({
                archived: false
              })
            })
            location.reload();
          });
        }
        
      }
  });
}

let like_count;

function load_email(id) {


  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#intro').style.display = 'none';
  document.querySelector('#compose2').style.display = 'none';


  fetch( `/likes/${id}`)
  .then(respone => respone.json())
  .then(info => {
    like_count = info.like
    return fetch('emails/' + id);
  })

  .then(response => response.json())
  .then(emailas => {
    
    let change;
    if (emailas.long == true) {
      change = 'long';
    }
    else {
      change = 'short'
    }
    
    document.querySelector('#email').innerHTML = `<div>Change: ${change}</div><div>Subject: ${emailas.subject}</div><div>From: ${emailas.sender}</div><div>Date: ${emailas.timestamp}</div><div>${emailas.body}</div><div class="emailas_photo"><img src="${emailas.photo}"></div><div id="like_div">Likes: ${like_count}</div>`;
    
    let like = document.createElement("button");
    like.setAttribute("id", "like")
    like.setAttribute("placeholder", "like")

    let like_img = document.createElement("img");
    like_img.setAttribute("src", "/static/mail/like.png")
    like_img.setAttribute("id", "like_img")

    like.append(like_img)
    document.querySelector('#email').append(like)

    like.addEventListener('click', () => likes(id));
    });

  fetch(`emails/${id}`,{
    method: 'PUT',

    body: JSON.stringify({
      read: true
    })
  })
}

function likes(id) {

  like_count++;

  fetch(`/likes/${id}`, {
    method: 'POST',
    body: JSON.stringify({
      'like': like_count
    })
  })
  .then(response => response.json())
  document.querySelector('#like_div').innerHTML = `Likes: ${like_count}`;

}

function send_email(e) {

  e.preventDefault()

  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  const photo = document.querySelector('#compose-photo').value;
  const change = document.querySelector('#compose-change').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        "subject": subject,
        "body": body,
        "photo": photo,
        "long": change
    }),
  })
  .then((response) => response.json())
  return load_mailbox('sent')
}