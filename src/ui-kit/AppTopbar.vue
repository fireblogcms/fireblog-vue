<template>
  <div class="relative z-20 bg-white shadow-xs" :class="`route-${$route.name}`">
    <div class="h-full flex justify-between px-3 py-2 container mx-auto">
      <div class="flex items-center">
        <!--
        <img
          class="w-16 rounded-full cursor-pointer mr-4"
          src="/images/logo-solo.png"
          @click="onLogoClick"
        />
        -->

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
          size="sm"
          v-if="isContactVisible()"
          @click="onContactClick"
          class="mr-3"
        >
          <img class="w-6 md:mr-2" src="/images/icon-chat.svg" />
          <span class="hidden md:inline text-sm md:text-md uppercase"
            >SUPPORT</span
          >
        </AppButton>

        <AppButton size="sm" v-if="isApiHelpVisible()" @click="onApiClick">
          <img class="w-6 md:mr-2" src="/images/graphql.svg" />
          <span class="text-sm md:text-md">
            <span class="hidden md:inline">API</span>
          </span>
        </AppButton>

        <div v-if="me" class="relative cursor-pointer ml-4 md:ml-6">
          <div @click="dropdownMenuActive = !dropdownMenuActive">
            <img
              v-if="me.picture"
              :src="me.picture"
              class="w-12 h-12 rounded-full"
            />
            <span v-if="!me.picture">{{ me.name }}</span>
          </div>
          <div
            v-if="dropdownMenuActive"
            v-click-outside="() => (dropdownMenuActive = false)"
            class="absolute right-0 min-w-15 mt-2 py-3 flex flex-col bg-white rounded-md shadow-around"
            role="menu"
          >
            <router-link
              :to="{ name: 'blogSetList' }"
              class="px-4 py-2 font-bold hover:bg-gray-100"
            >
              {{ $t("topbar.accountMenu.myBlogs") }}
            </router-link>
            <router-link
              v-for="edge in me.blogs.edges"
              :key="edge.node._id"
              :to="{
                name: 'postList',
                params: { blogId: edge.node._id, blogSetId: edge.node.blogSet },
              }"
              class="px-4 py-2 hover:bg-gray-100"
            >
              {{ edge.node.name }}
            </router-link>
            <div class="h-px bg-gray-300 my-2"></div>
            <router-link
              :to="{ name: 'profile' }"
              class="px-4 py-2 hover:bg-gray-100"
            >
              {{ $t("topbar.accountMenu.myAccount") }}
            </router-link>
            <router-link
              :to="{ name: 'logout' }"
              class="px-4 py-2 hover:bg-gray-100"
            >
              {{ $t("topbar.accountMenu.logout") }}
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- GRAPHQL API DOCUMENTATION -->
    <AppModal name="graphQLApiModal">
      <div
        class="flex flex-col md:flex-row items-center justify-between"
        slot="header"
      >
        <span class="text-2xl font-bold">API</span>
        <span
          @click="onOpenGraphQLExplorerClick"
          class="text-indigo-600 mr-5 font-bold cursor-pointer"
        >
          {{ $t("apiModal.openGraphQLExplorer") }}
        </span>
      </div>
      <div slot="body">
        <p class="text-lg font-bold">GraphQL endpoint</p>
        <input
          type="text"
          disabled
          class="bg-gray-100 rounded-md w-full px-2 text overflow-x-auto"
          :value="blogSetApiUrl"
        />

        <template v-if="apiModalExampleList.length === 0">
          <ContentLoader height="200" class=" my-16">
            <rect x="0" y="0" rx="3" ry="3" height="100%" />
          </ContentLoader>
        </template>
        <template v-if="apiModalExampleList.length > 0">
          <div
            class="mt-12"
            :id="`example-${example.id}`"
            v-for="example in apiModalExampleList"
            :key="example.id"
          >
            <div class="my-4 flex justify-between">
              <span class="text-lg font-bold">{{ example.label }}</span>
              <a
                :href="`${blogSetApiUrl}?query=${encodeURI(example.snippet)}`"
                target="_blank"
              >
                <span
                  class="font-bold bg-primary text-white py-3 rounded px-5 shadow hover:bg-primary-darker transition-all"
                >
                  {{ $t("apiModal.tryItButton") }}
                </span>
              </a>
            </div>
            <div class="px-6 bg-gray-100 rounded-md text-xs">
              <pre>
                <code class="language-graphql">{{ example.snippet }}</code>
              </pre>
            </div>
          </div>
        </template>
      </div>
    </AppModal>

    <!-- CONTACT -->
    <AppModal width="sm" name="contactModal">
      <div class="text-2xl font-bold leading-7" slot="header">
        {{ $t("contactModal.title") }}
      </div>
      <div slot="body">
        <p>{{ $t("contactModal.content") }}</p>
        <div class="mt-2">
          <div class="flex border-gray-200 py-3 border-b">
            <img width="20" src="/images/icon-email.svg" class="mr-2" />
            <a
              @click="onMailSupportClick"
              class="text-primary font-bold"
              href="mailto:support@fireblogcms.com"
            >
              support@fireblogcms.com
            </a>
          </div>
          <div class="flex border-gray-200 py-3">
            <img width="20" src="/images/icon-chat-2.svg" class="mr-2" />
            <a
              class="text-primary font-bold"
              target="_blank"
              href="https://discord.gg/zuNUKNx3hH"
            >
              {{ $t("contactModal.discord") }}
            </a>
          </div>
        </div>
        <img
          class="my-4 rounded h-56 mx-auto"
          src="/images/illustration-support.png"
        />
      </div>
    </AppModal>

    <!-- FREE TRIAL ENDED -->
    <AppModal name="freeTrialEndedModal">
      <div class="text-2xl font-bold" slot="header">
        {{ $t("freeTrialEndedModal.title") }}
      </div>
      <div class="flex flex-col items-center" slot="body">
        <img
          loading="lazy"
          class="h-64 mb-10 rounded"
          src="https://s3.eu-west-3.amazonaws.com/app.fireblogcms.com/gifs/unsubscribe-sad.gif"
        />
        <p class="text-xl">
          {{ $t("freeTrialEndedModal.body") }}
        </p>
        <AppButton class="mt-10" color="primary" @click="onCheckOutPlansClick">
          {{ $t("freeTrialEndedModal.button") }}
        </AppButton>
      </div>
    </AppModal>
  </div>
</template>

<script>
import AppButton from "@/ui-kit/AppButton";
import AppModal from "@/ui-kit/AppModal";
import {
  getBlog,
  getPost,
  getUser,
  toast,
  getRandomGif,
} from "@/utils/helpers";
import apiExamples from "@/apiExamples";
import { ContentLoader } from "vue-content-loader";
import apolloClient from "@/utils/apolloClient";
import gql from "graphql-tag";

function getRandomSupportGif() {
  const gifs = [
    // "https://s3.eu-west-3.amazonaws.com/app.fireblogcms.com/gifs/support-friends.gif",
    // "https://s3.eu-west-3.amazonaws.com/app.fireblogcms.com/gifs/support-ringo-star-tea.gif",
    "https://s3.eu-west-3.amazonaws.com/app.fireblogcms.com/gifs/support-women.gif",
  ];
  return getRandomGif(gifs);
}

export default {
  components: {
    AppButton,
    AppModal,
    ContentLoader,
  },
  data() {
    return {
      apiModalExampleList: [],
      dropdownMenuActive: false,
      me: null,
      blogSet: null,
      supportGif: null, // do not load any gifs on first load of the page !,
      blogSetApiUrl: null,
    };
  },
  mounted() {
    this.initData();
  },
  watch: {
    $route: function() {
      this.dropdownMenuActive = false;
    },
  },
  methods: {
    onOpenGraphQLExplorerClick() {
      // goal: open GraphQL Explorer
      window._paq.push(["trackGoal", 7]);
      window.open(this.blogSetApiUrl, "_blank");
    },
    onMailSupportClick() {
      // goal: try to contact support by mail
      window._paq.push(["trackGoal", 9]);
      window._paq.push(["trackEvent", "Support", "Mail", "Click"]);
    },
    onContactClick() {
      this.supportGif = getRandomSupportGif();
      this.$store.commit("modalShowing/open", "contactModal");
    },
    getRandomSupportGif() {
      const gifs = [
        "https://s3.eu-west-3.amazonaws.com/app.fireblogcms.com/gifs/support-dog.gif",
        "https://s3.eu-west-3.amazonaws.com/app.fireblogcms.com/gifs/support-jdepp.gif",
        "https://s3.eu-west-3.amazonaws.com/app.fireblogcms.com/gifs/support-ringo-star-tea.gif",
        "https://s3.eu-west-3.amazonaws.com/app.fireblogcms.com/gifs/support-women.gif",
        "https://s3.eu-west-3.amazonaws.com/app.fireblogcms.com/gifs/support-friends.gif",
      ];
      return getRandomGif(gifs);
    },
    async initData() {
      return viewData()
        .then(response => {
          this.me = response.data.me;
          // we can have only one blogset for now
          this.blogSet = response.data.blogSets[0];
          const blogSetId = this.$route.params.blogSetId || this.blogSet._id;
          this.blogSetApiUrl = `${process.env.VUE_APP_GRAPHQL_BLOGSET_BASE_URL}/${blogSetId}`;
        })
        .catch(error => {
          toast(this, error, "error");
          throw new Error(error);
        });
    },
    onLogoClick() {
      this.$router.push("/");
    },
    isApiHelpVisible() {
      const authorizedNames = [
        "postList",
        "postUpdate",
        "postCreate",
        "blogSetList",
      ];
      if (authorizedNames.includes(this.$route.name)) {
        return true;
      }
      return false;
    },
    isContactVisible() {
      return (
        this.$route.name !== "postUpdate" && this.$route.name !== "postCreate"
      );
    },
    async onApiClick() {
      // goal: consulting API documentation
      window._paq.push(["trackGoal", 6]);

      this.$store.commit("modalShowing/open", "graphQLApiModal");
      const context = {
        slug: "{{INSERT_YOUR_POST_SLUG}}",
        blogId: "{{INSERT_YOUR_BLOG_ID}}",
      };
      if (this.$route.name === "postList") {
        const blog = await getBlog(this.$route.params.blogId);
        context.blogId = blog._id;
      }
      if (this.$route.name === "postUpdate") {
        const [blog, post] = await Promise.all([
          getBlog(this.$route.params.blogId),
          getPost(this.$route.params.postId),
        ]);
        context.blogId = blog._id;
        context.slug = post.slug;
      }
      this.apiModalExampleList = apiExamples(context);
    },
    onCheckOutPlansClick() {
      this.$router.push({
        name: "plans",
        params: { blogSetId: this.$route.params.blogSetId || this.blogSet._id },
      });
      this.$store.commit("modalShowing/close", "freeTrialEndedModal");
    },
  },
};

function viewData() {
  return apolloClient.query({
    query: gql`
      query appTopbarQuery {
        blogSets {
          _id
          name
        }
        me {
          _id
          name
          email
          picture
          blogs(last: 100) {
            edges {
              node {
                _id
                name
                blogSet
              }
            }
          }
        }
      }
    `,
  });
}
</script>

<style scoped>
code[class*="language-"],
pre[class*="language-"] {
  background: inherit;
}
</style>
