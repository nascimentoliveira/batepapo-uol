let participant;
let idKeepConnection;
let idUpdateMessages;
let idParticipantsList;
let participantsList = [];
let messagesShown = [];
let sendTo = "Todos";
let visibilitySelected = "message";
let loginFlag = true;

const intervalCheckStatus = 5000;
const intervalUpdateMessages = 3000;
const intervalParticipantsList = 10000;
const inputMessage = document.querySelector("footer input").addEventListener("keypress", sendEnterMessage);
const inputLogin = document.querySelector(".login input").addEventListener("keypress", sendEnterLogin);

function sendEnterMessage(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.querySelector("footer ion-icon").click();
    }
}

function sendEnterLogin(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.querySelector(".login button").click();
    }
}

function processError(reply) {
	switch (reply.response.status) {
        case (400):
            alert("A conexão foi recusada!")
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
    clearInterval(idParticipantsList);
    window.location.reload();
}

function updateMessages() {
    const promisse = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    promisse.then(responseMessages);
    promisse.catch(processError);
} 

function updateParticipantsList() {
    const promisse = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");
    promisse.then(processParticipantsList);
    promisse.catch(processError);
}   

function processParticipantsList(response) {
    const activeUsers = document.querySelector(".active-users");
    activeUsers.innerHTML = "";
    activeUsers.innerHTML += `<div>Escolha um contato para enviar mensagem:</div>
            <section onclick="select(this)" class="user selected" data-identifier="participant">
                <div>
                    <ion-icon name="people-sharp"></ion-icon>
                    <span>Todos</span>
                </div>
                <ion-icon name="checkmark-sharp"></ion-icon>
            </section>`;
    for (let i = 0; i < response.data.length; i++) {
        activeUsers.innerHTML += `  <section onclick="select(this)" class="user" data-identifier="participant">
                                        <div>
                                            <ion-icon name="person-circle-sharp"></ion-icon>
                                            <span>${response.data[i].name}</span>
                                        </div>
                                        <ion-icon name="checkmark-sharp"></ion-icon>
                                    </section>`;
    }
}

function keepConnection() {
    const promisse = axios.post("https://mock-api.driven.com.br/api/v6/uol/status", participant);
}

function responseLogin(response) {
    //keepConnection()
    updateMessages();
    updateParticipantsList();
    //idKeepConnection = setInterval(keepConnection, intervalCheckStatus);
    idUpdateMessages = setInterval(updateMessages, intervalUpdateMessages);
    idParticipantsList = setInterval(updateParticipantsList, intervalParticipantsList);
}

function login() {
    const spinner = document.querySelector(".login > img");
    const button = document.querySelector(".login button");
    const input = document.querySelector(".login input");
    const span = document.querySelector(".login span")
    let nickname = input.value;
    if (nickname === null || nickname === undefined || nickname.trim().length === 0) {
        alert("É necessário inserir um nickname!");
        window.location.reload();
    }
    button.classList.add("noShow");
    input.classList.add("noShow");
    spinner.classList.remove("noShow");
    span.classList.remove("noShow");
    participant = {name: nickname};
    const promisse = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", participant);
    idKeepConnection = setInterval(keepConnection, intervalCheckStatus);
    promisse.then(responseLogin);
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

function responseMessages(response) {
    const main = document.querySelector("main");
    let messagesArrived = response.data.filter(canRead);
    if (messagesShown.length !== 0) {
        const lastMessageShown = messagesShown[messagesShown.length - 1];
        messagesArrived = newMessages(messagesArrived, lastMessageShown);
    }
    messagesShown = messagesShown.concat(messagesArrived);
    if (loginFlag) {
        loginFlag = false;
        document.querySelector(".login").classList.add("noShow");
        document.querySelector(".website").classList.remove("noShow");
    }
    for (let i = 0; i < messagesArrived.length; i++) {
        main.innerHTML +=  `<section class="message-box ${messagesArrived[i].type}">
                            <span class="message-content">
                                <span class="time">(${messagesArrived[i].time})</span>
                                <span class="sender-receiver"><strong>${messagesArrived[i].from}</strong> para <strong>${messagesArrived[i].to}: </strong></span>
                                <span class="text">${messagesArrived[i].text}</span>
                            </span>
                        </section>`;
    }
    if (loginFlag) {
        loginFlag = false;
        document.querySelector(".login").classList.add("noShow");
        document.querySelector(".website").classList.remove("noShow");
    }
    const messages = main.querySelectorAll(".message-box");
    messages[messages.length - 1].scrollIntoView();
}

function sendMessage() {
    const input = document.querySelector("footer input");
    if (input.value.trim().length > 0) {
        const messageToSend = {
                                from: participant.name,
                                to: sendTo,
                                text: input.value.trim(),
                                type: visibilitySelected
                            };
        const promisse = axios.post("https://mock-api.driven.com.br/api/v6/uol/messages", messageToSend);
        promisse.then(updateMessages);
        promisse.catch(processError);
    }
    input.value = "";
}

function showMenu() {
    const aside = document.querySelector("aside");
    const background = document.querySelector(".background");
    aside.classList.toggle("noShow");
    background.classList.toggle("noShow");
}

function select(element) {
    const elementParent = element.parentNode;
    const adviceSendVisibility = document.querySelector(".advice-send-visibility");
    elementParent.querySelector(".selected").classList.remove("selected");
    element.classList.add("selected");
    if (elementParent.classList.contains("active-users")) {
        sendTo = element.querySelector("span").innerHTML;
    } else {
        visibilitySelected = element.querySelector("span").innerHTML;
    }

    if (visibilitySelected === "Reservadamente") {
        visibilitySelected = "private_message";
        adviceSendVisibility.innerHTML = `Enviando para ${sendTo} (reservadamente)`;
    } else {
        visibilitySelected = "message";
        adviceSendVisibility.innerHTML = `Enviando para ${sendTo} (publicamente)`;
    }
    
}