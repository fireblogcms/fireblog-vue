<template>
  <DefaultLayout>
    <AppPanel>
      <p class="my-16 text-6xl text-center font-bold uppercase">
        {{ $t("global.pageNotFound") }}
      </p>
    </AppPanel>
  </DefaultLayout>
</template>

<script>
import AppPanel from "@/ui-kit/AppPanel";
import DefaultLayout from "@/layouts/DefaultLayout";

export default {
  components: {
    AppPanel,
    DefaultLayout
  }
};
</script>
