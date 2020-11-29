import "../.storybook/utils.css";
import AppButton from "@/ui-kit/AppButton";
import AppModal from "@/ui-kit/AppModal";
import store from "../src/store";

export default {
  title: "Modal",
  component: AppModal,
};

export const Default = () => ({
  components: { AppButton, AppModal },
  store,
  template: `<div>
      <AppButton color="primary" @click="$store.commit('modalShowing/open', 'storyModal')">Open modal</AppButton>
      <AppModal name="storyModal">
        <div class="text-2xl font-bold" slot="header">
          Title of the modal
        </div>
        <div class="flex flex-col items-center" slot="body">
          <p class="text-xl">
            Content of the modal
          </p>
          <AppButton
            class="mt-10"
            color="primary"
            @click="$store.commit('modalShowing/close', 'storyModal')"
          >
            Close
          </AppButton>
        </div>
      </AppModal>
    </div>`,
});

export const Fullscreen = () => ({
  components: { AppButton, AppModal },
  store,
  template: `<div>
      <AppButton color="primary" @click="$store.commit('modalShowing/open', 'storyModal')">Open modal</AppButton>
      <AppModal name="storyModal" :fullscreen="true">
        <div class="text-2xl font-bold" slot="header">
          Title of the modal
        </div>
        <div class="flex flex-col items-center" slot="body">
          <p class="text-xl">
            Content of the modal
          </p>
          <AppButton
            class="mt-10"
            color="primary"
            @click="$store.commit('modalShowing/close', 'storyModal')"
          >
            Close
          </AppButton>
        </div>
      </AppModal>
    </div>`,
});
