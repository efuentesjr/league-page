details {
  margin-top: 12px;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 10px;
  background: rgba(0,0,0,0.25);
}

summary.year-summary {
  list-style: none;
  cursor: pointer;
  padding: 14px 16px;
  font-weight: 600;
  font-size: 16px;
  background: rgba(0, 120, 255, 0.12);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

summary.year-summary::-webkit-details-marker {
  display: none;
}

summary.year-summary::after {
  content: "▶";
  font-size: 12px;
  transition: transform 0.2s ease;
}

details[open] summary.year-summary::after {
  transform: rotate(90deg);
}

details table {
  margin: 12px;
}

.hint {
  padding: 12px;
  opacity: 0.75;
  font-size: 13px;
}
