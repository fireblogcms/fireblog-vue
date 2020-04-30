<template>
  <AppCard>
    <div
      class="h-64 flex items-center cursor-pointer bg-cover bg-center"
      :style="blogCardStyle(blog)"
      @click="onCardImageClick(blog)"
    >
      <div class="w-full text-center text-white py-2 bg-blackOpacity50">
        <p class="text-3xl font-bold">{{ blog.name }}</p>
        <p class="text-xl italic" v-if="blog.description">
          {{ blog.description }}
        </p>
      </div>
    </div>
    <div class="p-6 flex items-center justify-between">
      <PlanInformations :blog="blog"></PlanInformations>
      <AppButton
        type="primary-outlined"
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
    PlanInformations
  },
  props: {
    blog: {
      type: Object,
      required: true
    }
  },
  methods: {
    blogCardStyle(blog) {
      const style = {};
      if (blog.image) {
        style.backgroundImage = `url(${blog.image})`;
      } else {
        style.background = gradient(blog._id);
      }
      return style;
    },
    onCardImageClick(blog) {
      this.$router.push({
        name: "postList",
        params: {
          blogId: blog._id
        }
      });
    },
    onSubscribeClick(blog) {
      this.$router.push({
        name: "plans",
        params: {
          blogId: blog._id
        }
      });
    }
  }
};
</script>
