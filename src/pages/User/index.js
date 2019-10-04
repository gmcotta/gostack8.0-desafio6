import React, { Component } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

const styles = StyleSheet.create({
  loadingIcon: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
  },
});

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loading: false,
    infiniteScrollLoading: false,
    page: 1,
    perPage: 30,
    refreshing: false,
  };

  async componentDidMount() {
    this.loadStars();
  }

  loadStars = async () => {
    const { page, perPage } = this.state;

    const { navigation } = this.props;
    const user = navigation.getParam('user');

    const response = await api.get(`/users/${user.login}/starred`, {
      params: {
        per_page: perPage,
        page,
      },
    });

    this.setState({
      stars: response.data,
      page,
    });
  };

  loadMore = async () => {
    const { stars, page, perPage } = this.state;

    this.setState({
      infiniteScrollLoading: true,
    });

    const { navigation } = this.props;
    const user = navigation.getParam('user');

    const response = await api.get(`/users/${user.login}/starred`, {
      params: {
        per_page: perPage,
        page: page + 1,
      },
    });

    await this.setState({
      stars: [...stars, ...response.data],
      page: page + 1,
      infiniteScrollLoading: false,
    });
  };

  refreshList = async () => {
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    this.setState({
      refreshing: true,
    });

    const { perPage } = this.state;

    const response = await api.get(`/users/${user.login}/starred`, {
      params: {
        per_page: perPage,
        page: 1,
      },
    });

    await this.setState({
      stars: response.data,
      page: 1,
      refreshing: false,
    });
  };

  handleNavigate = repository => {
    const { navigation } = this.props;

    navigation.navigate('Repository', { repository });
  };

  render() {
    const { navigation } = this.props;
    const user = navigation.getParam('user');
    const { stars, loading, infiniteScrollLoading, refreshing } = this.state;

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#7159c1"
            style={styles.loadingIcon}
          />
        ) : (
          <Stars
            data={stars}
            keyExtractor={star => String(star.id)}
            onRefresh={this.refreshList}
            refreshing={refreshing}
            onEndReachedThreshold={0.2}
            onEndReached={this.loadMore}
            renderItem={({ item }) => (
              <Starred
                onPress={() => {
                  this.handleNavigate(item);
                }}
              >
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            )}
          />
        )}
        {infiniteScrollLoading ? (
          <ActivityIndicator size="small" color="#7159c1" />
        ) : null}
      </Container>
    );
  }
}
