<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  async mounted() {
    fetch("http://localhost:4000/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `{
          users {
            email 
          }
        }`
      })
    })
      .then(response => response.json())
      .then(result => console.log("result", result));
  }
};
</script>