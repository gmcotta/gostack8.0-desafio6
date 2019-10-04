import React, { Component } from 'react';
import { WebView } from 'react-native-webview';
import PropTypes from 'prop-types';

export default class Repository extends Component {
  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
    }).isRequired,
  };

  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('repository').name,
  });

  render() {
    const { navigation } = this.props;
    const repository = navigation.getParam('repository');
    return <WebView source={{ uri: repository.html_url }} />;
  }
}
