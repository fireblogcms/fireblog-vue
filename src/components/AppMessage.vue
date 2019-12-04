<template>
  <portal to="notifications">
    <div
      style="margin-top:40px;"
      class="container notification is-primary has-text-centered animated flipInX is-outlined"
    >
      <button class="delete"></button>
      <slot />
    </div>
  </portal>
</template>
