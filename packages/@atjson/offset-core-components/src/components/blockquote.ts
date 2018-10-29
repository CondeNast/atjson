import Component, { define } from '../component';

export default define('offset-blockquote', class Blockquote extends Component {
  static template = '<blockquote><slot></slot></blockquote>';
});
