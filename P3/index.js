const boton = document.getElementById("boton");
const body = document.body;

boton.addEventListener("click", () => {
    body.style.backgroundColor = (body.style.backgroundColor === "green") ? "lightblue" : "green";
});
