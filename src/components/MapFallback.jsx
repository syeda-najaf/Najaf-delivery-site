import React from 'react';
import './MapFallback.css';

export default function MapFallback({
  message = 'Connecting to live rider signal…',
  destinationLabel = 'Delivery destination',
  destinationValue = 'Kodihalli, Bengaluru',
}) {
  return (
    <div className="mf-root">
      {/* radar sweep */}
      <div className="mf-radar">
        <div className="mf-radar-ring mf-radar-ring--1" />
        <div className="mf-radar-ring mf-radar-ring--2" />
        <div className="mf-radar-ring mf-radar-ring--3" />
        <div className="mf-radar-sweep" />
        <div className="mf-radar-core">
          <span className="mf-radar-core-dot" />
        </div>
      </div>

      {/* route preview */}
      <svg
        className="mf-route"
        viewBox="0 0 400 220"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M 40 180 C 120 140, 180 120, 240 90 S 340 40, 360 30"
          fill="none"
          stroke="url(#mfGrad)"
          strokeWidth="2.5"
          strokeDasharray="6 6"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="mfGrad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#F97316" stopOpacity=".55" />
            <stop offset="55%" stopColor="#A3E635" stopOpacity=".9" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <circle cx="40" cy="180" r="6" fill="#F97316" />
        <circle cx="360" cy="30" r="6" fill="#059669" />
      </svg>

      {/* live badge */}
      <div className="mf-badge">
        <span className="mf-badge-dot" />
        <span className="mf-badge-text">{message}</span>
      </div>

      {/* destination chip */}
      <div className="mf-destination">
        <div className="mf-destination-label">{destinationLabel}</div>
        <div className="mf-destination-value">{destinationValue}</div>
      </div>
    </div>
  );
}