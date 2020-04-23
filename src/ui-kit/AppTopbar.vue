<template>
  <div class="flex justify-between bg-primary px-10 py-2">
    <div class="flex items-center">
      <div
        class="flex items-center justify-center bg-white w-16 h-16 rounded-full cursor-pointer"
        @click="onLogoClick"
      >
        <img class="w-16" src="/logo-solo.png" />
      </div>
      <div class="text-xs bg-secondary rounded-sm px-2 py-1 ml-2 mb-6 mr-6">
        Bêta version
      </div>

      <portal-target name="topbar-left">
        <!--
          This component can be located anywhere in your App.
          The slot content of the above portal component will be rendered here.
        -->
      </portal-target>
    </div>
    <div class="flex items-center">
      <portal-target name="topbar-right">
        <!--
          This component can be located anywhere in your App.
          The slot content of the above portal component will be rendered here.
        -->
      </portal-target>

      <AppButton
        size="small"
        v-if="apiHelpIsVisible()"
        @click="onApiClick"
      >
        <img
          class="w-6 mr-2"
          src="/images/graphql.svg"
        />
        <span>API</span>
      </AppButton>
    </div>
  </div>
</template>

<script>
import AppButton from "@/ui-kit/AppButton";

export default {
  components: {
    AppButton
  },
  methods: {
    onLogoClick() {
      this.$router.push("/");
    },
    apiHelpIsVisible() {
      const authorizedNames = ["postList", "postUpdate", "postCreate"];
      if (authorizedNames.includes(this.$route.name)) {
        return true;
      }
      return false;
    },
    async onApiClick() {
      // const context = {
      //   slug: "{{POST_SLUG}}",
      //   locale: navigator.language || navigator.userLanguage
      // };
      // if (this.$route.name === "postList") {
      //   const blog = await getBlog(this.$route.params.blogId);
      //   context.locale = blog.contentDefaultLocale;
      // }
      // if (this.$route.name === "postUpdate") {
      //   const [blog, post] = await Promise.all([
      //     getBlog(this.$route.params.blogId),
      //     getPost(this.$route.params.postId)
      //   ]);
      //   context.locale = blog.contentDefaultLocale;
      //   context.slug = post.slug;
      // }
      // this.apiModalExampleList = apiExamples(context);
      // this.showApiModal = true;
    }
  }
}
</script>
