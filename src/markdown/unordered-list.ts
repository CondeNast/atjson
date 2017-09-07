import React from 'react';

export default class extends React.Component {
  render() {
    return this.props.children.map(function (child) {
      return ['- ', child];
    });
  }
}
