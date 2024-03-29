import { action } from "@storybook/addon-actions";
import "../.storybook/utils.css";
import AppButton from "@/ui-kit/AppButton";

export default {
  title: "Button",
  component: AppButton
};

export const Default = () => ({
  components: { AppButton },
  template: '<AppButton @click="action">Default</AppButton>',
  methods: { action: action("clicked") }
});

export const DefaultSmall = () => ({
  components: { AppButton },
  template: '<AppButton size="small" @click="action">Default small</AppButton>',
  methods: { action: action("clicked") }
});

export const Primary = () => ({
  components: { AppButton },
  template: '<AppButton color="primary" @click="action">Primary</AppButton>',
  methods: { action: action("clicked") }
});

export const PrimaryOutlined = () => ({
  components: { AppButton },
  template:
    '<AppButton color="primary-outlined" @click="action">Primary outlined</AppButton>',
  methods: { action: action("clicked") }
});

export const DefaultLoading = () => ({
  components: { AppButton },
  template: '<AppButton :loading="true" @click="action">Default</AppButton>',
  methods: { action: action("clicked") }
});

export const DefaultSmallLoading = () => ({
  components: { AppButton },
  template:
    '<AppButton size="small" :loading="true" @click="action">Default small</AppButton>',
  methods: { action: action("clicked") }
});

export const PrimaryLoading = () => ({
  components: { AppButton },
  template:
    '<AppButton color="primary" :loading="true" @click="action">Primary</AppButton>',
  methods: { action: action("clicked") }
});

export const PrimaryOutlinedLoading = () => ({
  components: { AppButton },
  template:
    '<AppButton color="primary-outlined" :loading="true" @click="action">Primary outlined</AppButton>',
  methods: { action: action("clicked") }
});
