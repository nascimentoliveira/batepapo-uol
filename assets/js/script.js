let participant;
let idKeepConnection;

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
            alert("Formato insperado");
            break;
        default:
            alert(`Erro ${reply.response.status}: ${reply.response.statusText}`)
    }
    logon();
}

function processErrorStatus(reply) {
	alert("Conexão perdida!")
    clearInterval(idKeepConnection);
}

function keepConnection() {
    const promisse = axios.post("https://mock-api.driven.com.br/api/v6/uol/status", participant);
    promisse.catch(processErrorStatus);
}

function processResponseLogon(reply) {
    idKeepConnection = setInterval(keepConnection, 5000);
}

function logon() {
    let nickname;
    do {
        console.log(nickname);
        nickname = prompt("Insira seu nickname:");
        console.log(nickname.trim().length);
        if (nickname === null || nickname === undefined || nickname.trim().length === 0) {
            alert("É necessário inserir um nickname!");
        }
    } while (nickname === null || nickname === undefined || nickname.trim().length === 0);
    const promisse = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", {name: nickname});
    promisse.then(processResponseLogon);
    promisse.catch(processErrorLogon);
    return {name: nickname}
}

participant = logon();