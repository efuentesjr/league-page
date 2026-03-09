<style>
  :global(body) {
    background:
      radial-gradient(circle at top, rgba(178, 140, 56, 0.08), transparent 24%),
      linear-gradient(180deg, #09111f 0%, #0c1524 38%, #101826 100%);
    color: #e5e7eb;
  }

  :global(h1, h2, h3, h4, h5) {
    color: #f8fafc;
  }

  :global(p),
  :global(li) {
    color: #cbd5e1;
    line-height: 1.62;
  }

  :global(p) {
    margin: 0.55rem 0 0.8rem;
  }

  :global(ul) {
    padding-left: 1.25rem;
    margin: 0.45rem 0 0.9rem;
  }

  :global(ul li) {
    margin-bottom: 0.22rem;
  }

  :global(hr) {
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    margin: 2rem 0;
  }

  .constitution-shell {
    width: min(920px, 92%);
    margin: 4.25rem auto 7rem;
  }

  .constitution-hero {
    padding: 0 0 1.35rem;
    margin-bottom: 1.8rem;
    border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  }

  .constitution-body {
    margin-top: 0;
    padding: 0;
  }

  .eyebrow {
    display: inline-block;
    font-size: 0.75rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #d4af37;
    margin-bottom: 0.7rem;
    font-weight: 700;
  }

  .hero-title {
    margin: 0;
    text-align: center;
    font-size: clamp(2rem, 4vw, 2.7rem);
    line-height: 1.08;
  }

  .hero-subtitle {
    margin: 0.85rem auto 0;
    max-width: 760px;
    text-align: center;
    color: #94a3b8;
    font-size: 0.96rem;
    line-height: 1.55;
  }

  .toc-card {
    margin-top: 1.05rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .toc-title {
    margin: 0 0 0.75rem;
    text-align: center;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #d4af37;
  }

  .toc-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.45rem 1.35rem;
    align-items: start;
  }

  .toc-group h3,
  .toc-group h4,
  .toc-group h5 {
    margin: 0;
    line-height: 1.18;
  }

  .toc-group h3 {
    font-size: 0.95rem;
    margin-bottom: 0.18rem;
  }

  .toc-group h4,
  .toc-group h5 {
    font-size: 0.85rem;
    color: #9fb3c8;
    margin-bottom: 0.14rem;
  }

  .sectionHeading {
    margin: 2.5rem 0 0.9rem;
    padding-bottom: 0.6rem;
    border-bottom: 1px solid rgba(212, 175, 55, 0.24);
    font-size: clamp(1.45rem, 3vw, 1.9rem);
    line-height: 1.2;
  }

  .subSectionHeading {
    margin: 1.35rem 0 0.7rem;
    font-size: 1.18rem;
    line-height: 1.22;
  }

  h4 {
    margin-top: 1rem;
    margin-bottom: 0.42rem;
    font-size: 1rem;
    line-height: 1.22;
  }

  h5 {
    font-size: 0.92rem;
    color: #cbd5e1;
    margin-top: 0.85rem;
    margin-bottom: 0.28rem;
    line-height: 1.2;
  }

  .subBlock {
    margin: 0.35rem 0 0.95rem 0.9rem;
    padding-left: 0.8rem;
    border-left: 2px solid rgba(212, 175, 55, 0.16);
  }

  .subBlock p:last-child,
  .subBlock ul:last-child {
    margin-bottom: 0;
  }

  .underscore {
    text-decoration: underline;
    text-decoration-color: rgba(212, 175, 55, 0.7);
    text-underline-offset: 3px;
  }

  .right {
    text-align: right;
  }

  .positionMaximums td {
    min-width: 3em;
  }

  .noUnderscore {
    text-decoration: none;
  }

  .clickable {
    cursor: pointer;
    transition: color 0.18s ease, transform 0.18s ease;
  }

  .clickable:hover {
    color: #f5d56b;
    transform: translateX(2px);
  }

  .draft-order-table,
  .scoring-table table,
  .positionMaximums,
  table {
    width: 100%;
    border-collapse: collapse;
    font-family: Arial, sans-serif;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
  }

  .draft-order-table {
    width: min(760px, 100%);
    margin: 0.7rem 0 1.1rem;
  }

  .draft-order-table th,
  .draft-order-table td,
  .scoring-table td,
  table th,
  table td {
    padding: 12px 14px;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .table-header,
  table thead tr {
    background: rgba(122, 28, 28, 0.75);
  }

  .table-header th,
  table thead th {
    color: #fff;
  }

  .total-row td {
    font-weight: 700;
    color: #f5d56b;
  }

  /* PLAYOFF BRACKET */

  .bracket-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 22px;
    margin: 1.4rem auto 1.2rem;
    padding: 1.15rem 1rem;
    overflow-x: auto;
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
  }

  .round {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 18px;
    min-width: 130px;
    position: relative;
  }

  .round-title {
    font-size: 0.82rem;
    color: #d4af37;
    font-weight: 700;
    text-align: center;
    margin-bottom: 0.25rem;
  }

  .matchup {
    position: relative;
    background: linear-gradient(180deg, #1e293b, #0f172a);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 10px;
    border-radius: 10px;
    width: 120px;
    min-height: 58px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
  }

  .team,
  .tbd,
  .championship {
    font-weight: 700;
    font-size: 0.74rem;
    line-height: 1.2;
  }

  .team {
    color: #f8fafc;
  }

  .tbd {
    color: #94a3b8;
  }

  .championship {
    color: #f5d56b;
  }

  .round:nth-child(2) {
    gap: 72px;
  }

  .round:nth-child(3) {
    justify-content: center;
  }

  .round:nth-child(1) .matchup::after,
  .round:nth-child(2) .matchup::after {
    content: '';
    position: absolute;
    right: -12px;
    top: 50%;
    width: 12px;
    border-top: 1px solid rgba(212, 175, 55, 0.45);
  }

  .round:nth-child(2) .matchup::before {
    content: '';
    position: absolute;
    left: -12px;
    top: 50%;
    width: 12px;
    border-top: 1px solid rgba(212, 175, 55, 0.45);
  }

  /* 4.1 SCORING GRID */

  .scoring-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.9rem 1rem;
    align-items: start;
    margin: 0.85rem 0 1.1rem;
  }

  .scoring-table {
    margin: 0;
  }

  .scoring-table table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .scoring-table td {
    padding: 6px 8px;
    font-size: 0.82rem;
    line-height: 1.2;
    vertical-align: middle;
  }

  .scoring-table td:first-child {
    width: 62%;
  }

  .scoring-table input {
    width: 46px;
    padding: 2px 4px;
    font-size: 0.78rem;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 6px;
    background: rgba(2, 6, 23, 0.65);
    color: #f8fafc;
  }

  .description {
    font-size: 0.7rem;
    color: #94a3b8;
    margin-top: 0.15rem;
    line-height: 1.1;
  }

  /* 7.2 LEDGER */

  .ledger-wrap {
    width: 100%;
    margin: 0.9rem 0 1.3rem;
    overflow-x: auto;
  }

  .ledger-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    background: #f3f3f3;
    color: #111;
    border: 1px solid #222;
  }

  .ledger-table th,
  .ledger-table td {
    border: 1px solid #222;
    padding: 0.28rem 0.3rem;
    font-size: 0.94rem;
    line-height: 1.15;
    color: #111;
  }

  .ledger-title-row th {
    background: #9a9a9a;
    color: #000;
    font-size: 1.05rem;
    font-weight: 700;
    text-align: center;
    padding: 0.55rem 0.4rem;
  }

  .ledger-section-row th {
    background: #375da3;
    color: #fff;
    font-weight: 700;
    text-align: left;
    padding: 0.22rem 0.3rem;
  }

  .ledger-section-row th:nth-child(2),
  .ledger-section-row th:nth-child(3) {
    text-align: center;
  }

  .ledger-highlight-row td {
    background: #375da3;
    color: #fff;
    font-weight: 700;
  }

  .ledger-highlight-row .ledger-value {
    color: #fff;
  }

  .ledger-table td:first-child,
  .ledger-table th:first-child {
    width: 62%;
  }

  .ledger-currency {
    width: 8%;
    text-align: center;
    white-space: nowrap;
  }

  .ledger-value {
    width: 30%;
    text-align: right;
    white-space: nowrap;
  }

  /* 1.2.1 DIVISIONAL STRUCTURE */

  .division-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem 1rem;
    margin: 0.55rem 0 1rem;
    align-items: stretch;
  }

  .division-card {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    min-height: 132px;
    padding: 0.7rem 0.8rem 0.75rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
  }

  .division-card h4 {
    margin: 0 0 0.4rem;
    font-size: 0.92rem;
    line-height: 1.15;
  }

  .division-card .subBlock {
    margin: 0;
    padding-left: 0.65rem;
    border-left: 2px solid rgba(212, 175, 55, 0.16);
  }

  .division-card .subBlock p {
    margin: 0.18rem 0;
    line-height: 1.28;
    font-size: 0.82rem;
  }

  /* MOBILE */

  @media (max-width: 700px) {
    .toc-grid {
      grid-template-columns: 1fr;
      gap: 0.2rem;
    }

    .toc-title {
      margin-bottom: 0.7rem;
    }

    .toc-group h3,
    .toc-group h4,
    .toc-group h5 {
      margin: 0;
      line-height: 1.15;
    }

    .toc-group h3 {
      font-size: 0.92rem;
      margin-bottom: 0.14rem;
    }

    .toc-group h4,
    .toc-group h5 {
      font-size: 0.84rem;
      margin-bottom: 0.1rem;
    }

    .constitution-shell {
      width: min(96%, 96%);
      margin-top: 2rem;
    }

    .hero-title {
      font-size: 1.7rem;
    }

    .hero-subtitle {
      font-size: 0.9rem;
    }

    .sectionHeading {
      font-size: 1.25rem;
      margin-top: 1.9rem;
      margin-bottom: 0.75rem;
    }

    .subSectionHeading {
      font-size: 1rem;
      margin-top: 1.1rem;
      margin-bottom: 0.6rem;
    }

    h4 {
      font-size: 0.95rem;
      margin-top: 0.85rem;
      margin-bottom: 0.35rem;
    }

    h5 {
      font-size: 0.85rem;
      margin-top: 0.7rem;
      margin-bottom: 0.22rem;
    }

    :global(p) {
      margin: 0.42rem 0 0.68rem;
    }

    .subBlock {
      margin: 0.25rem 0 0.8rem 0.5rem;
      padding-left: 0.65rem;
    }

    .draft-order-table,
    table {
      display: block;
      overflow-x: auto;
      white-space: nowrap;
    }

    .compact-mobile-table th,
    .compact-mobile-table td {
      padding: 3px 5px;
      font-size: 0.68rem;
      line-height: 1.05;
    }

    .bracket-container {
      justify-content: flex-start;
      padding: 1rem 0.75rem;
      gap: 16px;
    }

    .round {
      min-width: 118px;
    }

    .matchup {
      width: 108px;
      min-height: 54px;
      padding: 8px;
    }

    .round:nth-child(2) {
      gap: 54px;
    }

    .scoring-grid {
      grid-template-columns: 1fr;
      gap: 0.7rem;
    }

    .compact-scoring-table td {
      padding: 4px 6px;
      font-size: 0.7rem;
      line-height: 1.1;
    }

    .compact-scoring-table input {
      width: 40px;
      font-size: 0.68rem;
      padding: 2px;
    }

    .compact-scoring-table .description {
      font-size: 0.62rem;
      line-height: 1.05;
    }

    .ledger-table th,
    .ledger-table td {
      padding: 0.2rem 0.22rem;
      font-size: 0.62rem;
      line-height: 1.05;
    }

    .ledger-title-row th {
      font-size: 0.8rem;
      padding: 0.35rem 0.2rem;
    }

    .ledger-currency {
      width: 10%;
    }

    .ledger-value {
      width: 28%;
    }

    .division-grid {
      grid-template-columns: 1fr;
      gap: 0.6rem;
      margin: 0.45rem 0 0.9rem;
    }

    .division-card {
      min-height: auto;
      padding: 0.6rem 0.7rem 0.65rem;
    }

    .division-card h4 {
      font-size: 0.88rem;
      margin-bottom: 0.3rem;
    }

    .division-card .subBlock {
      padding-left: 0.55rem;
    }

    .division-card .subBlock p {
      font-size: 0.76rem;
      line-height: 1.18;
      margin: 0.12rem 0;
    }
  }
</style>
