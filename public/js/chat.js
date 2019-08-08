const socket = io();

// Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");

// Templates
const $messageContainer = document.querySelector("#message-container");
const $messageTemplate = document.querySelector("#message-template").innerHTML;
const $locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const $sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

socket.emit("join", { username, room }, error => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

$messageForm.addEventListener("submit", e => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");

  const msg = e.target.elements.message.value;
  socket.emit("sendMessage", msg, error => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      return alert(error);
    }
    console.log("Delevered!");
  });
});

$sendLocationButton.addEventListener("click", () => {
  $sendLocationButton.setAttribute("disabled", "disabled");
  if (!navigator.geolocation) {
    return alert("Geolocation isn't supported by your browser!");
  }
  navigator.geolocation.getCurrentPosition(({ coords }) => {
    socket.emit("sendLocation", coords.latitude, coords.longitude, () => {
      $sendLocationButton.removeAttribute("disabled");
      console.log("Location shared!");
    });
  });
});

socket.on("locationMessage", ({ message, createdAt, username }) => {
  const html = Mustache.render($locationMessageTemplate, {
    username,
    location: message,
    createdAt: moment(createdAt).format("h:mm a")
  });
  $messageContainer.insertAdjacentHTML("beforeend", html);
  setAutoScrolling();
});

socket.on("message", ({ message, createdAt, username }) => {
  const html = Mustache.render($messageTemplate, {
    username,
    message,
    createdAt: moment(createdAt).format("h:mm a")
  });
  $messageContainer.insertAdjacentHTML("beforeend", html);

  setAutoScrolling();
});

const setAutoScrolling = () => {
  $messageContainer.scrollTop = $messageContainer.scrollHeight;
};

socket.on("welcomeMsg", ({ message, createdAt, username }) => {
  const html = Mustache.render($messageTemplate, {
    username,
    message,
    createdAt: moment(createdAt).format("h:mm a")
  });
  $messageContainer.insertAdjacentHTML("beforeend", html);
});

socket.on("roomUsers", ({ room, users }) => {
  const html = Mustache.render($sidebarTemplate, {
    room,
    users
  });
  document.querySelector("#sidebar").innerHTML = html;
});
