<template>
  <div class="relative h-20 z-20 bg-white" :class="`route-${$route.name}`">
    <div class="h-full flex justify-between px-2 md:px-10 py-4">
      <div class="flex items-center">
        <img
          class="w-16 rounded-full cursor-pointer mr-4"
          src="/images/logo-solo.png"
          @click="onLogoClick"
        />

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

        <AppButton size="small" v-if="isApiHelpVisible()" @click="onApiClick">
          <img class="w-6 md:mr-2" src="/images/graphql.svg" />
          <span class="hidden md:inline">API</span>
        </AppButton>

        <AppButton
          size="small"
          class="ml-2"
          v-if="isContactVisible()"
          @click="onContactClick"
        >
          <img class="w-6 md:mr-2" src="/images/contact.svg" />
          <span class="hidden md:inline">Contact</span>
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
                params: { blogId: edge.node._id },
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
        class="flex flex-col md:flex-row items-center justify-between flex-1"
        slot="header"
      >
        <span class="text-4xl font-bold">API</span>
        <AppButton
          @click="onOpenGraphQLExplorerClick"
          color="primary"
          size="small"
        >
          {{ $t("apiModal.openGraphQLExplorer") }}
        </AppButton>
      </div>
      <div slot="body">
        <p class="text-lg font-bold">GraphQL endpoint</p>
        <input
          type="text"
          disabled
          class="bg-gray-100 rounded-md w-full px-2 overflow-x-auto"
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
                <span class="text-primary font-bold">
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
    <AppModal name="contactModal">
      <div class="text-4xl font-bold" slot="header">
        {{ $t("contactModal.title") }}
      </div>
      <div class="flex flex-col items-center" slot="body">
        <img v-if="supportGif" class="h-64 mb-4 rounded" :src="supportGif" />
        <p>{{ $t("contactModal.content") }}</p>
        <div class="flex items-center my-4">
          <a
            @click="onMailSupportClick"
            class="text-primary font-bold"
            href="mailto:support@fireblogcms.com"
          >
            support@fireblogcms.com
          </a>
        </div>
        <div class="flex items-center">
          <span
            @click.prevent="onChatSupportClick"
            class="text-primary font-bold cursor-pointer"
          >
            {{ $t("contactModal.chatWithUs") }}
          </span>
        </div>
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
    "https://s3.eu-west-3.amazonaws.com/app.fireblogcms.com/gifs/support-friends.gif",
    "https://s3.eu-west-3.amazonaws.com/app.fireblogcms.com/gifs/support-ringo-star-tea.gif",
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
    onChatSupportClick() {
      // goal: try to contact support by tchat
      window._paq.push(["trackGoal", 8]);
      window._paq.push(["trackEvent", "Support", "Tchat", "Open"]);
      if ($crisp) {
        $crisp.push(["do", "chat:open"]);
      }
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
        slug: "{{POST_SLUG}}",
        blogId: "{{BLOG_ID}}",
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
