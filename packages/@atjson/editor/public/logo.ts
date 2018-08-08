import WebComponent from '../src/mixins/component';

export default class OffsetLogo extends WebComponent {

  static template = '<canvas></canvas>';
  static style = 'canvas { width: 300px; height: 150px; }';

  ctx: CanvasRenderingContext2D;
  origin: { x: number, y: number };
  loop?: boolean;
  channels?: any[];

  initChannel(color, initialRotation, initialOffset, rotationAngleMultiplier, magicNumber) {
    let rotationAngle = (Math.abs(Math.cos(1 * Math.PI / 180.0)) + 1) * 2 / 3;
    return {
      color,
      point: this.rotatePoint(initialRotation, { x: this.origin.x + initialOffset.x, y: this.origin.y + initialOffset.x }),
      angle: rotationAngle * rotationAngleMultiplier,
      dx: 0,
      dtheta: 0,
      magicNumber
    };
  }

  initCanvas() {
    let canvas = this.shadowRoot.querySelector('canvas');
    if (canvas === null) return;
    canvas.width = 300;
    canvas.height = 150;
    canvas.style.width = '150';
    canvas.style.height = '75';

    let ctx = canvas.getContext('2d');
    if (ctx === null) throw new Error('Unable to initialize Canvas');
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

  rotatePoint(angle: number, point) {
    let radians = angle * Math.PI / 180.0;
    let cos = Math.cos(radians);
    let sin = Math.sin(radians);
    let dX = point.x - this.origin.x;
    let dY = point.y - this.origin.y;
    let x = cos * dX - sin * dY + this.origin.x;
    let y = sin * dX + cos * dY + this.origin.y;
    return { x, y };
  }

  drawOffset(point, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillText('offset', point.x, point.y);
  }

  mutateChannel(channel) {
    let thetaSign = 1;
    if (Math.random() < 0.25) thetaSign = -1;

    if (channel.dtheta < 1 && channel.dtheta > -1) {
      channel.dtheta += thetaSign * Math.random();
    }

    if (channel.angle < 0.05 && channel.angle > 0 ) {
      channel.angle = -0.05;
    } else if (channel.angle < 0 && channel.angle > -0.05) {
      channel.angle = 0.05;
    }

    let newAngle = channel.dtheta * channel.angle;
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

  drawChannel(channel: any) {
    let rotationAngle = (Math.abs(Math.cos(1 * Math.PI / 180.0)) + 1) * 2 / 3;
    channel.point = this.rotatePoint(rotationAngle, channel.point);
    this.drawOffset(channel.point, channel.color);

    if (Math.floor(Math.random() * 100) !== channel.magicNumber) {
      return channel;
    } else {
      return this.mutateChannel(channel);
    }
  }

  render() {
    this.ctx.clearRect(0, 0, 1000, 300);
    this.channels.map(c => this.drawChannel(c));
  }

  attributeChangedCallback() {
    if (!this.ctx) return;

    this.render();

    if (this.hasAttribute('continuous') && !this.loop) {
      let loop = () => {
        this.render();
        window.requestAnimationFrame(loop);
      };
      loop();
      this.loop = true;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.initCanvas();
    this.render();
  }
}

if (!window.customElements.get('offset-logo')) {
  window.customElements.define('offset-logo', OffsetLogo);
}
