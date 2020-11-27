<template>
  <!-- publication date -->

  <div class="mt-10">
    <p class="mb-4 font-bold">
      Publié le
      {{ new Date(vuexFormGetValue(formId, "publishedAt")).toLocaleString() }}
    </p>
    <!-- publish later -->
    <div class="mb-10">
      <div class="flex border rounded-lg text-center items-center">
        <div
          v-if="existingPost && existingPost.status !== 'PUBLISHED'"
          @click="onTabClick('NOW')"
          class="p-5 flex-1 cursor-pointer text-lg border-r border-gray-200"
          :class="{
            ' bg-indigo-100': getActiveTab() === 'NOW',
          }"
        >
          Publish now
        </div>
        <!--
        <div
          class="p-5 flex-1 cursor-pointer text-lg"
          v-if="existingPost && existingPost.status !== 'PUBLISHED'"
          @click="onTabClick('LATER')"
          :class="{
            ' bg-indigo-100': getActiveTab() === 'LATER',
          }"
        >
          Publish later
        </div>
        -->
        <div
          v-if="existingPost && existingPost.status === 'PUBLISHED'"
          @click="onTabClick('KEEP')"
          class="p-5 flex-1 cursor-pointer text-lg border-r border-gray-200"
          :class="{
            ' bg-indigo-100': getActiveTab() === 'KEEP',
          }"
        >
          Garder la date actuelle
        </div>
        <div
          class="p-5 flex-1 cursor-pointer text-lg"
          @click="onTabClick('EARLIER')"
          :class="{
            ' bg-indigo-100': getActiveTab() === 'EARLIER',
          }"
        >
          Antidater
        </div>
      </div>
    </div>
    <!-- calendar later -->
    <div
      class="flex w-full"
      v-show="vuexFormGetValue(formId, 'publishedScheduleAtType') === 'LATER'"
    >
      <div class="flex-1">
        <AppFieldDate
          @input="vuexFormSetValue(formId, 'publishedAt', $event)"
          :value="vuexFormGetValue(formId, 'publishedAt')"
          :disabled-dates="disabledDatesLater"
        />
      </div>
      <div class="pl-5">
        <AppFieldTime
          :value="vuexFormGetValue(formId, 'publishedAtTime')"
          @input="vuexFormSetValue(formId, 'publishedAtTime', $event)"
        />
      </div>
    </div>
    <!-- calendar earlier -->
    <div
      class="flex w-full"
      v-show="vuexFormGetValue(formId, 'publishedScheduleAtType') === 'EARLIER'"
    >
      <div class="flex-1">
        <AppFieldDate
          :value="vuexFormGetValue(formId, 'publishedAt')"
          @input="vuexFormSetValue(formId, 'publishedAt', $event)"
          :disabled-dates="disabledDatesEarlier"
        />
      </div>
      <div class="pl-5">
        <AppFieldTime
          :value="vuexFormGetValue(formId, 'publishedAtTime')"
          @input="vuexFormSetValue(formId, 'publishedAtTime', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import {
  vuexFormGetValue,
  vuexFormGetError,
  vuexFormSetValue,
  vuexFormSetError,
} from "@/utils/vuexForm";
import AppFieldDate from "@/ui-kit/AppFieldDate";
import AppFieldTime from "@/ui-kit/AppFieldTime";
import { getCurrentTime } from "@/utils/helpers";

export default {
  components: {
    AppFieldDate,
    AppFieldTime,
  },
  props: {
    formId: {
      type: String,
      required: true,
    },
    existingPost: {
      type: [Object, null],
    },
  },
  created() {
    this.vuexFormGetError = vuexFormGetError;
    this.vuexFormGetValue = vuexFormGetValue;
    this.vuexFormSetValue = vuexFormSetValue;
  },
  watch: {
    "existingPost.status": function(status) {
      if (status === "PUBLISHED") {
        vuexFormSetValue(this.formId, "publishedScheduleAtType", "KEEP");
      }
      if (status === "DRAFT") {
        vuexFormSetValue(this.formId, "publishedScheduleAtType", "NOW");
      }
    },
  },
  computed: {
    disabledDatesLater() {
      var date = new Date();
      date.setDate(date.getDate() - 1);
      return {
        to: date,
      };
    },
    disabledDatesEarlier() {
      return {
        from: new Date(),
      };
    },
  },
  methods: {
    getActiveTab() {
      return vuexFormGetValue(this.formId, "publishedScheduleAtType");
    },
    onTabClick(tabId) {
      vuexFormSetValue(this.formId, "publishedScheduleAtType", tabId);
      let today = new Date();
      const time = getCurrentTime();

      if (tabId === "LATER" || tabId === "EARLIER") {
        if (!vuexFormGetValue(this.formId, "publishedAt")) {
          vuexFormSetValue(this.formId, "publishedAt", today);
        }
        if (!vuexFormGetValue(this.formId, "publishedAtTime")) {
          vuexFormSetValue(this.formId, "publishedAtTime", "10:21");
        }
      }
    },
  },
};
</script>
