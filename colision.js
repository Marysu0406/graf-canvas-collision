const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const window_height = window.innerHeight;
const window_width = window.innerWidth;
canvas.height = window_height;
canvas.width = window_width;
canvas.style.background = "#FFFFFF";

class Circle {
  constructor(x, y, radius, color, text, speed) {
    this.posX = x;
    this.posY = y;
    this.radius = radius;
    this.originalColor = color;
    this.color = color;
    this.text = text;
    this.inCollision = false;

    const angle = Math.random() * 2 * Math.PI;
    this.dx = speed * Math.cos(angle);
    this.dy = speed * Math.sin(angle);
  }

  updatePosition() {
    this.posX += this.dx;
    this.posY += this.dy;

    if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
      this.dx = -this.dx;
    }

    if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
      this.dy = -this.dy;
    }
  }

  draw(context) {
    context.beginPath();
    context.strokeStyle = this.inCollision ? "#0000FF" : this.color;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "20px Arial";
    context.fillText(this.text, this.posX, this.posY);
    context.lineWidth = 5;
    context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
    context.stroke();
    context.closePath();
  }

  checkCollision(otherCircle) {
    const dx = this.posX - otherCircle.posX;
    const dy = this.posY - otherCircle.posY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.radius + otherCircle.radius;
  }

  resolveCollision(otherCircle) {
    const dx = otherCircle.posX - this.posX;
    const dy = otherCircle.posY - this.posY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Si hay superposición, ajustar las posiciones
    const overlap = this.radius + otherCircle.radius - distance;
    const adjustX = (overlap * dx) / distance / 2;
    const adjustY = (overlap * dy) / distance / 2;
    this.posX -= adjustX;
    this.posY -= adjustY;
    otherCircle.posX += adjustX;
    otherCircle.posY += adjustY;

    // Calcular el ángulo de colisión
    const angle = Math.atan2(dy, dx);

    // Velocidades antes de la colisión
    const v1 = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
    const v2 = Math.sqrt(otherCircle.dx * otherCircle.dx + otherCircle.dy * otherCircle.dy);

    // Dirección de las velocidades antes de la colisión
    const dir1 = Math.atan2(this.dy, this.dx);
    const dir2 = Math.atan2(otherCircle.dy, otherCircle.dx);

    // Nuevas velocidades en el sistema de referencia del ángulo de colisión
    const new_dx1 = v2 * Math.cos(dir2 - angle);
    const new_dy1 = v2 * Math.sin(dir2 - angle);
    const new_dx2 = v1 * Math.cos(dir1 - angle);
    const new_dy2 = v1 * Math.sin(dir1 - angle);

    // Intercambio de las velocidades en el eje del ángulo de colisión
    this.dx = Math.cos(angle) * new_dx1 - Math.sin(angle) * new_dy1;
    this.dy = Math.sin(angle) * new_dx1 + Math.cos(angle) * new_dy1;
    otherCircle.dx = Math.cos(angle) * new_dx2 - Math.sin(angle) * new_dy2;
    otherCircle.dy = Math.sin(angle) * new_dx2 + Math.cos(angle) * new_dy2;

    // Efecto de flash azul para indicar la colisión
    this.inCollision = true;
    otherCircle.inCollision = true;
    setTimeout(() => {
        this.inCollision = false;
        otherCircle.inCollision = false;
    }, 100);
  }
}

let circles = [];

function generateCircles(n) {
  const pastelColors = ["#FFFF00", "#EF007E", "#FF84C6", "#C879FF", "#0E9AF1", "#08F26E", "#FC4B08"];

  for (let i = 0; i < n; i++) {
    let radius = Math.random() * 30 + 20;
    let x = Math.random() * (window_width - radius * 2) + radius;
    let y = Math.random() * (window_height - radius * 2) + radius;
    let color = pastelColors[i % pastelColors.length]; // Asigna colores de la lista en orden
    let speed = Math.random() * 3 + 1;
    let text = `C${i + 1}`;
    circles.push(new Circle(x, y, radius, color, text, speed));
  }
}


function animate() {
  ctx.clearRect(0, 0, window_width, window_height);

  circles.forEach(circle => {
    circle.updatePosition();
  });

  for (let i = 0; i < circles.length; i++) {
    for (let j = i + 1; j < circles.length; j++) {
      if (circles[i].checkCollision(circles[j])) {
        circles[i].resolveCollision(circles[j]);
      }
    }
  }

  circles.forEach(circle => circle.draw(ctx));

  requestAnimationFrame(animate);
}

generateCircles(10);
animate();
