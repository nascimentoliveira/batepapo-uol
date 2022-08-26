let participant;
let idKeepConnection;
let idUpdateMessages;

const timeIntervalStatus = 5000;
const timeIntervalUpdate = 3000;

function processErrorLogon(reply) {
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
    logon();
}

function processErrorStatus(reply) {
	alert("Conexão perdida!")
    clearInterval(idKeepConnection);
    clearInterval(idUpdateMessages);
}

function keepConnection() {
    const promisse = axios.post("https://mock-api.driven.com.br/api/v6/uol/status", participant);
    promisse.catch(processErrorStatus);
}

function processResponseLogon(reply) {
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
    promisse.catch(processErrorLogon);
    return {name: nickname};
}

function updateMessages() {
    const promisse = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    promisse.then(processResponseMessages);
}   

function canRead(message) {
    if (message.to === "Todos" || message.to === participant.name) {
        return true;
    } else {
        return false;
    }
}

function processResponseMessages(reply) {
    const messages = reply.data.filter(canRead);
    messages.forEach(showMessage);
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
}

participant = logon();