const bgColorInput = document.getElementById("bgColor");
const textColorInput = document.getElementById("textColor");

function applyColors() {
  const bgColor = bgColorInput.value;
  const textColor = textColorInput.value;

  document.body.style.backgroundColor = bgColor;
  document.body.style.color = textColor;

  const display = document.getElementById("display");
  display.style.backgroundColor = "#fff";
  display.style.color = textColor;

  const mensajes = document.querySelectorAll(".chat-message");
  mensajes.forEach(msg => msg.style.color = textColor);
}

bgColorInput.addEventListener("input", applyColors);
textColorInput.addEventListener("input", applyColors);

applyColors();
