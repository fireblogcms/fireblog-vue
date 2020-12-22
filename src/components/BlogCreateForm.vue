<template>
  <div>
    <!-- special text if this is the very first blog :) -->
    <p v-if="isFirstBlog && user" class="mb-12 text-3xl font-bold">
      {{ $t("views.blogCreate.gladToSeeYouHere") }}, {{ user.name }} 🤗
    </p>

    <div>
      <label class="text-2xl font-bold">{{
        $t("views.blogCreate.fields.title.label")
      }}</label>

      <!--<p class="mb-4">{{ $t("views.blogCreate.fields.title.help") }}</p>-->

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
            🐣 {{ $t("views.blogCreate.surpriseName").toUpperCase() }}
          </AppButton>
        </div>
      </div>
    </div>

    <div class="mt-10">
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

    <div class="mt-10">
      <label class="text-2xl font-bold">{{
        $t("views.blogCreate.fields.ambiance.label")
      }}</label>
      <AppFieldSelect
        class="mb-6"
        :options="wallpapersSelectOptions"
        :value="inputs.wallpaper"
        @change="onWallPaperChange"
      />
    </div>

    <div class="flex items-center justify-center mt-10">
      <AppButton v-if="!isFirstBlog" class="mr-4" @click="$router.push('/')">
        {{ $t("views.blogCreate.cancelButton").toUpperCase() }}
      </AppButton>
      <AppButton
        :loading="savingBlogState === 'PENDING'"
        class=""
        color="primary"
        @click="onCreateClick"
      >
        {{ $t("views.blogCreate.createButton").toUpperCase() }}
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
import { wallpapersSelectOptions } from "@/config.js";

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
        wallpaper: this.$store.state.global.wallpaper,
      },
    };
  },
  created() {
    this.initData();
    this.isFirstBlog = this.$route.query.first === "1";
    this.generate = generate;
    this.wallpapersSelectOptions = wallpapersSelectOptions;
  },
  methods: {
    poeticName() {
      this.inputs.name = generate();
    },
    onWallPaperChange(value) {
      if (value === "__NONE__") {
        value = null;
      }
      this.$store.commit("wallpaper", value);
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
              wallpaper: this.inputs.wallpaper,
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
