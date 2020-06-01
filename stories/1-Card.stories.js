import "../.storybook/utils.css";
import AppCard from "@/ui-kit/AppCard";

export default {
  title: "Card",
  component: AppCard
};

export const Default = () => ({
  components: { AppCard },
  template:
    "<AppCard><template #content>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</template></AppCard>"
});

export const WithImage = () => ({
  components: { AppCard },
  template:
    "<AppCard image='https://miro.medium.com/max/1400/0*zBu6EBAwjXXXHz-z'><template #content>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</template></AppCard>"
});
