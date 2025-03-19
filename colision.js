const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const window_height = window.innerHeight;
const window_width = window.innerWidth;
canvas.height = window_height;
canvas.width = window_width;
canvas.style.background = "#FFFFFF";

let fallSpeed = 1; // Velocidad inicial de caída
let removedCircles = 0;
let totalCirclesOut = 0; // Contador de pelotas que salieron sin eliminarse

class Circle {
  constructor(x, y, radius, color) {
    this.posX = x;
    this.posY = y;
    this.radius = radius;
    this.color = color;
    this.removed = false; // Para marcar si la pelota fue eliminada
  }

  updatePosition() {
    this.posY += fallSpeed; // Caída constante según velocidad definida
  }

  draw(context) {
    context.beginPath();
    context.fillStyle = this.color;
    context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2);
    context.fill();
    context.closePath();
  }

  isOutOfScreen() {
    return this.posY - this.radius > window_height;
  }

  isClicked(mouseX, mouseY) {
    const dx = mouseX - this.posX;
    const dy = mouseY - this.posY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.radius;
  }
}

let circles = [];

function generateCircle() {
  const pastelColors = ["#FFFF00", "#EF007E", "#FF84C6", "#C879FF", "#0E9AF1", "#08F26E", "#FC4B08"];

  let radius = Math.random() * 30 + 20;
  let x = Math.random() * (window_width - radius * 2) + radius;

  // Evitar que salgan muy juntas
  if (circles.length > 0) {
    let lastCircle = circles[circles.length - 1];
    while (Math.abs(x - lastCircle.posX) < radius * 2) {
      x = Math.random() * (window_width - radius * 2) + radius;
    }
  }

  let y = -radius;
  let color = pastelColors[Math.floor(Math.random() * pastelColors.length)];

  circles.push(new Circle(x, y, radius, color));
}

// Generar pelotas continuamente (limitado a 10 en pantalla)
setInterval(() => {
  if (circles.length < 10) {
    generateCircle();
  }
}, 1000); // Generar cada segundo

// Detectar clic para eliminar círculos
canvas.addEventListener("click", (event) => {
  const mouseX = event.clientX;
  const mouseY = event.clientY;

  let initialLength = circles.length;
  circles = circles.filter(circle => {
    if (circle.isClicked(mouseX, mouseY)) {
      circle.removed = true;
      return false; // Eliminar la pelota
    }
    return true;
  });
  removedCircles += initialLength - circles.length;

  // Ajustar la velocidad de acuerdo con el número de pelotas eliminadas
  adjustDifficulty();
});

// Ajustar la velocidad según el nivel de dificultad
function adjustDifficulty() {
  if (removedCircles <= 15) {
    fallSpeed = 1; // Nivel fácil
  } else if (removedCircles <= 25) {
    fallSpeed = 2; // Nivel medio
  } else {
    fallSpeed = 3; // Nivel difícil
  }
}

// Mostrar el contador
function drawCounter() {
  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.textAlign = "right";
  
  // Contador de eliminadas
  ctx.fillText(`Eliminadas: ${removedCircles}`, window_width - 20, 30);
  
  // Contador de pelotas que salieron de la pantalla sin ser eliminadas
  ctx.fillText(`No eliminadas: ${totalCirclesOut}`, window_width - 20, 60);
}

function animate() {
  ctx.clearRect(0, 0, window_width, window_height);

  // Actualizar y dibujar círculos
  circles.forEach(circle => circle.updatePosition());
  circles.forEach(circle => circle.draw(ctx));

  // Eliminar círculos que salgan de la pantalla y contar las que se salen sin ser eliminadas
  circles = circles.filter(circle => {
    if (circle.isOutOfScreen()) {
      if (!circle.removed) {
        totalCirclesOut++; // Aumentar contador de pelotas que salieron sin ser eliminadas
      }
      return false; // Eliminar la pelota de la pantalla
    }
    return true;
  });

  // Mostrar los contadores
  drawCounter();

  requestAnimationFrame(animate);
}

// Generar círculos iniciales
generateCircle();
generateCircle();
generateCircle();
animate();
