import React from 'react';

export default class extends React.Component {
  render() {
    return this.props.children.map(function (child, index) {
      return [`${index + 1}. `, child];
    });
  }
}
