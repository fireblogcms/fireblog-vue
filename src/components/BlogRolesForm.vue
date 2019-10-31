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

      <div class="add-user-card">
        <div>
          <form @submit.prevent="onAddUser" class="form">
            <label class="label">Add an user by its email address: </label>
            <div class="field has-addons">
              <div class="control">
                <input
                  type="email"
                  name="email"
                  class="input"
                  placeholder="email"
                />
              </div>
              <div class="control">
                <button type="submit" class="button is-primary">
                  Add user
                </button>
              </div>
              <div
                class="has-text-danger no-user"
                v-if="noUsersForEmailMessage"
              >
                No user found for this email.
              </div>
            </div>
          </form>

          <div class="choose-user" v-if="usersMatchingEmail.length > 0">
            <p class="help">
              This email is matching multiples users in fireblog.<br />
              You have to choose which user to add from their provider (google,
              github, etc.) by clicking on it.
            </p>
            <div class="users-list">
              <div
                v-for="user in usersMatchingEmail"
                :key="user._id"
                class="user-item"
                @click.prevent="addUser(user)"
              >
                <div
                  :style="`background-image: url(${user.picture});`"
                  class="avatar image is-48x48 is-rounded"
                />
                <div class="button is-primary is-48x48">
                  +
                </div>
                <div class="info">
                  <span class="name">{{ user.name }}</span>
                  <span class="provider">{{ user.provider }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
          picture
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
      usersMatchingEmail: [],
      initDataState: REQUEST_STATE.NOT_STARTED,
      toggleRoleState: REQUEST_STATE.NOT_STARTED,
      removeUserState: REQUEST_STATE.NOT_STARTED,
      searchUsersByEmailState: REQUEST_STATE.NOT_STARTED,
      addUserState: REQUEST_STATE.NOT_STARTED,
      noUsersForEmailMessage: false,
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
        throw new Error(error);
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
        throw new Error(error);
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
        throw new Error(error);
      }
    },
    async addUser(user) {
      this.addUserState = REQUEST_STATE.PENDING;

      try {
        const { blogId } = this.$route.params;
        const { _id: userId } = user;

        await apolloClient.mutate({
          mutation: addRoleToBlogRequest,
          variables: {
            blogId,
            userId,
            role: 'EDITOR',
          },
        });

        this.users.push({ ...user, roles: ['EDITOR'] });
        this.usersMatchingEmail = [];
        this.addUserState = REQUEST_STATE.FINISHED_OK;
      } catch (error) {
        this.errorMessage = error;
        this.addUserState = REQUEST_STATE.FINISHED_ERROR;
        throw new Error(error);
      }
    },
    async onAddUser(event) {
      const { email } = fromEvent(event);
      if (!email || email.trim().length === 0) return;

      try {
        this.noUsersForEmailMessage = false;
        this.usersMatchingEmail = [];
        this.searchUsersByEmailState = REQUEST_STATE.PENDING;
        const { data } = await apolloClient.query({
          query: usersByEmailRequest,
          variables: {
            email,
          },
        });

        const users = data.users.edges
          .map(({ node }) => node)
          .filter(({ _id }) => !this.users.find((user) => user._id === _id));

        if (users.length === 0) {
          this.noUsersForEmailMessage = true;
          return;
        }

        if (users.length === 1) {
          return this.addUser(users[0]);
        }

        this.usersMatchingEmail = users;
        this.searchUsersByEmailState = REQUEST_STATE.FINISHED_OK;
      } catch (error) {
        this.errorMessage = error;
        this.searchUsersByEmailState = REQUEST_STATE.FINISHED_ERROR;
        throw new Error(error);
      }
    },
  },
};
</script>

<style scoped>
.user-item {
  display: flex;
  align-items: center;
  margin-right: 1em;
  cursor: pointer;
  border: 1px solid #e0e0e0;
  padding: 1em 1.5em;
  border-radius: 4px;
  min-width: 15em;
}

.user-item:hover {
  box-shadow: 1px 1px 10px -7px black;
}

.user-item > .image,
.user-item > .button {
  margin-right: 10px;
  border-radius: 100%;
  width: 48px;
  height: 48px;
}

.user-item:hover > .image {
  display: none;
}

.user-item:hover > .button {
  display: flex;
}

.user-item > .image {
  background-position: center;
  background-size: contain;
}

.user-item > .button {
  display: none;
  font-size: 2em;
  box-shadow: 2px 4px 10px -7px black;
  margin-right: 8px;
}

.user-item > .info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.user-item > .info > .provider {
  font-weight: bold;
  text-transform: capitalize;
}

.users-list {
  display: flex;
  flex-wrap: wrap;
  margin: 2em;
  align-items: center;
  justify-content: space-evenly;
}

.choose-user .help {
  margin-top: 2em;
  text-align: center;
}

.add-user-card {
  margin-top: 4em;
}

.add-user-card form {
  display: flex;
  align-items: center;
}

.add-user-card form > .label {
  margin: 0;
  margin-right: 1em;
}

.no-user {
  margin-left: 2em;
  display: flex;
  align-items: center;
}
</style>
