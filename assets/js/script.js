let participant;
let idKeepConnection;
let idUpdateMessages;
let messagesShown = [];

const timeIntervalStatus = 5000;
const timeIntervalUpdate = 3000;

function processError(reply) {
	switch (reply.response.status) {
        case (400):
            alert("A conexão foi recusada!");
            alert("Este nickname já está sendo utilizado!");
            break;
        case (404):
            alert("Servidor não encontrado!");
            break;
        case (409):
            alert("O recurso que você está tentando inserir já foi inserido");
            break;
        case (422):
            alert("Formato da mensagem insperado!");
            break;
        default:
            alert(`Erro ${reply.response.status}: ${reply.response.statusText}`)
    }
    clearInterval(idKeepConnection);
    clearInterval(idUpdateMessages);
    logon();
}

function keepConnection() {
    const promisse = axios.post("https://mock-api.driven.com.br/api/v6/uol/status", participant);
    promisse.catch(processError);
}

function processResponseLogon(response) {
    idKeepConnection = setInterval(keepConnection, timeIntervalStatus);
    idUpdateMessages = setInterval(updateMessages, timeIntervalUpdate);
}

function logon() {
    let nickname;
    do {
        nickname = prompt("Insira seu nickname:");
        if (nickname === null || nickname === undefined || nickname.trim().length === 0) {
            alert("É necessário inserir um nickname!");
        }
    } while (nickname === null || nickname === undefined || nickname.trim().length === 0);
    const promisse = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", {name: nickname});
    promisse.then(processResponseLogon);
    promisse.catch(processError);
    return {name: nickname};
}

function updateMessages() {
    const promisse = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    promisse.then(processResponseMessages);
    promisse.catch(processError);
}   

function canRead(message) {
    if (message.to === "Todos" || message.to === participant.name) {
        return true;
    }
}

function newMessages(messagesArrived, lastMessageShown) {
    let i;
    for (i = messagesArrived.length - 1; i > 0; i--) {
        if (Object.values(messagesArrived[i]) + "" === Object.values(lastMessageShown) + "") {
            break;
        }
    }
    return messagesArrived.slice(i + 1);
}

function processResponseMessages(response) {
    let messagesArrived = response.data.filter(canRead);
    if (messagesShown.length !== 0) {
        const lastMessageShown = messagesShown[messagesShown.length - 1];
        messagesArrived = newMessages(messagesArrived, lastMessageShown);
    }
    messagesShown = messagesShown.concat(messagesArrived);
    messagesArrived.forEach(showMessage);
}

function showMessage(message) {
    const main = document.querySelector("main");
    main.innerHTML +=  `<section class="message-box ${message.type}">
                            <span class="message-content">
                                <span class="time">(${message.time})</span>
                                <span class="sender-receiver"><strong>${message.from}</strong> para <strong>${message.to}: </strong></span>
                                <span class="text">${message.text}</span>
                            </span>
                        </section>`;
    const messages = main.querySelectorAll(".message-box");
    messages[messages.length - 1].scrollIntoView();
}

function sendMessage() {
    const input = document.querySelector("footer input");
    if (input.value.trim().length > 0) {
        const messageToSend = {
                                from: participant.name,
                                to: "Todos",
                                text: input.value.trim(),
                                type: "message"
                            };
        const promisse = axios.post("https://mock-api.driven.com.br/api/v6/uol/messages", messageToSend);
        promisse.then(updateMessages);
        promisse.catch(processError);
    }
    input.value = "";
}

participant = logon();