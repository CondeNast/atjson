import WebComponent from '../mixins/component';

export default class OffsetLogo extends WebComponent {
  static template = '<canvas></canvas>';

  static style = 'canvas { width: 300px; height: 150px; }';

  static observedAttributes = ['offset'];

  render() {
    let x = parseInt(this.getAttribute('offset'));

    var canvas = this.shadowRoot.querySelector('canvas');
    canvas.width = 300;
    canvas.height = 150;
    canvas.style.width = 150;
    canvas.style.height = 75;

    var ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    ctx.globalCompositeOperation = 'darken';
    let fontSize = canvas.width / 7 + 'px';
    ctx.font = `${fontSize} Helvetica`;

		var origin = { x: 2, y: canvas.height / 4.0 };

		let rotatePoint = (angle, point) => {
			var radians = angle * Math.PI / 180.0;
			var cos = Math.cos(radians);
			var sin = Math.sin(radians);
			var dX = point.x - origin.x;
			var dY = point.y - origin.y;
			var x = cos * dX - sin * dY + origin.x;
			var y = sin * dX + cos * dY + origin.y;
			return { x, y };
		}

    if (!this.cyanPoint) {
			this.cyanPoint = { x: 0, y: canvas.height / 4.0 - 1 };
			this.magentaPoint = rotatePoint(120, { x: 0, y: canvas.height / 4.0 - 1 });
			this.yellowPoint = rotatePoint(240, { x: 0, y: canvas.height / 4.0 - 1 });
    }
		var rotationAngle = 2 * (Math.abs(Math.cos(1 * Math.PI / 180.0)) + 1);

		let drawOffset = (point, color) => {
			var newPoint = rotatePoint(rotationAngle, point);
			ctx.fillStyle = color;
			ctx.fillText('Offset', newPoint.x, newPoint.y);
			return newPoint;
		}

		let drawOffsets = (angle) => {
			ctx.clearRect(0, 0, 1000, 300);
			console.log(angle, this.cyanPoint);
			this.cyanPoint = drawOffset(this.cyanPoint, 'cyan');
			this.magentaPoint = drawOffset(this.magentaPoint, 'magenta');
			this.yellowPoint = drawOffset(this.yellowPoint, 'yellow');
		}

    drawOffsets(x);
  }

  attributeChangedCallback(attribute) {
    this.render();
  }

  connectedCallback() {
    this.render();
  }
}
