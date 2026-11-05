/* Mostra/nascondi le soluzioni dell'esercizio, come nella versione originale. */
(function () {
  "use strict";

  var container = document.getElementById("exercise-container");
  var button = document.getElementById("toggle-answers");
  if (!container || !button) return;

  button.addEventListener("click", function () {
    var shown = container.classList.toggle("show-answers");
    button.setAttribute("aria-pressed", String(shown));
    button.textContent = shown ? "Nascondi Soluzioni" : "Mostra Soluzioni";
  });
})();
