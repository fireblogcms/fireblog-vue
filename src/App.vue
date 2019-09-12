<template>
  <div id="app">
    <!--
    $route.fullPath ensure our "created" hooks 
    are triggered on each page change
    -->
    <router-view :key="$route.fullPath" />
  </div>
</template>


