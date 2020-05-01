<template>
  <div>
    <AppPanel>
      <h2 class="mb-6 text-4xl font-bold">
        {{ $t("views.blogSettings.dangerZone.title") }}
      </h2>
      <AppButton
        color="primary"
        @click="onDeleteBlogClick"
      >
        {{ $t("views.blogSettings.dangerZone.deleteButton") }}
      </AppButton>
    </AppPanel>

    <BulmaModal class="api-modal" v-model="showDeleteBlogModal">
      <template
        #title
      >{{ $t('views.blogSettings.dangerZone.deleteModal.title', {blogName: `"${blog.name}"`}) }}</template>
      <template #body>
        <div>
          <div class="field">
            <label class="label">{{ $t("views.blogSettings.dangerZone.deleteModal.content") }}</label>
            <div class="control">
              <input v-model="deleteBlogConfirmName" class="input is-large" type="text" />
              <p
                v-if="deleteBlogConfirmError"
                class="help is-danger"
              >{{$t("views.blogSettings.dangerZone.deleteModal.nameMismatch") }}</p>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button
          @click="showDeleteBlogModal = false"
          class="button is-large"
        >{{ $t("views.blogSettings.dangerZone.deleteModal.cancelButton") }}</button>
        <button
          :class="{ 'is-loading': deleteBlogState === 'PENDING' }"
          :disabled="deleteBlogState === 'PENDING'"
          @click="onDeleteBlogConfirm"
          class="button is-danger is-large"
        >{{ $t("views.blogSettings.dangerZone.deleteModal.deleteButton") }}</button>
      </template>
    </BulmaModal>
  </div>
</template>

<script>
import AppButton from "@/ui-kit/AppButton";
import AppPanel from "@/ui-kit/AppPanel";
import BulmaModal from "@/components/BulmaModal";
import { REQUEST_STATE, toast } from "@/utils/helpers";
import apolloClient from "@/utils/apolloClient";
import { deleteBlogMutation } from "@/utils/queries";

export default {
  components: {
    AppButton,
    AppPanel,
    BulmaModal
  },
  props: {
    blog: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showDeleteBlogModal: false,
      deleteBlogConfirmName: "",
      deleteBlogConfirmError: false,
      deleteBlogState: REQUEST_STATE.FINISHED_OK
    };
  },
  methods: {
    onDeleteBlogClick() {
      this.deleteBlogConfirmName = "";
      this.deleteBlogConfirmError = false;
      this.showDeleteBlogModal = true;
    },
    onDeleteBlogConfirm() {
      this.deleteBlogState = REQUEST_STATE.NOT_STARTED;
      if (this.deleteBlogConfirmName.trim() === this.blog.name.trim()) {
        this.deleteBlogState = REQUEST_STATE.PENDING;
        this.deleteBlogConfirmError = false;
        apolloClient
          .mutate({
            mutation: deleteBlogMutation,
            variables: {
              _id: this.$route.params.blogId
            }
          })
          .then(async () => {
            this.deleteBlogState = REQUEST_STATE.FINISHED_OK;
            this.$router.push({ name: "blogList" });
          })
          .catch(e => {
            toast(this, e, "error");
            throw new Error(e);
          });
      } else {
        this.deleteBlogConfirmError = true;
      }
    }
  }
};
</script>
