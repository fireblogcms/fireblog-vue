<template>
  <div>
    <AppPanel type="danger" class="text-center">
      <h2 class="mb-6 text-xl md:text-2xl font-bold uppercase">
        {{ $t("views.blogSettings.dangerZone.title") }}
      </h2>
      <AppButton color="danger" @click="onDeleteBlogClick">
        <span class="text-xl">{{
          $t("views.blogSettings.dangerZone.deleteButton")
        }}</span>
      </AppButton>
    </AppPanel>

    <AppModal name="deleteBlogModal">
      <div class="text-xl md:text-2xl font-bold" slot="header">
        {{
          $t("views.blogSettings.dangerZone.deleteModal.title", {
            blogName: `"${blog.name}"`,
          })
        }}
      </div>
      <div slot="body">
        <AppFieldText
          v-model="deleteBlogConfirmName"
          :error="deleteBlogConfirmError"
          :label="$t('views.blogSettings.dangerZone.deleteModal.content')"
        />

        <div
          class="pt-12 flex flex-col md:flex-row items-center justify-center"
        >
          <AppButton class="mx-4" @click="closeDeleteBlogModal">
            <span class="text-xl">
              {{ $t("views.blogSettings.dangerZone.deleteModal.cancelButton") }}
            </span>
          </AppButton>

          <AppButton
            :loading="deleteBlogState === 'PENDING'"
            class="mt-4 md:mt-0 mx-4"
            color="danger"
            @click="onDeleteBlogConfirm"
          >
            <span class="text-xl">
              {{ $t("global.delete") }}
            </span>
          </AppButton>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script>
import AppButton from "@/ui-kit/AppButton";
import AppFieldText from "@/ui-kit/AppFieldText";
import AppModal from "@/ui-kit/AppModal";
import AppPanel from "@/ui-kit/AppPanel";
import { REQUEST_STATE, toast } from "@/utils/helpers";
import apolloClient from "@/utils/apolloClient";
import { deleteBlogMutation } from "@/utils/queries";

export default {
  components: {
    AppButton,
    AppFieldText,
    AppModal,
    AppPanel,
  },
  props: {
    blog: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      deleteBlogConfirmName: "",
      deleteBlogConfirmError: null,
      deleteBlogState: REQUEST_STATE.FINISHED_OK,
    };
  },
  methods: {
    closeDeleteBlogModal() {
      this.$store.commit("modalShowing/close", "deleteBlogModal");
    },
    onDeleteBlogClick() {
      this.deleteBlogConfirmName = "";
      this.deleteBlogConfirmError = null;
      this.$store.commit("modalShowing/open", "deleteBlogModal");
    },
    onDeleteBlogConfirm() {
      this.deleteBlogState = REQUEST_STATE.NOT_STARTED;
      if (this.deleteBlogConfirmName.trim() === this.blog.name.trim()) {
        this.deleteBlogState = REQUEST_STATE.PENDING;
        this.deleteBlogConfirmError = null;
        apolloClient
          .mutate({
            mutation: deleteBlogMutation,
            variables: {
              _id: this.$route.params.podId,
            },
          })
          .then(() => {
            this.deleteBlogState = REQUEST_STATE.FINISHED_OK;
            this.closeDeleteBlogModal();
            this.$router.push({ name: "blogSetList" });
          })
          .catch(e => {
            toast(this, e, "error");
            throw new Error(e);
          });
      } else {
        this.deleteBlogConfirmError = this.$t(
          "views.blogSettings.dangerZone.deleteModal.nameMismatch"
        );
      }
    },
  },
};
</script>
