'use client';

interface ExpandButtonProps {
  href?: string;
  label: string;
  id?: string;
}

export function ExpandButton({ href, label, id }: ExpandButtonProps) {
  return (
    <>
      <style>{`
        .work-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          height: 54px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.12);
          overflow: hidden;
          text-decoration: none;
          background: rgba(255,255,255,0.02);
          transition: border-color 0.35s ease, box-shadow 0.35s ease;
        }
        .work-btn:hover {
          border-color: rgba(124,58,237,0.55);
          box-shadow: 0 0 32px rgba(124,58,237,0.18), inset 0 0 20px rgba(124,58,237,0.06);
        }
        .work-btn:active {
          transform: scale(0.97);
        }

        /* Left-to-right sweep on hover */
        .work-btn-sweep {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(124,58,237,0.18) 0%, transparent 65%);
          opacity: 0;
          transform: translateX(-100%);
          transition: transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease;
          pointer-events: none;
        }
        .work-btn:hover .work-btn-sweep {
          opacity: 1;
          transform: translateX(0);
        }

        /* Icon panel */
        .work-btn-icon {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 100%;
          border-right: 1px solid rgba(255,255,255,0.07);
          flex-shrink: 0;
          transition: background 0.35s ease;
        }
        .work-btn:hover .work-btn-icon {
          background: rgba(124,58,237,0.2);
        }

        /* 2×2 grid dots */
        .work-dot {
          width: 4px;
          height: 4px;
          border-radius: 1.5px;
          background: rgba(255,255,255,0.25);
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .work-btn:hover .work-dot:nth-child(1) { background: rgba(192,132,252,1);   transition-delay: 0.00s; transform: scale(1.3); }
        .work-btn:hover .work-dot:nth-child(2) { background: rgba(167,139,250,0.9); transition-delay: 0.05s; transform: scale(1.3); }
        .work-btn:hover .work-dot:nth-child(3) { background: rgba(167,139,250,0.9); transition-delay: 0.05s; transform: scale(1.3); }
        .work-btn:hover .work-dot:nth-child(4) { background: rgba(139,92,246,0.8);  transition-delay: 0.10s; transform: scale(1.3); }

        /* Label */
        .work-btn-label {
          position: relative;
          z-index: 1;
          padding: 0 14px 0 16px;
          font-family: var(--font-exo-2), sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          white-space: nowrap;
          transition: color 0.3s ease;
        }
        .work-btn:hover .work-btn-label {
          color: rgba(255,255,255,1);
        }

        /* Arrow circle */
        .work-btn-arrow {
          position: relative;
          z-index: 1;
          margin-right: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
          transition: border-color 0.3s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1), background 0.3s ease;
          flex-shrink: 0;
        }
        .work-btn:hover .work-btn-arrow {
          border-color: rgba(167,139,250,0.5);
          background: rgba(124,58,237,0.25);
          transform: translateX(3px);
        }

        /* HUD corner brackets */
        .work-btn::before,
        .work-btn::after {
          content: '';
          position: absolute;
          width: 9px;
          height: 9px;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: 3;
        }
        .work-btn::before {
          top: -1px; left: -1px;
          border-top: 1.5px solid rgba(167,139,250,0.8);
          border-left: 1.5px solid rgba(167,139,250,0.8);
          border-radius: 2px 0 0 0;
        }
        .work-btn::after {
          bottom: -1px; right: -1px;
          border-bottom: 1.5px solid rgba(167,139,250,0.8);
          border-right: 1.5px solid rgba(167,139,250,0.8);
          border-radius: 0 0 2px 0;
        }
        .work-btn:hover::before,
        .work-btn:hover::after {
          opacity: 1;
        }
      `}</style>

      <a id={id} href={href} className="work-btn">
        <span className="work-btn-sweep" aria-hidden="true" />

        {/* 2×2 dot grid icon */}
        <span className="work-btn-icon" aria-hidden="true">
          <span style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="work-dot" />
            ))}
          </span>
        </span>

        <span className="work-btn-label">{label}</span>

        {/* Arrow */}
        <span className="work-btn-arrow" aria-hidden="true">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path
              d="M2.5 5.5h6M5.8 2.8l2.7 2.7-2.7 2.7"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </a>
    </>
  );
}
