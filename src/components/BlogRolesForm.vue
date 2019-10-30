<template>
  <div>
    <pre v-if="false">{{ form }}</pre>
    <AppLoader v-if="initDataState === 'PENDING'">Loading blogs</AppLoader>
    <AppError v-if="errorMessage">{{ errorMessage }}</AppError>
    <AppMessage v-if="appMessage">{{ appMessage }}</AppMessage>
    <LayoutBody
      style="margin-top:40px;margin-bottom:40px;padding:40px;"
      class="container"
      v-if="initDataState === 'FINISHED_OK'"
    >
      <h2 class="subtitle is-2">Users & Roles</h2>
      <table class="table is-striped is-fullwidth">
        <thead>
          <tr>
            <th></th>
            <th>User</th>
            <th>Root</th>
            <th>Editor</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user._id">
            <td>
              <button
                class="delete is-small"
                @click.prevent="removeUser(user)"
              />
            </td>
            <td>
              <div :data-tooltip="user.email">
                {{ user.name }} [{{ user.provider }}]
              </div>
            </td>
            <td v-for="role in ['ROOT', 'EDITOR']" :key="role">
              <input
                type="checkbox"
                :checked="user.roles.includes(role)"
                @click.prevent="toggleRole(user, role)"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <h4 class="title is-4">Add an user</h4>
      <div>
        <form @submit.prevent="onAddUser">
          <input type="email" name="email" placeholder="email" />
          <button type="submit">Add user</button>
        </form>
      </div>
    </LayoutBody>
  </div>
</template>

<script>
import LayoutBody from '../components/LayoutBody';
import { getBlogUsers, REQUEST_STATE, formInitData } from '../utils/helpers';
import AppLoader from '../components/AppLoader';
import AppError from '../components/AppError';
import AppMessage from '../components/AppMessage';
import apolloClient from '../utils/apolloClient';
import gql from 'graphql-tag';
import { fromEvent } from 'from-form-submit';

const addRoleToBlogRequest = gql`
  mutation addRoleToBlog($blogId: ID!, $userId: ID!, $role: RolesEnum!) {
    addRoleToBlog(blogId: $blogId, userId: $userId, role: $role)
  }
`;

const removeRoleFromBlogRequest = gql`
  mutation removeRoleFromBlog($blogId: ID!, $userId: ID!, $role: RolesEnum!) {
    removeRoleFromBlog(blogId: $blogId, userId: $userId, role: $role)
  }
`;

const removeUserFromBlogRequest = gql`
  mutation removeUserFromBlog($blogId: ID!, $userId: ID!) {
    removeUserFromBlog(blogId: $blogId, userId: $userId)
  }
`;

const usersByEmailRequest = gql`
  query getUsersByEmail($email: String!) {
    users(first: 5, filter: { email: $email }) {
      edges {
        node {
          _id
          provider
          email
          name
        }
      }
    }
  }
`;

export default {
  components: {
    LayoutBody,
    AppLoader,
    AppError,
    AppMessage,
  },
  data() {
    return {
      users: [],
      initDataState: REQUEST_STATE.NOT_STARTED,
      toggleRoleState: REQUEST_STATE.NOT_STARTED,
      removeUserState: REQUEST_STATE.NOT_STARTED,
      errorMessage: null,
      appMessage: null,
    };
  },
  created() {
    this.initData();
  },
  methods: {
    async initData() {
      this.errorMessage = null;
      this.initDataState = REQUEST_STATE.PENDING;
      try {
        this.users = await getBlogUsers(this.$route.params.blogId);
        this.initDataState = REQUEST_STATE.FINISHED_OK;
      } catch (error) {
        this.errorMessage = error;
        this.initDataState = REQUEST_STATE.FINISHED_ERROR;
      }
    },
    async removeUser(user) {
      const { blogId } = this.$route.params;
      const { _id: userId } = user;

      this.removeUserState = REQUEST_STATE.PENDING;
      this.errorMessage = undefined;
      try {
        const { data } = await apolloClient.mutate({
          mutation: removeUserFromBlogRequest,
          variables: {
            blogId,
            userId,
          },
        });

        this.users = this.users.filter(({ _id }) => _id !== userId);

        this.removeUserState = REQUEST_STATE.FINISHED_OK;
      } catch (error) {
        this.errorMessage = error;
        this.removeUserState = REQUEST_STATE.FINISHED_ERROR;
      }
    },
    async toggleRole(user, role) {
      const { blogId } = this.$route.params;
      const { _id: userId } = user;

      this.toggleRoleState = REQUEST_STATE.PENDING;
      this.errorMessage = undefined;
      try {
        const { data } = await apolloClient.mutate({
          mutation: user.roles.includes(role)
            ? removeRoleFromBlogRequest
            : addRoleToBlogRequest,
          variables: {
            blogId,
            userId,
            role,
          },
        });

        if (data.addRoleToBlog) {
          user.roles = [].concat(user.roles).concat(role);
        } else if (data.removeRoleFromBlog) {
          user.roles = user.roles.filter((currRole) => currRole !== role);
        }

        this.toggleRoleState = REQUEST_STATE.FINISHED_OK;
      } catch (error) {
        this.errorMessage = error;
        this.toggleRoleState = REQUEST_STATE.FINISHED_ERROR;
      }
    },
    async addUser(user) {
      const { blogId } = this.$route.params;
      const { _id: userId } = user;

      // TODO: request state
      // TODO: try/catch

      await apolloClient.mutate({
        mutation: addRoleToBlogRequest,
        variables: {
          blogId,
          userId,
          role: 'EDITOR',
        },
      });

      this.users.push({ ...user, roles: ['EDITOR'] });
    },
    async onAddUser(event) {
      const { email } = fromEvent(event);
      if (!email || email.trim().length === 0) return;

      // TODO: request state
      // TODO: try/catch
      const { data } = await apolloClient.query({
        query: usersByEmailRequest,
        variables: {
          email,
        },
      });

      const users = data.users.edges
        .map(({ node }) => node)
        .filter(({ _id }) => !this.users.find((user) => user._id === _id));

      if (users.length === 1) {
        return this.addUser(users[0]);
      }

      // TODO: prints users and the root have to choose one
    },
  },
};
</script>

<style scoped></style>
