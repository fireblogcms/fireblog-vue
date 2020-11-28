<template>
  <!-- publication date -->

  <div class="mt-10">
    <p class="mb-4 font-bold">
      Date de publication
      <span v-if="vuexFormGetValue(formId, 'publishedAt')">
        :
        {{ new Date(vuexFormGetValue(formId, "publishedAt")).toLocaleString() }}
      </span>
    </p>
    <!-- publish later -->
    <div class="mb-10">
      <div class="flex border rounded-lg text-center items-center">
        <div
          v-if="
            !existingPost ||
              (existingPost && existingPost.status !== 'PUBLISHED')
          "
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
          Modifier
        </div>
      </div>
    </div>
    <!-- calendar later -->
    <div
      class="flex w-full"
      v-show="vuexFormGetValue(formId, 'publishedAtType') === 'LATER'"
    >
      <div class="flex-1">
        <AppFieldDate
          @input="vuexFormSetValue(formId, 'publishedAtCustomDate', $event)"
          :value="vuexFormGetValue(formId, 'publishedAtCustomDate')"
          :disabled-dates="disabledDatesLater"
        />
      </div>
      <div class="pl-5">
        <AppFieldTime
          :value="vuexFormGetValue(formId, 'publishedAtCustomTime')"
          @input="vuexFormSetValue(formId, 'publishedAtCustomTime', $event)"
        />
      </div>
    </div>
    <!-- calendar earlier -->
    <div
      class="flex w-full"
      v-show="vuexFormGetValue(formId, 'publishedAtType') === 'EARLIER'"
    >
      <div class="flex-1">
        <AppFieldDate
          :value="vuexFormGetValue(formId, 'publishedAtCustomDate')"
          @input="onDateInput"
          :disabled-dates="disabledDatesEarlier"
        />
      </div>
      <div class="pl-5">
        <AppFieldTime
          :value="vuexFormGetValue(formId, 'publishedAtCustomTime')"
          @input="onTimeInput"
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
import { getTimeFromDateString, combineDateAndTime } from "@/utils/helpers";

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
  data() {
    return {
      timeMax: getTimeFromDateString(),
    };
  },
  created() {
    this.vuexFormGetError = vuexFormGetError;
    this.vuexFormGetValue = vuexFormGetValue;
    this.vuexFormSetValue = vuexFormSetValue;
  },
  watch: {
    "existingPost.status": function(status) {
      if (status === "PUBLISHED") {
        vuexFormSetValue(this.formId, "publishedAtType", "KEEP");
      }
      if (status === "DRAFT") {
        vuexFormSetValue(this.formId, "publishedAtType", "NOW");
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
      var date = new Date();
      return {
        from: date,
      };
    },
  },
  methods: {
    validateDateTime() {
      // do not allow date in the future for now
      const customDate = vuexFormGetValue("postForm", "publishedAtCustomDate");
      const customTime = vuexFormGetValue("postForm", "publishedAtCustomTime");
      const currentTime = getTimeFromDateString();
      let customDateTime = null;
      if (customDate && customTime) {
        customDateTime = combineDateAndTime(customDate, customTime);
        if (new Date(customDateTime) > new Date()) {
          //vuexFormSetValue("postForm", "publishedAtCustomTime", currentTime);
        }
      }
    },
    onDateInput(value) {
      vuexFormSetValue("postForm", "publishedAtCustomDate", value);
      this.validateDateTime();
    },
    onTimeInput(value) {
      vuexFormSetValue("postForm", "publishedAtCustomTime", value);
      this.validateDateTime();
    },
    getActiveTab() {
      return vuexFormGetValue(this.formId, "publishedAtType");
    },
    onTabClick(tabId) {
      vuexFormSetValue(this.formId, "publishedAtType", tabId);
      const today = new Date();
      const currentTime = getTimeFromDateString();

      if (tabId === "LATER" || tabId === "EARLIER") {
        if (!vuexFormGetValue(this.formId, "publishedAt")) {
          vuexFormSetValue(this.formId, "publishedAtCustomDate", today);
        }
        if (!vuexFormGetValue(this.formId, "publishedAt")) {
          vuexFormSetValue(this.formId, "publishedAtCustomTime", currentTime);
        }
      }
    },
  },
};
</script>
