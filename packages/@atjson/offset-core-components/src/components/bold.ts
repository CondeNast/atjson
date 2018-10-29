import Component, { define } from '../component';

export default define('offset-bold', class Bold extends Component {
  static template = '<strong><slot></slot></strong>';
});
