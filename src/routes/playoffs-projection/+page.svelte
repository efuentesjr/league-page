<script>
    export let data;
</script>

<div class="container">
    <h1>{data?.message || "Coming Soon..."}</h1>
    <p>Stay tuned! This page is under construction.</p>
</div>

<style>
.container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    text-align: center;
    font-family: Arial, sans-serif;
}

h1 {
    font-size: 3rem;
    color: #ff6600;
}

p {
    font-size: 1.5rem;
    color: #666;
}
</style>
