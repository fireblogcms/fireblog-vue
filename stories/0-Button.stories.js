import { action } from "@storybook/addon-actions";
import "../.storybook/utils.css";
import Button from "../src/ui-kit/Button";

export default {
  title: "Button",
  component: Button
};

export const Default = () => ({
  components: { Button },
  template: '<Button @click="action">Default</Button>',
  methods: { action: action("clicked") }
});

export const Primary = () => ({
  components: { Button },
  template: '<Button class="btn-primary" @click="action">Primary</Button>',
  methods: { action: action("clicked") }
});

export const PrimaryOutlined = () => ({
  components: { Button },
  template:
    '<Button class="btn-primary-outlined" @click="action">Primary Outlined</Button>',
  methods: { action: action("clicked") }
});
