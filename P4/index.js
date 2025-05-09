document.addEventListener("DOMContentLoaded", () => {
    const bgColorInput = document.getElementById("bgColor");
    const textColorInput = document.getElementById("textColor");
  
    function actualizarEstilos() {
      document.body.style.backgroundColor = bgColorInput.value;
      document.body.style.color = textColorInput.value;
    }
  
    bgColorInput.addEventListener("input", actualizarEstilos);
    textColorInput.addEventListener("input", actualizarEstilos);
  });
  