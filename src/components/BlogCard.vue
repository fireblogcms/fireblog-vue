<template>
  <AppCard :image="cardBackground(blog)">
    <div
      class="h-full flex items-center cursor-pointer"
      @click="onCardImageClick(blog)"
      slot="header"
    >
      <div class="w-full text-center text-white py-2 bg-blackOpacity50">
        <p class="text-3xl font-bold">{{ blog.name }}</p>
        <p class="text-xl italic" v-if="blog.description">
          {{ blog.description }}
        </p>
      </div>
    </div>
    <div
      class="flex flex-col md:flex-row items-center justify-between"
      slot="content"
    >
      <PlanInformations :blog="blog" class="mb-8 md:mb-0" />
      <AppButton
        color="primary-outlined"
        v-if="blog.subscription.trialEnd"
        @click="onSubscribeClick(blog)"
      >
        <span>
          {{ $t("global.subscribeButton").toUpperCase() }}
        </span>
      </AppButton>
    </div>
  </AppCard>
</template>

<script>
import AppButton from "@/ui-kit/AppButton";
import AppCard from "@/ui-kit/AppCard";
import PlanInformations from "@/components/PlanInformations";
import gradient from "random-gradient";

export default {
  components: {
    AppButton,
    AppCard,
    PlanInformations,
  },
  props: {
    blog: {
      type: Object,
      required: true,
    },
  },
  methods: {
    cardBackground(blog) {
      return blog.image || gradient(blog._id);
    },
    onCardImageClick(blog) {
      this.$router.push({
        name: "postList",
        params: {
          blogId: blog._id,
        },
      });
    },
    onSubscribeClick(blog) {
      this.$router.push({
        name: "plans",
        params: {
          blogId: blog._id,
        },
      });
    },
  },
};
</script>
