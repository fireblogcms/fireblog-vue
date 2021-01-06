<template>
  <div class="pb-12 container mx-auto">
    <form @submit.prevent>
      <!-- PUBLICATION PARAMETERS -->
      <div class="">
        <h3 class="text-2xl font-bold mx-8 flex items-center">
          <div>
            <img
              width="30"
              class="inline mr-5"
              src="/images/icon-feather.png"
            />
          </div>
          <div class="text-xl md:text-2xl">
            {{ $t("views.postForm.publicationSettings") }}
          </div>
        </h3>
        <div class="flex flex-col md:flex-row p-8">
          <div class="w-full md:w-1/2 md:mr-3">
            <!-- IMAGE UPLOAD FIELD -->
            <label class="font-bold">
              {{ $t("views.postForm.fields.featuredImage.label") }}
            </label>
            <p class="text-sm italic mb-2">
              {{ $t("views.postForm.fields.featuredImage.help") }}
            </p>
            <S3ImageUpload
              :blogId="$route.params.blogId"
              @onUploadingStateChange="onUploadingStateChange"
              :initialImage="vuexFormGetValue(FORM_ID, 'image')"
              @onUploaded="onUploaded"
            />
          </div>
          <div class="w-full md:w-1/2 md:ml-3 mt-4 md:mt-0">
            <!-- TEASER FIELD -->
            <label class="font-bold">
              {{ $t("views.postForm.fields.teaser.label") }}
            </label>
            <p class="text-sm italic mb-2">
              {{ $t("views.postForm.fields.teaser.help") }}
            </p>
            <!-- limited to 250 because of google, facebook, twitter and co preview card limitation -->
            <AppTextarea
              :value="vuexFormGetValue(FORM_ID, 'teaser')"
              @input="onTeaserInput"
              :error="vuexFormGetError(FORM_ID, 'teaser')"
              placeholder="Teaser"
              maxlength="250"
            />

            <PostFormSchedulePublication
              class="mt-5"
              :formId="FORM_ID"
              :existingPost="existingPost"
            />

            <!-- FEATURE FIELD -->
            <FeatureField
              class="mt-10"
              :checked="vuexFormGetValue(FORM_ID, 'featured')"
              @onFeatureChange="onFeatureChange"
            />

            <!-- TAGS -->
            <div class="mt-10">
              <div class="flex flex-col md:flex-row">
                <div class="w-full">
                  <h3 class="font-bold">
                    {{ $t("views.postForm.sectionTags.title") }}
                  </h3>
                  <p class="text-sm italic mb-2">
                    {{ $t("views.postForm.sectionTags.description") }}
                  </p>
                  <TagAutocomplete
                    :blogId="$route.params.blogId"
                    :formId="FORM_ID"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SEO PARAMETERS -->
      <div class="mt-16 p-8">
        <h3 class="text-2xl font-bold flex items-center mb-8">
          <div>
            <img width="30" class="inline mr-5" src="/images/icon-seo.png" />
          </div>
          <div class="text-xl md:text-2xl">
            {{ $t("views.postForm.seoOptimizations") }}
          </div>
        </h3>
        <div class="flex flex-col md:flex-row items-top">
          <div class="w-full md:w-1/2 md:mr-8">
            <!-- SLUG FIELD -->
            <SlugField
              :loading="generateSlugState === 'PENDING'"
              class="mt-4"
              :value="vuexFormGetValue(FORM_ID, 'slug')"
              :error="vuexFormGetError(FORM_ID, 'slug')"
              :showToggleLockButton="
                vuexFormGetValue(FORM_ID, 'slugShowToggleLockButton')
              "
              :locked="vuexFormGetValue(FORM_ID, 'slugIsLocked')"
              @inputDebounced="onSlugChange"
              @onUnlock="onSlugUnlock"
              @onLock="onSlugLock"
              :help="slugHelp"
            />

            <AppFieldText
              label="Meta title"
              class="mt-10"
              :value="vuexFormGetValue(FORM_ID, 'metaTitle')"
              @input="onMetaTitleInput"
              placeholder="Seo meta title"
              maxlength="250"
            />
            <AppFieldText
              class="mt-8"
              label="Meta description"
              :value="vuexFormGetValue(FORM_ID, 'metaDescription')"
              @input="onMetaDescriptionInput"
              placeholder="Seo meta description"
              maxlength="250"
            />
          </div>
          <div class="w-full md:w-1/2 md:mr-3">
            <p class="mb-4 font-bold mt-8 md:mt-0">
              {{ $t("views.postForm.advancedSettingsModal.previewGoogle") }}
            </p>
            <div class="p-6 bg-white shadow-around rounded-lg">
              <PreviewGoogleResult
                :title="previewGoogleValues().title"
                :description="previewGoogleValues().description"
                :url="
                  `https://example.com/post/${vuexFormGetValue(
                    FORM_ID,
                    'slug'
                  )}`
                "
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import AppTextarea from "@/ui-kit/AppTextarea";
import AppFieldText from "@/ui-kit/AppFieldText";
import S3ImageUpload from "@/ui-kit/S3ImageUpload";
import TagAutocomplete from "./TagAutocomplete";
import { REQUEST_STATE, generatePostSlugFromServer } from "@/utils/helpers";
import {
  vuexFormGetValue,
  vuexFormGetError,
  vuexFormSetValue,
  vuexFormSetError,
} from "@/utils/vuexForm";
import SlugField from "@/ui-kit/SlugField";
import FeatureField from "./FeatureField";
import PostFormSchedulePublication from "./PostFormSchedulePublication";
import PreviewGoogleResult from "./PreviewGoogleResult";
import apolloClient from "@/utils/apolloClient";

const FORM_ID = "postForm";

export default {
  components: {
    AppTextarea,
    AppFieldText,
    PreviewGoogleResult,
    S3ImageUpload,
    TagAutocomplete,
    SlugField,
    FeatureField,
    PostFormSchedulePublication,
  },
  props: {
    existingPost: {
      type: [Object, null],
    },
  },
  data() {
    const data = {
      uploadingState: null,
      file: null,
      generateSlugState: REQUEST_STATE.NOT_STARTED,
    };
    return data;
  },
  created() {
    this.vuexFormGetError = vuexFormGetError;
    this.vuexFormGetValue = vuexFormGetValue;
    this.vuexFormSetValue = vuexFormSetValue;
    this.FORM_ID = FORM_ID;
  },
  computed: {
    publishLaterDisabledDates() {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return {
        to: d,
      };
    },
    slugHelp() {
      return this.$t("components.slugField.help", {
        exampleUrl: `https://example.com/post/<span class="font-bold text-primary">${vuexFormGetValue(
          FORM_ID,
          "slug"
        )}</span>`,
      });
    },
  },
  methods: {
    previewGoogleValues() {
      let title = vuexFormGetValue(FORM_ID, "title");
      let description = vuexFormGetValue(FORM_ID, "teaser");
      if (vuexFormGetValue(FORM_ID, "metaTitle").trim()) {
        title = vuexFormGetValue(FORM_ID, "metaTitle").trim();
      }
      if (vuexFormGetValue(FORM_ID, "metaDescription").trim()) {
        description = vuexFormGetValue(FORM_ID, "metaDescription").trim();
      }
      return {
        title,
        description,
      };
    },
    onUploaded(fileUrl) {
      vuexFormSetValue(FORM_ID, "image", fileUrl);
    },
    onTeaserInput(value) {
      vuexFormSetValue(FORM_ID, "teaser", value);
    },
    onMetaTitleInput(value) {
      vuexFormSetValue(FORM_ID, "metaTitle", value);
    },
    onMetaDescriptionInput(value) {
      vuexFormSetValue(FORM_ID, "metaDescription", value);
    },
    onFeatureChange(value) {
      vuexFormSetValue(FORM_ID, "featured", value);
    },
    onSlugChange(value) {
      vuexFormSetValue(FORM_ID, "slug", value);
      if (value.trim().length === 0) {
        return;
      }
      this.generateSlugState = REQUEST_STATE.PENDING;
      generatePostSlugFromServer({
        blogId: this.$route.params.blogId,
        source: value,
      })
        .then(response => {
          this.generateSlugState = REQUEST_STATE.FINISHED_OK;
          const slug = response.slug;
          vuexFormSetValue(FORM_ID, "slug", slug);
          if (
            response.alreadyExists === true &&
            response.usedByPost._id !== this.$route.params.postId
          ) {
            const slugError = `This slug is already used by this post: ${response.usedByPost.title}`;
            vuexFormSetError(FORM_ID, "slug", slugError);
          } else {
            vuexFormSetError(FORM_ID, "slug", null);
          }
        })
        .catch(e => {
          this.generateSlugState = REQUEST_STATE.FINISHED_ERROR;
          throw new Error(e);
          toast(this, e, "error");
        });
    },
    onSlugInput(event) {
      vuexFormSetValue(FORM_ID, "slug", event);
    },
    onSlugUnlock() {
      vuexFormSetValue(FORM_ID, "slugIsLocked", false);
    },
    onSlugLock() {
      vuexFormSetValue(FORM_ID, "slugIsLocked", true);
    },
    onUploadingStateChange(state) {
      this.uploadingState = state;
      this.$emit("onUploadingStateChange", state);
    },
  },
};
</script>
