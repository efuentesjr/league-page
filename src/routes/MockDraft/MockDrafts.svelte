<script>
    // Import the PNG file directly
    import draftImage from '$lib/MockDraft/MockDraft.png';
</script>

<style>
    .draftTable {
        display: block;
        margin: 0 auto;
        max-width: 100%; /* Ensures the table scales for smaller screens */
        height: auto;
    }

    .container {
        text-align: center;
        margin-top: 20px;
    }

    h1 {
        font-size: 2rem;
        margin-bottom: 20px;
    }
</style>

<div class="container">
    <h1>Upcoming 2025 Mock Draft</h1>
    <!-- Use the imported image -->
    <img src="{draftImage}" alt="Mock Draft Table" class="draftTable" />
</div>
