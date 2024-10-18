function areInputsFilled(inputs) {
  return Array.from(inputs).every(input => input.value.trim() !== "");
}

function canSendAction(...inputs) {
  const instanceFieldsFilled = areInputsFilled([idInstance, apiTokenInstance]);
  return instanceFieldsFilled && areInputsFilled(inputs);
}

function toggleButtonState(inputs, button) {
  button.disabled = !canSendAction(...inputs);
}

const idInstance = document.getElementById('idInstance');
const apiTokenInstance = document.getElementById('apiTokenInstance');
const inputAlert = document.getElementById('input-alert');
const settingsButton = document.getElementById('getSettings');
const stateButton = document.getElementById('getStateInstance');
const sendMessageButton = document.getElementById('sendMessage');
const sendFileButton = document.getElementById('sendFileByUrl');

const chatIdMessage = document.getElementById('chatIdMessage');
const chatIdMessageAlert = document.getElementById('chatIdMessageAlert');
const message = document.getElementById('message');
const messageLengthAlert = document.getElementById('messageLengthAlert');

const chatIdFile = document.getElementById('chatIdFile');
const chatIdFileAlert = document.getElementById('chatIdFileAlert');
const fileInput = document.getElementById('fileInput');
const fileSizeAlert = document.getElementById('fileSizeAlert');
const urlFile = document.getElementById('urlFile');
const urlAlert = document.getElementById('url-alert');

const chatIdRegex = /^[\d]+@c\.us|[\d]+-?[\d]*@g\.us$/;

function validateChatId(input, alert) {
  const isValid = chatIdRegex.test(input.value.trim());
  alert.classList.toggle('d-none', isValid || input.value.trim() === "");
}

function validateFileSize(input, alert) {
  const file = input.files[0];
  const isValid = !file || file.size < 100 * 1024 * 1024; // 100 MB
  alert.classList.toggle('d-none', isValid);
}

function validateMessageLength(input, alert) {
  const isValid = input.value.length <= 20000;
  alert.classList.toggle('d-none', isValid);
}

[idInstance, apiTokenInstance].forEach(input => {
  input.addEventListener('input', () => {
    const allFilled = areInputsFilled([idInstance, apiTokenInstance]);
    inputAlert.classList.toggle('d-none', allFilled);
    settingsButton.disabled = stateButton.disabled = !allFilled;
    toggleButtonState([chatIdMessage, message], sendMessageButton);
    toggleButtonState([chatIdFile, urlFile], sendFileButton);
  });
});

chatIdMessage.addEventListener('input', () => {
  validateChatId(chatIdMessage, chatIdMessageAlert);
  toggleButtonState([chatIdMessage, message], sendMessageButton);
});

message.addEventListener('input', () => {
  validateMessageLength(message, messageLengthAlert);
});

chatIdFile.addEventListener('input', () => {
  validateChatId(chatIdFile, chatIdFileAlert);
  toggleButtonState([chatIdFile, urlFile], sendFileButton);
});

urlFile.addEventListener('input', () => {
  const isValidUrl = /^https?:\/\/[^\s~$€%#£?!]*$/.test(urlFile.value);
  urlAlert.classList.toggle('d-none', isValidUrl || urlFile.value.trim() === "");
  toggleButtonState([chatIdFile, urlFile], sendFileButton);
});

fileInput.addEventListener('change', () => {
  validateFileSize(fileInput, fileSizeAlert);
});

const apiUrl = 'https://1103.api.green-api.com';
const mediaUrl = 'https://1103.media.green-api.com';

document.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', () => {
    const idInstance = document.getElementById('idInstance').value;
    const apiTokenInstance = document.getElementById('apiTokenInstance').value;

    switch (button.id) {
      case 'getSettings':
        callGetSettings(idInstance, apiTokenInstance);
        break;
      case 'getStateInstance':
        callGetStateInstance(idInstance, apiTokenInstance);
        break;
      case 'sendMessage':
        callSendMessage(idInstance, apiTokenInstance);
        break;
      case 'sendFileByUrl':
        callSendFileByUrl(idInstance, apiTokenInstance);
        break;
    }
  });
});

function callGetSettings(idInstance, apiTokenInstance) {
  fetch(`${apiUrl}/waInstance${idInstance}/getSettings/${apiTokenInstance}`)
    .then(response => response.json())
    .then(data => setResponse(JSON.stringify(data)))
    .catch(error => setResponse(`Error: ${error}`));
}

function callGetStateInstance(idInstance, apiTokenInstance) {
  fetch(`${apiUrl}/waInstance${idInstance}/getStateInstance/${apiTokenInstance}`)
    .then(response => response.json())
    .then(data => setResponse(JSON.stringify(data)))
    .catch(error => setResponse(`Error: ${error}`));
}

function callSendMessage(idInstance, apiTokenInstance) {
  const chatId = document.getElementById('chatIdMessage').value;
  const message = document.getElementById('message').value;

  fetch(`${apiUrl}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  })
    .then(response => response.json())
    .then(data => setResponse(JSON.stringify(data)))
    .catch(error => setResponse(`Error: ${error}`));
}

function callSendFileByUrl(idInstance, apiTokenInstance) {
  const chatId = document.getElementById('chatIdFile').value;
  const urlFile = document.getElementById('urlFile').value;
  const fileName = getFileName(urlFile);

  fetch(`${apiUrl}/waInstance${idInstance}/sendFileByUrl/${apiTokenInstance}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, urlFile, fileName }),
  })
    .then(response => response.json())
    .then(data => setResponse(JSON.stringify(data)))
    .catch(error => setResponse(`Error: ${error}`));
}

function getFileName(url) {
  return url.split('/').pop();
}

document.getElementById('fileInput').addEventListener('input', uploadFile);

function uploadFile() {
  const idInstance = document.getElementById('idInstance').value;
  const apiTokenInstance = document.getElementById('apiTokenInstance').value;
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  const uploadFileFinishedAlert = document.getElementById('uploadFileFinishedAlert');
  const uploadFileNotReadyAlert = document.getElementById('uploadFileNotReadyAlert');
  const uploadFileFailedAlert = document.getElementById('uploadFileFailedAlert');

  [uploadFileFinishedAlert, uploadFileNotReadyAlert, uploadFileFailedAlert].forEach(alert => {
    alert.classList.add('d-none');
  });

  if (!idInstance || !apiTokenInstance) {
    uploadFileNotReadyAlert.classList.remove('d-none');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  fetch(`${mediaUrl}/waInstance${idInstance}/uploadFile/${apiTokenInstance}`, {
    method: 'POST',
    headers: { 'GA-Filename': file.name },
    body: formData,
  })
    .then(response => response.json())
    .then(data => {
      document.getElementById('urlFile').value = data.urlFile;
      uploadFileFinishedAlert.classList.remove('d-none');
    })
    .catch(() => {
      uploadFileFailedAlert.classList.remove('d-none');
    });
}

function setResponse(response) {
  document.getElementById('response').textContent = response;
}

