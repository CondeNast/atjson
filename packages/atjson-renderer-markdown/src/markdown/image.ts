import React from 'react';

export default class extends React.Component {
  render() {
    return ['![', this.props.alt, '](', this.props.url, ')'];
  }
}
