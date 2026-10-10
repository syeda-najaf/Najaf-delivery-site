import React, { useEffect, useState } from 'react';
import './TrackingStatus.css';

const STEPS = [
  { key: 'confirmed',  title: 'Order confirmed',  meta: 'Kitchen accepted your order', icon: '✓' },
  { key: 'preparing',  title: 'Being prepared',   meta: 'Chef is plating your food',   icon: '◒' },
  { key: 'en_route',   title: 'Rider en route',   meta: 'Ayaan is heading your way',   icon: '⌁' },
  { key: 'at_door',    title: 'At your door',     meta: 'Delivery handoff',            icon: '⌂' },
];

const STEP_INDEX = {
  confirmed: 0,
  preparing: 1,
  out_for_delivery: 2,
  delivered: 4,
};

export default function TrackingStatus({
  rawStatus = 'preparing',
  eta = '~22 min',
  rider = 'Ayaan',
  riderConnected = false,
  onCall,
  onMessage,
}) {
  const current = STEP_INDEX[rawStatus] ?? 1;
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => (p + 1) % 3), 900);
    return () => clearInterval(t);
  }, []);

  const dots = '·'.repeat(pulse + 1);

  return (
    <div className="ts-root">
      {/* Live status ribbon */}
      <div className="ts-ribbon">
        <div className="ts-ribbon-left">
          <span className="ts-live-dot" />
          <span className="ts-live-label">LIVE</span>
          <span className="ts-ribbon-sep">·</span>
          <span className="ts-ribbon-step">
            Step {Math.min(current + 1, 4)} of 4
          </span>
          <span className="ts-ribbon-sep">·</span>
          <span className="ts-ribbon-status">
            {STEPS[Math.min(current, 3)].title}
          </span>
        </div>
        <div className="ts-ribbon-right">
          <span className="ts-ribbon-eta-label">ETA</span>
          <strong className="ts-ribbon-eta">{eta}</strong>
        </div>
      </div>

      {/* Timeline */}
      <div className="ts-timeline">
        {STEPS.map((step, i) => {
          const state =
            i < current ? 'done' : i === current ? 'current' : 'upcoming';
          return (
            <div key={step.key} className={`ts-step ts-step--${state}`}>
              <div className="ts-step-icon">
                {state === 'done' ? '✓' : step.icon}
                {state === 'current' && <span className="ts-step-pulse" />}
              </div>
              <div className="ts-step-body">
                <strong>{step.title}</strong>
                <small>{step.meta}</small>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rider card */}
      <div className="ts-rider">
        <div className="ts-rider-avatar">{rider.charAt(0)}</div>
        <div className="ts-rider-info">
          <div className="ts-rider-label">YOUR RIDER</div>
          <strong className="ts-rider-name">{rider}</strong>
          <div className="ts-rider-meta">
            <span>★ 4.98</span>
            <span>·</span>
            <span>1,240 deliveries</span>
          </div>
        </div>
        <div className="ts-rider-actions">
          {riderConnected ? (
            <span className="ts-rider-pill ts-rider-pill--live">
              <span className="ts-pill-dot" /> Connected
            </span>
          ) : (
            <span className="ts-rider-pill ts-rider-pill--waiting">
              <span className="ts-pill-dot" /> Connecting{dots}
            </span>
          )}
          <div className="ts-rider-buttons">
            <button
              type="button"
              className="ts-rider-btn"
              onClick={onCall}
              aria-label="Call rider"
            >
              CALL
            </button>
            <button
              type="button"
              className="ts-rider-btn ts-rider-btn--ghost"
              onClick={onMessage}
              aria-label="Message rider"
            >
              MESSAGE
            </button>
          </div>
        </div>
      </div>

      {/* Realtime channel chip */}
      <div className="ts-channel">
        <span className={`ts-channel-dot ${riderConnected ? 'is-live' : ''}`} />
        <div className="ts-channel-body">
          <strong>Realtime channel</strong>
          <small>
            {riderConnected
              ? 'Supabase order updates + Mapbox route'
              : 'Awaiting signal · Supabase order updates + Mapbox route'}
          </small>
        </div>
      </div>
    </div>
  );
}