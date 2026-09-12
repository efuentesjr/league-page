<script>
  const games = [
    {
      team1: "The People's Champ",
      score1: "127.42",
      team2: "Blue Ballers",
      score2: "118.86"
    },
    {
      team1: "CeeDees TDs",
      score1: "108.34",
      team2: "Loud & Stroud",
      score2: "102.16"
    },
    {
      team1: "The Comeback Kid",
      score1: "115.72",
      team2: "Brute Force Attack",
      score2: "111.44"
    },
    {
      team1: "SlickBears",
      score1: "99.18",
      team2: "88Boyz11",
      score2: "104.56"
    },
    {
      team1: "Perfectly Balanced",
      score1: "121.30",
      team2: "Vick2Times",
      score2: "119.84"
    }
  ];
</script>

<div class="ticker">
  <div class="ticker-label">
    <span class="live-dot"></span>
    MFFL LIVE
  </div>

  <div class="ticker-window">
    <div class="ticker-track">
      {#each [...games, ...games] as game}
        <div class="game">
          <span class:winning={Number(game.score1) > Number(game.score2)}>
            {game.team1}
          </span>

          <strong>{game.score1}</strong>

          <span class="vs">—</span>

          <strong>{game.score2}</strong>

          <span class:winning={Number(game.score2) > Number(game.score1)}>
            {game.team2}
          </span>
        </div>

        <div class="separator">•</div>
      {/each}
    </div>
  </div>
</div>

<style>
  .ticker {
    width: 100%;
    height: 42px;
    display: flex;
    align-items: center;
    background: #111827;
    color: white;
    overflow: hidden;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  }

  .ticker-label {
    flex-shrink: 0;
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 18px;
    background: #0b0f17;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 1px;
    z-index: 2;
  }

  .live-dot {
    width: 8px;
    height: 8px;
    margin-right: 8px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.8);
  }

  .ticker-window {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
  }

  .ticker-track {
    display: inline-flex;
    align-items: center;
    animation: scroll 45s linear infinite;
  }

  .game {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 0 18px;
    font-size: 13px;
  }

  .game span {
    color: #d1d5db;
  }

  .game strong {
    font-size: 14px;
    color: white;
  }

  .game .winning {
    color: #ffffff;
    font-weight: 800;
  }

  .vs {
    color: #6b7280 !important;
  }

  .separator {
    color: #374151;
    font-size: 18px;
  }

  @keyframes scroll {
    from {
      transform: translateX(0);
    }

    to {
      transform: translateX(-50%);
    }
  }

  .ticker:hover .ticker-track {
    animation-play-state: paused;
  }

  @media (max-width: 600px) {
    .ticker {
      height: 38px;
    }

    .ticker-label {
      padding: 0 12px;
      font-size: 10px;
    }

    .game {
      font-size: 11px;
      gap: 6px;
      padding: 0 12px;
    }

    .game strong {
      font-size: 12px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ticker-track {
      animation: none;
    }
  }
</style>
