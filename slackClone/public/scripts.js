// const userName = prompt("What is your username?");
// const password = prompt("What is your password?");

const userName = "sru";
const password = "x";

const socket = io("http://localhost:9002");

const nameSpaceSockets = [];
const listeners = {
  nsChange: [],
};

let selectedNsId = 0;

document.querySelector("#message-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const newMessage = document.querySelector("#user-message").value;
  console.log(newMessage, selectedNsId);
  nameSpaceSockets[selectedNsId].emit("newMessageToRoom", {
    newMessage,
    date: Date.now(),
    userName,
  });
});

const addListeneres = (nsId) => {
  if (!listeners.nsChange[nsId]) {
    nameSpaceSockets[nsId].on("nsChange", (data) => {
      console.log("Namespace Changed!");
      console.log(data);
    });
    listeners.nsChange[nsId] = true;
  }
};

socket.on("connect", () => {
  console.log("connected");
  socket.emit("clientConnect");
});

//listen for the nsList event from the server which gives us the namespaces
socket.on("nsList", (nsData) => {
  const lastNs = localStorage.getItem("lastNs");
  const namespacesDiv = document.querySelector(".namespaces");
  namespacesDiv.innerHTML = "";
  nsData.forEach((ns) => {
    namespacesDiv.innerHTML += `<div class='namespace' ns=${ns.endpoint}> <img src=${ns.image}/>`;

    //initialize thisNs as its index in nameSpaceSockets
    //If the connection is new, this will be null
    //If the connection has already been established, it will reconnect and remain in its spot

    if (!nameSpaceSockets[ns.id]) {
      //There is no socket at this nsId. So make a new connection!
      //joining multiple namespaces
      nameSpaceSockets[ns.id] = io(`http://localhost:9002${ns.endpoint}`);
    }
    addListeneres(ns.id);
  });

  Array.from(document.getElementsByClassName("namespace")).forEach(
    (element) => {
      element.addEventListener("click", (e) => {
        joinNS(element, nsData);
      });
    }
  );
});
