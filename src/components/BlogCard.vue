<template>
  <AppCard :image="cardBackground(blog)">
    <div
      class="h-full flex items-center cursor-pointer"
      @click="onCardImageClick(blog)"
    >
      <div class="w-full text-center text-white py-2 bg-blackOpacity50">
        <p class="text-3xl font-bold">{{ blog.name }}</p>
        <p class="text-xl italic" v-if="blog.description">
          {{ blog.description }}
        </p>
      </div>
    </div>
  </AppCard>
</template>

<script>
import AppCard from "@/ui-kit/AppCard";
import gradient from "random-gradient";

export default {
  components: {
    AppCard
  },
  props: {
    blogSet: {
      type: Object,
      required: true,
    },
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
          blogSetId: this.blogSet._id,
          blogId: blog._id,
        },
      });
    }
  },
};
</script>
