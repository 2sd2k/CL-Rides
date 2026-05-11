'use client';

import React from 'react';
import { TweaksPanel, TweakSection, TweakSelect, TweakButton } from './TweaksPanel';
import { useStore } from './store';

export function Tweaks() {
  const { session, switchPersona, resetData } = useStore();
  const currentPersona =
    !session                  ? 'signedout' :
    session.isGuest           ? 'guest'     :
    session.role === 'admin'  ? 'admin'     :
    session.role === 'driver' ? 'driver'    :
                                'member';

  return (
    <TweaksPanel title="Demo controls">
      <TweakSection label="Persona">
        <TweakSelect
          label="Sign in as"
          value={currentPersona}
          onChange={switchPersona}
          options={['signedout', 'guest', 'member', 'driver', 'admin']}
        />
        <div style={{ fontSize: 11, color: '#8D8BA3', marginTop: 8, lineHeight: 1.5 }}>
          Admin/driver personas come from the seeded approved-email list. Member is created from <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>jake@grace.org</span>.
        </div>
      </TweakSection>

      <TweakSection label="Demo data">
        <TweakButton label="Reset to seed data" onClick={resetData} secondary />
      </TweakSection>
    </TweaksPanel>
  );
}
