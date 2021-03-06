document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#view-email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}


// Send email
function send_email() {

  // Query the values from the compose form
  var recipients = document.querySelector('#compose-recipients').value;
  var subject = document.querySelector('#compose-subject').value;
  var body = document.querySelector('#compose-body').value;

  // Post the data to the email JSON
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    // Print result
    console.log(result);
  })
  .catch(error => {
    console.log('Error:', error);
    alert(error);
  });  

}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);
    // For each email create a div to put into the emails-view
    emails.forEach(email => {
      const element = document.createElement('div');
      element.setAttribute('class', 'border border-dark element');
      element.setAttribute('id', `${email.id}`);
      element.innerHTML = `<div id="sender"><b>${email.sender}</b>&nbsp;&nbsp;${email.subject}</div>`;
      element.innerHTML += `<div id="time">${email.timestamp}</div>`;
      // Append the element to the emails-view
      document.querySelector('#emails-view').append(element);
      // Check if email has been read already
      if (email.read === true) {
        element.style.backgroundColor = 'lightgrey';
      }
      // Add eventListener
      element.addEventListener('click', () => {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        })
        view_email(email.id);
      })
    })
  })

}


function view_email(id) {

  // Show view-email and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'block';

  // Reset view-email with blank slate
  document.querySelector('#view-email').innerHTML = '';

  // Fetch email information
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Create From, To, Subject, Timestamp, Body divs
    var from = document.createElement('div');
    var to = document.createElement('div');
    var subject = document.createElement('div');
    var time = document.createElement('div');
    var body = document.createElement('div');
    const line = document.createElement('hr');

    // Add innerHTML to the divs
    from.innerHTML = `<b>From: </b>${email.sender}`;
    to.innerHTML = `<b>To: </b>${email.recipients}`;
    subject.innerHTML = `<b>Subject: </b>${email.subject}`;
    time.innerHTML = `<b>Timestamp: </b>${email.timestamp}`;
    body.innerHTML = '<pre>' + email.body + '</pre>';

    document.querySelector('#view-email').append(from);
    document.querySelector('#view-email').append(to);
    document.querySelector('#view-email').append(subject);
    document.querySelector('#view-email').append(time);

    // Add reply and archive buttons
    var reply_archive = document.createElement('div');
    if (email.archived === false) {
      var archive_button = 'Archive';
    }
    else {
      var archive_button = 'Unarchive';
    }
    reply_archive.innerHTML = `<button type="button" class="btn btn-primary btn-sm" id="reply">Reply</button> <button type="button" class="btn btn-success btn-sm" id="archive">${archive_button}</button>`;
    document.querySelector('#view-email').append(reply_archive);

    // Add line break
    document.querySelector('#view-email').append(line);

    // Add email body
    document.querySelector('#view-email').append(body);

    // If user clicks on reply button
    document.getElementById('reply').addEventListener('click', () => {
      reply_email(email.sender, email.subject, email.body, email.timestamp);
    })

    // If user click on archive button
    document.getElementById('archive').addEventListener('click', () => {
      archive_email(email.id, email.archived);
    })
  })
  
}


function reply_email(sender, subject, body, time) {
  
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#view-email').style.display = 'none';

  // Prefill the fields with the correct data
  document.querySelector('#compose-recipients').value = sender;
  // Add "Re: " to subject unless it already has it
  if (subject.match(/Re: .*/)) {
    document.querySelector('#compose-subject').value = subject;
  }
  else {
    document.querySelector('#compose-subject').value = `Re: ${subject}`;
  }
  document.querySelector('#compose-body').value = (
`
  
On ${time} ${sender} wrote:
${body}`
  );
  // Set the autofocus to be on the body input, and the cursor to start at the beginning
  document.querySelector('#compose-body').focus();
  document.querySelector('#compose-body').setSelectionRange(0, 0);

}


function archive_email(id, archived) {

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: !archived
    })
  })
  // Update Archive/Unarchive button
  .then(() => {
    if (archived === false) {
      document.querySelector('#archive').innerHTML = 'Unarchive';
    }
    else {
      document.querySelector('#archive').innerHTML = 'Archive';
    } 
  })
  // Load the inbox
  .then(() => {
    load_mailbox('inbox');
  })

}