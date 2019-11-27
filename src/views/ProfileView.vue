<template>
  <DefaultLayout>
    <AppError v-if="errorMessage">{{ errorMessage }}</AppError>

    <template v-if="initDataState === 'PENDING'">
      <AppLoader>Loading profile</AppLoader>
    </template>

    <template v-if="initDataState === 'FINISHED_OK'">
      <div style="max-width:500px" class="container section">
        <AppPanel>
          <div style="padding:40px" class="has-text-centered">
            <div class="col-md-2">
              <img
                style="border-radius:200px;"
                width="200"
                :src="me.picture"
                alt="User's profile picture"
              />
            </div>
            <div class="column">
              <div class="content">
                <h2>{{ me.name }}</h2>
                <p>{{ me.email }}</p>
                <h2>mes rôles</h2>
                <ul
                  class="has-text-left"
                  v-for="(membership, index) in me.blogsMemberships"
                  :key="index"
                >
                  <li>
                    {{ membership.blog.name }} :
                    <em>
                      {{
                        membership.roles
                          .map(v => v.replace("_", " "))
                          .join(",")
                          .toLowerCase()
                      }}
                    </em>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </AppPanel>
      </div>
    </template>
  </DefaultLayout>
</template>

<script>
import DefaultLayout from "@/layouts/DefaultLayout";
import apolloClient from "../utils/apolloClient";
import AppPanel from "../components/AppPanel";
import AppLoader from "../components/AppLoader";
import AppError from "../components/AppError";
import { REQUEST_STATE } from "../utils/helpers";
import gql from "graphql-tag";
import logger from "../utils/logger";

export default {
  components: {
    DefaultLayout,
    AppPanel,
    AppLoader,
    AppError
  },
  data() {
    return {
      initDataState: REQUEST_STATE.NOT_STARTED,
      errorMessage: null,
      me: null
    };
  },
  methods: {
    initData() {
      this.errors = [];
      this.initDataState = REQUEST_STATE.PENDING;
      return Promise.all([this.getProfile()])
        .then(() => {
          this.initDataState = REQUEST_STATE.FINISHED_OK;
        })
        .catch(error => {
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
          this.errorMessage = "Sorry, an error occured while loading page.";
          throw new Error(error);
        });
    },
    getProfile() {
      return apolloClient
        .query({
          query: gql`
            query profileQuery {
              me {
                _id
                name
                email
                createdAt
                updatedAt
                picture
                blogsMemberships {
                  roles
                  blog {
                    name
                  }
                }
              }
            }
          `
        })
        .then(result => {
          this.me = result.data.me;
          return result;
        })
        .catch(error => {
          this.errorMessage =
            "Sorry, an error occured while fetching your profile.";
          throw new Error(error);
        });
    }
  },
  created() {
    this.initData();
  }
};
</script>
