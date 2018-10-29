import Component, { define } from '../component';

export default define('offset-code', class Code extends Component {
  static template = '<code><slot></slot></code>';
});
