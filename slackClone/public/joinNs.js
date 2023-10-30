const joinNS = (element, nsData) => {
  const nsEndpoint = element.getAttribute("ns");

  const clickedNs = nsData.find((row) => row.endpoint === nsEndpoint);
  selectedNsId = clickedNs.id;
  const rooms = clickedNs.rooms;

  let roomList = document.querySelector(".room-list");
  roomList.innerHTML = "";

  // init firstRoom var
  let firstRoom;

  rooms.forEach((room, i) => {
    if (i == 0) {
      firstRoom = room.roomTitle;
    }
    roomList.innerHTML += `<li class="room" namespaceId=${
      room.namespaceId
    }><span class='fa-solid fa-${room.privateRoom ? "lock" : "globe"}'></span>${
      room.roomTitle
    }</li>`;
  });

  joinRoom(firstRoom, clickedNs.id);

  const roomNodes = document.querySelectorAll(".room");
  Array.from(roomNodes).forEach((elem) => {
    elem.addEventListener("click", (e) => {
      const namespaceId = elem.getAttribute("namespaceId");
      joinRoom(e.target.innerText, namespaceId);
    });
  });
  localStorage.setItem("lastNs", nsEndpoint);
};
