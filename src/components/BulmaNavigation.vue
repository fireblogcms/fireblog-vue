<template>
  <header>
    <nav class="navbar">
      <div class="container">
        <div class="navbar-brand">
          <span class="navbar-item">
            <strong>
              <router-link class="has-text-dark button is-outlined" to="/"
                >MENU</router-link
              >
            </strong>
          </span>
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
        <div
          id="app-menu"
          class="navbar-menu"
          :class="{ 'is-active': showOnMobile }"
        >
          <div class="navbar-end">
            <span class="navbar-item">
              <button
                @click="showPublishBlogModal = true"
                class="button is-outlined"
              >
                SAVE
              </button>
            </span>
            <span class="navbar-item">
              <button
                @click="showPublishBlogModal = true"
                class="button is-info is-outlined"
              >
                PUBLISH
              </button>
            </span>
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
              <input
                class="input is-info is-large"
                type="text"
                placeholder="Blog's name"
              />
            </div>
          </div>
          <div class="field">
            <div class="label">What's your email ?</div>
            <div class="control">
              <input
                class="input is-info is-large"
                type="text"
                placeholder="Email"
              />
            </div>
          </div>
          <br />
          <div class="buttons are-medium is-centered">
            <button
              class="button is-outline"
              @click="showPublishBlogModal = false"
            >
              CANCEL
            </button>
            <button
              class="button is-info"
              @click="showPublishBlogModal = false"
            >
              PUBLISH
            </button>
          </div>
        </div>
        <!-- Any other Bulma elements you want -->
      </div>
      <button
        @click="showPublishBlogModal = false"
        class="modal-close is-large"
        aria-label="close"
      ></button>
    </div>
  </header>
</template>

<script>
export default {
  data() {
    return {
      showOnMobile: false,
      showPublishBlogModal: false,
      showCreateBlogModal: false
    };
  }
};
</script>

<style scoped>
.navbar-brand {
  margin-left: 1rem;
}
.navbar-brand a {
  position: relative;
}
.navbar-brand .navbar-item {
  padding-top: 0;
}

.navbar-item:hover {
  color: #363636;
}

.navbar-end .navbar-item:last-child,
.navbar-end .navbar-item:nth-last-child(2) {
  padding-right: 0;
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
