import WebComponent from '../mixins/component';

export default class OffsetLogo extends WebComponent {
  static template = '<canvas></canvas>';

  static style = 'canvas { width: 300px; height: 150px; }';

  static observedAttributes = ['offset', 'continuous'];

  initChannel(color, initialRotation, initialOffset, rotationAngleMultiplier, magicNumber) {
		let rotationAngle = (Math.abs(Math.cos(1 * Math.PI / 180.0)) + 1) * 2/3;
    return {
      color,
      point: this.rotatePoint(initialRotation, { x: this.origin.x + initialOffset.x, y: this.origin.y + initialOffset.x }),
      angle: rotationAngle * rotationAngleMultiplier,
      dx: 0,
      dtheta: 0,
      magicNumber
    }
  }

  initCanvas() {
    var canvas = this.shadowRoot.querySelector('canvas');
    canvas.width = 300;
    canvas.height = 150;
    canvas.style.width = 150;
    canvas.style.height = 75;

    var ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    ctx.globalCompositeOperation = 'darken';
    let fontSize = canvas.width / 7 + 'px';
    ctx.font = `italic ${fontSize} Georgia`;

		this.origin = { x: 5, y: canvas.height / 4.0 };
    this.ctx = ctx;

    this.channels = [
      this.initChannel('cyan', 0, { x: -2, y: -2 }, 1, 5),
      this.initChannel('magenta', 120, { x: -2, y: -2 }, -1, 95),
      this.initChannel('yellow', 240, { x: -2, y: -2 }, 1, 50)
    ];
  }

  rotatePoint(angle, point) {
    var radians = angle * Math.PI / 180.0;
    var cos = Math.cos(radians);
    var sin = Math.sin(radians);
    var dX = point.x - this.origin.x;
    var dY = point.y - this.origin.y;
    var x = cos * dX - sin * dY + this.origin.x;
    var y = sin * dX + cos * dY + this.origin.y;
    return { x, y };
  }

	drawOffset(point, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillText('offset', point.x, point.y);
  }

  mutateChannel(channel) {
    var thetaSign = 1;
    if (Math.random() < 0.25) thetaSign = -1;

    if (channel.dtheta < 1 && channel.dtheta > -1) {
      channel.dtheta += thetaSign * Math.random() 
    }

    if (channel.angle < 0.05 && channel.angle > 0 ) {
      channel.angle = -0.05;
    } else if (channel.angle < 0 && channel.angle > -0.05) {
      channel.angle = 0.05;
    }

    var newAngle = channel.dtheta * channel.angle;
    if (newAngle < 5 && newAngle > -5) {
      channel.angle = newAngle;
    }

    if (Math.random() < 0.5 && channel.dx < 2.5) {
      channel.point.x += 0.5 / 3;
      channel.dx += 0.5 / 3;
    } else if (channel.dx > -2.5) {
      channel.point.x -= 0.5 / 3;
      channel.dx -= 0.5 / 3;
    }

    return channel;
  }

  drawChannel(channel) {
    let rotationAngle = (Math.abs(Math.cos(1 * Math.PI / 180.0)) + 1) * 2/3;
    channel.point = this.rotatePoint(rotationAngle, channel.point);
    this.drawOffset(channel.point, channel.color);

    if (Math.floor(Math.random()*100) !== channel.magicNumber) {
      return channel;
    } else {
      return this.mutateChannel(channel);
    }
  }

  render() {
    this.ctx.clearRect(0, 0, 1000, 300);
    this.channels.map(c => this.drawChannel(c));
  }

  attributeChangedCallback(attribute) {
    if (!this.ctx) return;

    this.render();

    if (this.hasAttribute('continuous') && !this.loop) {
      let loop = () => {
        this.render();
        window.requestAnimationFrame(loop);
      }
      loop();
      this.loop = true;
    }
  }

  connectedCallback() {
    this.initCanvas();
    this.render();
  }
}
