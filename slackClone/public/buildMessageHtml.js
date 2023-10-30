const buildMessageHtml = (messageObj) => {
  return `
  <li>
  <div class="user-image">
      <img src="https://via.placeholder.com/30" />
  </div>
  <div class="user-message">
      <div class="user-name-time">${messageObj.userName} <span>${new Date(
    messageObj.date
  ).toLocaleString()}</span></div>
      <div class="message-text">${messageObj.newMessage}</div>
  </div>
</li>
`;
};
