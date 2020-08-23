<template>
  <AppPanel>
    <h2 class="text-4xl font-bold">
      {{ $t("views.blogSettings.teamSettingsForm.title") }}
    </h2>

    <div class="my-6">
      <div class="flex justify-between">
        <div>
          <div>
            <label class="text-md font-bold">
              mail
            </label>
          </div>
          <AppFieldText
            :value="vuexFormGetValue(formId, 'mail')"
            @input="vuexFormSetValue(formId, 'mail', $event)"
            :error="vuexFormGetError(formId, 'mail')"
            maxlength="250"
          />
        </div>
        <div>
          <div>
            <label class="text-md font-bold">
              rôle
            </label>
          </div>
          <select>
            <option> redactor </option>
            <option> administrator </option>
            <option> technician </option>
          </select>
        </div>
        <div>
          <AppButton
            @click="onSearchButtonClick"
            v-show="identities.length === 0"
            type="submit"
            color="primary-outlined"
            :loading="savingState === 'PENDING'"
            :disabled="uploadBlogImageState === 'PENDING'"
          >
            {{ $t("views.blogSettings.teamSettingsForm.search") }}
          </AppButton>
        </div>
      </div>
      <div v-show="addingMember === true && identities.length === 0">
        Sorry, we cannot find any fireblog account with this email. Make sure
        there is not typo and that this user is registered to fireblog.
      </div>
      <div v-show="identities.length > 0">
        <p class="my-6">
          User has several accounts with the same email, please select one:
        </p>
        <div
          class="border-b py-12 last:border-b-0 cursor-pointer hover:bg-blue-100 flex justify-between"
          v-for="identity in identities"
          :key="identity._id"
        >
          <div>
            <img width="100" v-if="identity.picture" :src="identity.picture" />
          </div>
          <div>
            {{ identity.name }}
          </div>
          <div>
            <span v-if="identity.provider !== 'auth0'">
              (created from its {{ identity.provider }} account )
            </span>
          </div>
          <div>
            <AppButton
              @click="onInviteIdentiyClick(identity)"
              color="primary-outlined"
            >
              {{ $t("views.blogSettings.teamSettingsForm.invite") }}
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </AppPanel>
</template>

<script>
import AppButton from "@/ui-kit/AppButton";
import AppFieldText from "@/ui-kit/AppFieldText";
import AppPanel from "@/ui-kit/AppPanel";
import AppTextarea from "@/ui-kit/AppTextarea";
import { getBlog, REQUEST_STATE, toast } from "@/utils/helpers";
import {
  vuexFormInit,
  vuexFormSetValue,
  vuexFormSetError,
  vuexFormGetValue,
  vuexFormGetError,
  vuexFormGetErrors,
  vuexFormResetErrors,
} from "@/utils/vuexForm";
import apolloClient from "@/utils/apolloClient";
import gql from "graphql-tag";
import { updateBlogMutation } from "@/utils/queries";

const formId = "blogSettingsTeam";

function initialFormValues(blog) {
  const values = {
    mail: "",
  };
  return values;
}

export default {
  components: {
    AppButton,
    AppFieldText,
    AppPanel,
    AppTextarea,
  },
  props: {
    blog: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      savingState: REQUEST_STATE.NOT_STARTED,
      uploadBlogImageState: REQUEST_STATE.NOT_STARTED,
      identities: [],
      // at least one search has been made
      addingMember: false,
      addedMember: null,
    };
  },
  created() {
    this.formId = formId;
    this.vuexFormSetValue = vuexFormSetValue;
    this.vuexFormGetValue = vuexFormGetValue;
    this.vuexFormGetError = vuexFormGetError;
    vuexFormInit(formId, {
      initialValues: initialFormValues(this.blog),
    });
  },
  methods: {
    validateForm() {},
    onSearchButtonClick() {
      this.addingMember === true,
        // First we want to search user identifies for this mail.
        // we MAY HAVE SEVERAL identifies for a single mail:
        //
        // For example a user might have registered with github AND google,
        // and have used the same mail for both. But we consider for now
        // those are two distinct identities.

        apolloClient
          .query({
            variables: {
              blogId: this.$route.params.blogId,
              mail: vuexFormGetValue(formId, "mail"),
            },
            query: gql`
              query blogTeamSearchUserByMail($blogId: ID!, $mail: String!) {
                blogTeamSearchUserByMail(blogId: $blogId, mail: $mail) {
                  _id
                  name
                  provider
                  picture
                }
              }
            `,
          })
          .then(r => {
            this.identities = r.data.blogTeamSearchUserByMail;
            console.log("this.identities", this.identities);
          })
          .catch(error => {
            toast(this, error, "error");
          });
    },
    onInviteIdentiyClick(entity) {
      apolloClient
        .mutate({
          variables: {
            blogId: this.$route.params.blogId,
            userId: entity._id,
            role: "redactor",
          },
          mutation: gql`
            mutation blogAddTeamMember(
              $blogId: ID!
              $userId: ID!
              $role: MembershipBlogRolesEnum!
            ) {
              blogAddTeamMember(blogId: $blogId, userId: $userId, role: $role) {
                _id
                name
                email
                memberships {
                  scopeId
                  resourceId
                  roles
                }
              }
            }
          `,
        })
        .then(r => {
          console.log("this.identities", r.data.blogAddTeamMember);
          this.addedMember = r.data.blogAddTeamMember;
        })
        .catch(error => {
          toast(this, error, "error");
        });
    },
  },
};
</script>
