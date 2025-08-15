<div class="image-wrapper">
  <img src="/playoffs-projection/Stadium.jpg" alt="Stadium" />
  <h1 class="title">Playoffs Projections</h1>
</div>

<style>
.image-wrapper {
  position: relative;
  display: block;
  max-width: 900px; /* limit size on large screens */
  margin: 0 auto;   /* center horizontally */
}

.image-wrapper img {
  display: block;
  width: 100%;
  height: auto;
}

.image-wrapper .title {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  padding: 0.25rem 0.5rem;
  color: black;
  font-weight: bold;
  background: none;
  font-size: clamp(1rem, 2vw, 1.5rem); 
  /* 
    - min: 1rem (16px)
    - scales with viewport width: 2vw
    - max: 1.5rem (24px)
  */
}
</style>
