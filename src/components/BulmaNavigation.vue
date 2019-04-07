<template>
  <header>
    <nav class="navbar">
      <div class="container">
        <div class="navbar-brand">
          <span class="navbar-item">
            <strong>
              <router-link class="has-text-dark is-size-4" to="/">POD</router-link>
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
        <div id="app-menu" class="navbar-menu" :class="{ 'is-active': showOnMobile }">
          <div class="navbar-end">
            <span class="navbar-item">
              <router-link
                @click.native="showOnMobile = false"
                to="/write"
                class="button is-medium"
              >PUBLISH</router-link>
            </span>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
export default {
  data() {
    return {
      showOnMobile: false
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
