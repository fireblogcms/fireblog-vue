import { addDecorator } from "@storybook/vue";

// Decorator to all stories
addDecorator(() => ({
  template: `
      <div class="p-4">
        <story/>
      </div>
    `
}));
