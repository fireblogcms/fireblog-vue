import { action } from "@storybook/addon-actions";
import "../.storybook/utils.css";
import Button from "@/ui-kit/Button";

export default {
  title: "Button",
  component: Button
};

export const Default = () => ({
  components: { Button },
  template: '<Button @click="action">Default</Button>',
  methods: { action: action("clicked") }
});

export const DefaultSmall = () => ({
  components: { Button },
  template: '<Button size="small" @click="action">Default small</Button>',
  methods: { action: action("clicked") }
});

export const Primary = () => ({
  components: { Button },
  template: '<Button type="primary" @click="action">Primary</Button>',
  methods: { action: action("clicked") }
});

export const PrimaryOutlined = () => ({
  components: { Button },
  template:
    '<Button type="primary-outlined" @click="action">Primary Outlined</Button>',
  methods: { action: action("clicked") }
});
