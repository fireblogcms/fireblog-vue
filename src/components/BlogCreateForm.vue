<template>
  <div class="text-center">
    <!-- special text if this is the very first blog :) -->
    <p v-if="isFirstBlog && user" class="mb-12 text-3xl font-bold">
      {{ $t("views.blogCreate.gladToSeeYouHere") }}, {{ user.name }} 🤗
    </p>

    <div>
      <label class="text-2xl font-bold">{{
        $t("views.blogCreate.fields.title.label")
      }}</label>

      <p class="mb-4">{{ $t("views.blogCreate.fields.title.help") }}</p>

      <div class="flex justify-between items-center">
        <div class="flex-1">
          <AppFieldText
            v-model="inputs.name"
            :error="formErrors.name"
            maxlength="250"
            :placeholder="generate()"
          />
        </div>
        <div class="ml-2">
          <AppButton @click="poeticName()">
            🐣 Nom surprise
          </AppButton>
        </div>
      </div>
    </div>

    <div class="mt-10 mb-16">
      <label class="text-2xl font-bold">{{
        $t("views.blogCreate.fields.description.label")
      }}</label>
      <!--
      <p class="mb-4 text-sm">
        {{ $t("views.blogCreate.fields.description.help") }}
      </p>
      -->
      <AppTextarea class="mt-3" v-model="inputs.description" maxlength="250" />
    </div>
    <div>
      <label class="text-2xl font-bold">{{
        $t("views.blogCreate.fields.ambiance.label")
      }}</label>
      <AppFieldSelect
        class="mb-6"
        :options="[
          { value: '__NONE__', label: 'Aucune' },
          { value: '/illustrations/landscape-1.jpg', label: 'Landscape 1' },
          { value: '/illustrations/landscape-2.jpg', label: 'Landscape 2' },
          { value: '/illustrations/landscape-3.jpg', label: 'Landscape 3' },
        ]"
        :value="inputs.backgroundImage"
        @change="onBackgroundImageChange"
      />
    </div>

    <div class="flex flex-col md:flex-row items-center justify-center">
      <AppButton
        v-if="!isFirstBlog"
        class="mb-4 md:mb-0 mx-4"
        @click="$router.push('/')"
      >
        {{ $t("views.blogCreate.cancelButton").toUpperCase() }}
      </AppButton>
      <AppButton
        :loading="savingBlogState === 'PENDING'"
        class="mx-4"
        color="primary"
        @click="onCreateClick"
      >
        ✨ {{ $t("views.blogCreate.createButton").toUpperCase() }}
      </AppButton>
    </div>
  </div>
</template>

<script>
import AppButton from "@/ui-kit/AppButton";
import AppFieldText from "@/ui-kit/AppFieldText";
import AppTextarea from "@/ui-kit/AppTextarea";
import AppFieldSelect from "@/ui-kit/AppFieldSelect";
import { generate } from "@/utils/fantasyName.js";
import apolloClient from "@/utils/apolloClient";
import { getUser, REQUEST_STATE, toast } from "@/utils/helpers";
import gql from "graphql-tag";
import {
  getMyBlogsQuery,
  getUserQuery,
  createBlogMutation,
} from "@/utils/queries";

export default {
  components: {
    AppButton,
    AppFieldText,
    AppTextarea,
    AppFieldSelect,
  },
  data() {
    return {
      isFirstBlog: false,
      errors: [],
      formErrors: {},
      savingBlogState: REQUEST_STATE.NOT_STARTED,
      user: null,
      languageList: null,
      inputs: {
        name: generate(),
        blogContentDefaultLocale: null,
        backgroundImage: this.$store.state.global.backgroundImage,
      },
    };
  },
  created() {
    this.initData();
    this.isFirstBlog = this.$route.query.first === "1";
    this.generate = generate;
  },
  methods: {
    poeticName() {
      this.inputs.name = generate();
    },
    onBackgroundImageChange(value) {
      if (value === "__NONE__") {
        value = null;
      }
      this.$store.commit("backgroundImage", value);
    },
    async initData() {
      getUser()
        .then(user => (this.user = user))
        .catch(error => {
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
              backgroundImage: this.inputs.backgroundImage,
              name: this.inputs.name,
              description: this.inputs.description,
              blogSet: this.$route.params.blogSetId,
            },
          },
        })
        .then(async result => {
          // goal: has created a blog
          window._paq.push(["trackGoal", 1]);

          this.$router
            .push({
              name: "postList",
              params: { blogId: result.data.createBlog._id },
            })
            .then(() => (this.savingBlogState = REQUEST_STATE.FINISHED_OK));
        })
        .catch(error => {
          this.savingBlogState = REQUEST_STATE.FINISHED_ERROR;
          toast(this, error, "error");
          throw new Error(error);
        });
    },
  },
};
</script>
