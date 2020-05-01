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
