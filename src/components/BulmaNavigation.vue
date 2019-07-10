<template>
  <header>
    <nav class="navbar">
      <div class="container">
        <div class="navbar-brand">
          <div
            @click="showOnMobile = !showOnMobile"
            :class="{ 'is-active': showOnMobile }"
            class="navbar-burger"
            data-target="app-menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <!-- This "nav-menu" is hidden on mobile -->
        <!-- Add the modifier "is-active" to display it on mobile -->
        <div id="app-menu" class="navbar-menu" :class="{ 'is-active': showOnMobile }">
          <div class="navbar-start">
            <router-link class="navbar-item" to="/">Accueil</router-link>
            <router-link
              v-if="$route.params.podId"
              class="navbar-item"
              :to="`/pod/${$route.params.podId}`"
            >MY POSTS</router-link>
            <portal-target name="navbar-start">
              <!--
            This component can be located anywhere in your App.
            The slot content of the above portal component will be rendered here.
              -->
            </portal-target>
          </div>

          <div class="navbar-end">
            <span class="navbar-item">
              <!--
              <button
                @click="showPublishBlogModal = true"
                class="button is-outlined is-info"
              >SAVE CHANGES</button>
              -->
            </span>
            <router-link class="navbar-item" to="/profile">
              <img :src="me.picture" style="border-radius:3px; margin-right:1rem" />
              {{me.name}}
            </router-link>
            <portal-target name="navbar-end">
              <!--
            This component can be located anywhere in your App.
            The slot content of the above portal component will be rendered here.
              -->
            </portal-target>
          </div>
        </div>
      </div>
    </nav>

    <div :class="{ 'is-active': showPublishBlogModal }" class="modal">
      <div class="modal-background"></div>
      <div class="modal-card">
        <div class="modal-card-body has-text-centered">
          <h1 class="title is-uppercase">Publish this post now</h1>
          <div class="field">
            <div class="label">Give a title Pod title ?</div>
            <div class="control">
              <input class="input is-info is-large" type="text" placeholder="Blog's name" />
            </div>
          </div>
          <div class="field">
            <div class="label">What's your email ?</div>
            <div class="control">
              <input class="input is-info is-large" type="text" placeholder="Email" />
            </div>
          </div>
          <br />
          <div class="buttons are-medium is-centered">
            <button class="button is-outline" @click="showPublishBlogModal = false">CANCEL</button>
            <button class="button is-info" @click="showPublishBlogModal = false">PUBLISH</button>
          </div>
        </div>
        <!-- Any other Bulma elements you want -->
      </div>
      <button @click="showPublishBlogModal = false" class="modal-close is-large" aria-label="close"></button>
    </div>
  </header>
</template>

<script>
import { getUser } from "../lib/auth";
export default {
  data() {
    return {
      showOnMobile: false,
      showPublishBlogModal: false,
      showCreateBlogModal: false
    };
  },
  created() {
    this.me = getUser();
  }
};
</script>

<style scoped>
.navbar {
  /*background: #21314d;*/
}

.navbar-brand {
  margin-left: 1rem;
}
.navbar-brand a {
  position: relative;
  /*color: rgba(255, 255, 255, 0.4);*/
}

.navbar-item.router-link-exact-active {
  color: #21314d;
  /*background: #f2f4f7;*/
}

.navbar-brand .navbar-item {
  padding-top: 0;
}

.navbar-item {
  font-weight: 600;
  /*color: rgba(255, 255, 255, 0.4);*/
}

.navbar-item:hover {
  color: #363636;
}

.navbar-end .navbar-item:last-child {
  padding-right: auto;
}

/* Create slide animation on mobile */
@media screen and (max-width: 999px) {
  .navbar-end {
    padding: 0;
  }
  .navbar-menu {
    display: block;
    overflow: hidden;
    max-height: 0px;
    padding: 0;
    transition: max-height 0.2s;
  }

  .navbar-menu.is-active {
    max-height: 100vh;
    transition: max-height 0.5s;
  }

  .navbar-end .navbar-item:last-child {
    padding-bottom: 1rem;
  }
}
</style>
