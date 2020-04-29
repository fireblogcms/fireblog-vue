<template>
  <div>
    <template v-if="initDataState === 'PENDING'">
      <AppLoader>Loading</AppLoader>
    </template>

    <template v-if="initDataState === 'FINISHED_ERROR'">
      <div class="text-red-600">{{ initStateError }}</div>
    </template>

    <template v-if="initDataState === 'FINISHED_OK'">
      <div class="text-center">
        <!-- special text if this is the very first blog :) -->
        <div v-if="isMyFirstBlog" class="mb-12">
          <p class="text-3xl font-bold">{{ $t("views.blogCreate.gladToSeeYouHere") }}, {{ user.name }} 🤗</p>
          <p class="text-2xl">{{ $t("views.blogCreate.createFirstBlog") }}</p>
        </div>

        <div>
          <label class="text-2xl font-bold">{{ $t("views.blogCreate.fields.title.label") }}</label>
          <p class="text-sm mb-4">{{ $t("views.blogCreate.fields.title.help") }}</p>
          <AppInput
            v-model="inputs.name"
            :error="formErrors.name"
            type="text"
            maxlength="250"
            :placeholder="generate()"
          />
        </div>

        <div class="mt-10 mb-16">
          <label class="text-2xl font-bold">{{ $t("views.blogCreate.fields.description.label") }}</label>
          <p class="text-sm mb-4">{{ $t("views.blogCreate.fields.description.help") }}</p>
          <AppTextarea
            v-model="inputs.description"
            type="text"
            maxlength="250"
          />
        </div>

        <div class="flex justify-center">
          <AppButton
            v-if="!isMyFirstBlog"
            type="primary-outlined"
            class="mx-4"
            @click="$router.push('/')"
          >
            {{ $t("views.blogCreate.cancelButton").toUpperCase() }}
          </AppButton>
          <!-- TODO: Add button with loader and remove disabled attribute -->
          <AppButton
            :disabled="savingBlogState === 'PENDING'"
            class="mx-4"
            :class="{ 'is-loading': savingBlogState === 'PENDING' }"
            type="primary"
            @click="onCreateClick"
          >
            {{ $t("views.blogCreate.createButton").toUpperCase() }}
          </AppButton>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import AppButton from "@/ui-kit/AppButton";
import AppInput from "@/ui-kit/AppInput";
import AppTextarea from "@/ui-kit/AppTextarea";
import { generate } from "@/utils/fantasyName.js";
import apolloClient from "@/utils/apolloClient";
import { getUser, REQUEST_STATE } from "@/utils/helpers";
import gql from "graphql-tag";
import {
  getMyBlogsQuery,
  getUserQuery,
  createBlogMutation
} from "@/utils/queries";
import AppLoader from "@/components/AppLoader";
import logger from "@/utils/logger";

export default {
  components: {
    AppButton,
    AppInput,
    AppTextarea,
    AppLoader
  },
  props: {
    isMyFirstBlog: {
      type: Boolean
    }
  },
  data() {
    return {
      errors: [],
      formErrors: {},
      initDataState: REQUEST_STATE.NOT_STARTED,
      initStateError: null,
      savingBlogState: REQUEST_STATE.NOT_STARTED,
      user: null,
      languageList: null,
      inputs: {
        name: "",
        blogContentDefaultLocale: null
      }
    };
  },
  created() {
    this.initData();
    this.generate = generate;
  },
  methods: {
    async initData() {
      this.initStateError = null;
      this.initDataState = REQUEST_STATE.PENDING;
      Promise.all([getUser()])
        .then(([user]) => {
          this.initDataState = REQUEST_STATE.FINISHED_OK;
          this.user = user;
        })
        .catch(error => {
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
          this.initStateError = "initData() : " + error;
          throw new Error(error);
        });
    },
    getFormErrors() {
      const errors = {};
      if (!this.inputs.name.trim()) {
        errors.name = this.$t("views.blogCreate.fields.title.required");
      }
      return errors;
    },
    onCreateClick() {
      this.formErrors = this.getFormErrors();
      if (Object.keys(this.formErrors).length > 0) {
        return false;
      }
      this.savingBlogState = REQUEST_STATE.PENDING;
      apolloClient
        .mutate({
          mutation: createBlogMutation,
          variables: {
            blog: {
              name: this.inputs.name,
              description: this.inputs.description
            }
          }
        })
        .then(async result => {
          this.savingBlogState = REQUEST_STATE.FINISHED_OK;
          this.$router.push({
            name: "postList",
            params: { blogId: result.data.createBlog._id }
          });
        })
        .catch(error => {
          this.savingBlogState = REQUEST_STATE.FINISHED_ERROR;
          this.errors.push(
            "Blog created failed with following message: " + error
          );
          throw new Error(error);
        });
    }
  }
};
</script>
