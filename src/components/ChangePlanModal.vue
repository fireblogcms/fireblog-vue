<template>
  <BulmaModal v-model="modalShow">
    <template #title>
      <div class="has-text-centered">
        {{ $t("components.changePlanModal.title") }}
      </div>
    </template>
    <template #body>
      <div class="has-text-centered">
        {{
          $t("components.changePlanModal.body", {
            planName: plan.productName,
            planAmount: (parseInt(plan.amountTaxes) / 100).toFixed(2)
          })
        }}
      </div>
    </template>
    <template class="has-text-centered" #footer>
      <button @click="changePlan" class="button is-primary is-large">
        {{ $t("global.subscribeButton") }}
      </button>
    </template>
  </BulmaModal>
</template>

<script>
import BulmaModal from "./BulmaModal";

export default {
  components: {
    BulmaModal
  },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    plan: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      modalShow: this.show
    };
  },
  watch: {
    show: function(value) {
      this.modalShow = value;
    },
    modalShow: function(value) {
      this.$emit("showUpdate", value);
    }
  },
  methods: {
    changePlan() {
      this.$emit("changePlan", this.plan);
    }
  }
};
</script>
