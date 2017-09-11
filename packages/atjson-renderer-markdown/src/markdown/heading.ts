import React from 'react';

export default class extends React.Component {
  render() {
    let hashes = new Array((this.props.size || 0) + 1).join('#');
    return [hashes + ' ', this.props.children];
  }
}
