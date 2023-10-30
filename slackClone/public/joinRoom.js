const joinRoom = async (roomTitle, namespaceId) => {
  console.log(roomTitle, namespaceId);
  const ackResp = await nameSpaceSockets[namespaceId].emitWithAck(
    "joinRoom",
    roomTitle
  );

  document.querySelector(
    ".curr-room-num-users"
  ).innerHTML = `${ackResp.numUsers}<span class="fa-solid fa-user"></span>`;
  document.querySelector(".curr-room-text").innerHTML = roomTitle;
};
