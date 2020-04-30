<template>
  <div class="relative z-50 bg-white shadow-bottom" :class="`route-${$route.name}`">
    <div class="flex justify-between px-10 py-4">
      <div class="flex items-center">
        <img
          class="w-16 rounded-full cursor-pointer"
          src="/images/logo-solo.png"
          @click="onLogoClick"
        />
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
          v-if="isApiHelpVisible()"
          @click="onApiClick"
        >
          <img
            class="w-6 mr-2"
            src="/images/graphql.svg"
          />
          <span>API</span>
        </AppButton>

        <div v-if="me" class="relative cursor-pointer ml-6">
          <div @click="dropdownMenuActive = !dropdownMenuActive" >
            <img
              v-if="me.picture"
              :src="me.picture"
              class="w-12 h-12 rounded-full"
            />
            <span v-if="!me.picture">{{ me.name }}</span>
          </div>
          <div
            v-if="dropdownMenuActive"
            v-click-outside="() => dropdownMenuActive = false"
            class="absolute right-0 min-w-15 mt-2 py-3 flex flex-col bg-white rounded-md shadow-md"
            role="menu"
          >
            <router-link
              :to="{ name: 'blogList' }"
              class="px-4 py-2 font-bold hover:bg-gray-100"
            >
              {{ $t("topbar.accountMenu.myBlogs") }}
            </router-link>
            <router-link
              v-for="edge in me.blogs.edges"
              :key="edge.node._id"
              :to="{
                name: 'postList',
                params: { blogId: edge.node._id }
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
    <AppModal :showing="showingApiModal" @close="showingApiModal = false">
      <div class="flex items-center justify-between flex-1" slot="header">
        <span class="text-4xl font-bold">API</span>
          <a
            :href="blogApiUrl" 
            target="_blank"
            class="hover:text-current"
          >
            <AppButton type="primary" size="small">
              {{ $t("apiModal.openGraphQLExplorer") }}
            </AppButton>
          </a>
      </div>
      <div slot="body">
        <p class="text-2xl font-bold mb-4">GraphQL endpoint</p>
        <AppInput type="text" readonly="true" :value="blogApiUrl" />
          <div
            :id="`example-${example.id}`"
            v-for="example in apiModalExampleList"
            :key="example.id"
          >
            <div class="my-4 flex">
              <span class="text-2xl font-bold mr-4">{{ example.label }}</span>
              <a
                :href="`${blogApiUrl}?query=${encodeURI(example.snippet)}`"
                target="_blank"
              >
                <AppButton type="primary-outlined" size="small">
                  {{ $t("apiModal.tryItButton") }}
                </AppButton>
              </a>
            </div>
            <pre class="locale-graphql"><code>{{example.snippet}}</code></pre>
          </div>
      </div>
    </AppModal>
  </div>
</template>

<script>
import AppButton from "@/ui-kit/AppButton";
import AppInput from "@/ui-kit/AppInput";
import AppModal from "@/ui-kit/AppModal";
import {
  getBlog,
  getUser,
  toast
} from "@/utils/helpers";
import apiExamples from "@/apiExamples";

export default {
  components: {
    AppButton,
    AppInput,
    AppModal
  },
  data() {
    return {
      apiModalExampleList: [],
      dropdownMenuActive: false,
      me: null,
      showingApiModal: false
    }
  },
  computed: {
    blogApiUrl() {
      return `${process.env.VUE_APP_GRAPHQL_POD_BASE_URL}/${
        this.$route.params.blogId
      }`;
    }
  },
  mounted() {
    this.initData();
  },
  watch: {
    $route: function() {
      this.dropdownMenuActive = false;
    }
  },
  methods: {
    async initData() {
      getUser()
        .then(user => {
          this.me = user;
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
      const authorizedNames = ["postList", "postUpdate", "postCreate"];
      if (authorizedNames.includes(this.$route.name)) {
        return true;
      }
      return false;
    },
    async onApiClick() {
      const context = {
        slug: "{{POST_SLUG}}",
        locale: navigator.language || navigator.userLanguage
      };
      if (this.$route.name === "postList") {
        const blog = await getBlog(this.$route.params.blogId);
        context.locale = blog.contentDefaultLocale;
      }
      if (this.$route.name === "postUpdate") {
        const [blog, post] = await Promise.all([
          getBlog(this.$route.params.blogId),
          getPost(this.$route.params.postId)
        ]);
        context.locale = blog.contentDefaultLocale;
        context.slug = post.slug;
      }
      this.apiModalExampleList = apiExamples(context);
      this.showingApiModal = true;
    }
  }
}
</script>
