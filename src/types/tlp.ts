export type TLPLevel = 'TLP:RED' | 'TLP:AMBER+STRICT' | 'TLP:AMBER' | 'TLP:GREEN' | 'TLP:CLEAR';

export interface TLPConfig {
  level: TLPLevel;
  code: 'RED' | 'AMBER+STRICT' | 'AMBER' | 'GREEN' | 'CLEAR';
  name: string;
  description: string;
  sharingBoundary: string;
  recipientScope: string;
  hexColor: string;
  badgeClasses: string;
  bannerBorderColor: string;
  bannerBgColor: string;
  textColor: string;
  stixMarkingRef: string;
  stixMarkingDefinition: {
    type: 'marking-definition';
    spec_version: '2.1';
    id: string;
    created: string;
    definition_type: 'tlp';
    name: string;
    definition: {
      tlp: string;
    };
  };
}

export const TLP_CONFIGS: Record<TLPLevel, TLPConfig> = {
  'TLP:RED': {
    level: 'TLP:RED',
    code: 'RED',
    name: 'TLP:RED (Strictly Confidential)',
    description: 'Restricted to named individual recipients only. In the context of a meeting, restricted to present attendees only.',
    sharingBoundary: 'No further disclosure. Recipients may not share TLP:RED information with anyone outside of the specific discussion or exchange.',
    recipientScope: 'Named individuals only',
    hexColor: '#ef4444',
    badgeClasses: 'bg-red-950/90 text-red-300 border-red-700/80 shadow-red-950/40',
    bannerBorderColor: '#dc2626',
    bannerBgColor: '#450a0a',
    textColor: '#fca5a5',
    stixMarkingRef: 'marking-definition--55d920b0-3e8b-4ffc-a292-23f05560b2eb',
    stixMarkingDefinition: {
      type: 'marking-definition',
      spec_version: '2.1',
      id: 'marking-definition--55d920b0-3e8b-4ffc-a292-23f05560b2eb',
      created: '2022-10-01T00:00:00.000Z',
      definition_type: 'tlp',
      name: 'TLP:RED',
      definition: {
        tlp: 'red'
      }
    }
  },
  'TLP:AMBER+STRICT': {
    level: 'TLP:AMBER+STRICT',
    code: 'AMBER+STRICT',
    name: 'TLP:AMBER+STRICT (Organization Internal Only)',
    description: 'Restricted strictly to the recipient’s own organization. Unlike standard TLP:AMBER, it CANNOT be shared with external clients or third-party partners.',
    sharingBoundary: 'Restricted to members of the recipient organization only on a strict need-to-know basis. No third-party or client sharing.',
    recipientScope: 'Organization internal members only',
    hexColor: '#f97316',
    badgeClasses: 'bg-orange-950/90 text-orange-300 border-orange-700/80 shadow-orange-950/40',
    bannerBorderColor: '#ea580c',
    bannerBgColor: '#431407',
    textColor: '#fdba74',
    stixMarkingRef: 'marking-definition--939a8430-e987-4d53-b1f1-e63491db2663',
    stixMarkingDefinition: {
      type: 'marking-definition',
      spec_version: '2.1',
      id: 'marking-definition--939a8430-e987-4d53-b1f1-e63491db2663',
      created: '2022-10-01T00:00:00.000Z',
      definition_type: 'tlp',
      name: 'TLP:AMBER+STRICT',
      definition: {
        tlp: 'amber+strict'
      }
    }
  },
  'TLP:AMBER': {
    level: 'TLP:AMBER',
    code: 'AMBER',
    name: 'TLP:AMBER (Organization & Vetted Clients/Partners)',
    description: 'Restricted to the recipient’s organization and its vetted clients or supply-chain partners who need to know in order to take defensive action.',
    sharingBoundary: 'Limited disclosure to organization members and vetted customers/partners with a clear need to protect their infrastructure.',
    recipientScope: 'Organization & vetted clients/partners',
    hexColor: '#f59e0b',
    badgeClasses: 'bg-amber-950/90 text-amber-300 border-amber-700/80 shadow-amber-950/40',
    bannerBorderColor: '#d97706',
    bannerBgColor: '#451a03',
    textColor: '#fcd34d',
    stixMarkingRef: 'marking-definition--f88d31f6-486f-44da-b317-01333bde0b82',
    stixMarkingDefinition: {
      type: 'marking-definition',
      spec_version: '2.1',
      id: 'marking-definition--f88d31f6-486f-44da-b317-01333bde0b82',
      created: '2022-10-01T00:00:00.000Z',
      definition_type: 'tlp',
      name: 'TLP:AMBER',
      definition: {
        tlp: 'amber'
      }
    }
  },
  'TLP:GREEN': {
    level: 'TLP:GREEN',
    code: 'GREEN',
    name: 'TLP:GREEN (Community & Sector ISAC Peers)',
    description: 'Restricted to the cybersecurity community, peer organizations, ISACs/CERTs, and industry sector partners. Not for public disclosure.',
    sharingBoundary: 'Recipients may share with peers and partner organizations within their sector or cybersecurity information-sharing community.',
    recipientScope: 'Cybersecurity community & ISAC peers',
    hexColor: '#10b981',
    badgeClasses: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/80 shadow-emerald-950/40',
    bannerBorderColor: '#059669',
    bannerBgColor: '#064e3b',
    textColor: '#6ee7b7',
    stixMarkingRef: 'marking-definition--34098fce-860f-48ae-8e50-ebd3cc5e41da',
    stixMarkingDefinition: {
      type: 'marking-definition',
      spec_version: '2.1',
      id: 'marking-definition--34098fce-860f-48ae-8e50-ebd3cc5e41da',
      created: '2022-10-01T00:00:00.000Z',
      definition_type: 'tlp',
      name: 'TLP:GREEN',
      definition: {
        tlp: 'green'
      }
    }
  },
  'TLP:CLEAR': {
    level: 'TLP:CLEAR',
    code: 'CLEAR',
    name: 'TLP:CLEAR (Public Disclosure / Formerly TLP:WHITE)',
    description: 'Subject to standard copyright rules, TLP:CLEAR information may be distributed freely and openly without restriction.',
    sharingBoundary: 'Recipients may distribute openly to the public, blog posts, media, or open-source repositories.',
    recipientScope: 'Open to public without restriction',
    hexColor: '#94a3b8',
    badgeClasses: 'bg-slate-800/90 text-slate-200 border-slate-600/80 shadow-slate-900/40',
    bannerBorderColor: '#475569',
    bannerBgColor: '#0f172a',
    textColor: '#cbd5e1',
    stixMarkingRef: 'marking-definition--94868c89-ae3c-4785-811e-e234922574cb',
    stixMarkingDefinition: {
      type: 'marking-definition',
      spec_version: '2.1',
      id: 'marking-definition--94868c89-ae3c-4785-811e-e234922574cb',
      created: '2022-10-01T00:00:00.000Z',
      definition_type: 'tlp',
      name: 'TLP:CLEAR',
      definition: {
        tlp: 'clear'
      }
    }
  }
};

export const DEFAULT_TLP: TLPLevel = 'TLP:AMBER';

export const ALL_TLP_LEVELS: TLPLevel[] = [
  'TLP:RED',
  'TLP:AMBER+STRICT',
  'TLP:AMBER',
  'TLP:GREEN',
  'TLP:CLEAR'
];

export function getTlpConfig(level?: string): TLPConfig {
  if (level && level in TLP_CONFIGS) {
    return TLP_CONFIGS[level as TLPLevel];
  }
  // Fallback check for case-insensitive or partial names
  if (level) {
    const upper = level.toUpperCase().trim();
    if (upper.includes('RED')) return TLP_CONFIGS['TLP:RED'];
    if (upper.includes('STRICT')) return TLP_CONFIGS['TLP:AMBER+STRICT'];
    if (upper.includes('AMBER')) return TLP_CONFIGS['TLP:AMBER'];
    if (upper.includes('GREEN')) return TLP_CONFIGS['TLP:GREEN'];
    if (upper.includes('CLEAR') || upper.includes('WHITE')) return TLP_CONFIGS['TLP:CLEAR'];
  }
  return TLP_CONFIGS[DEFAULT_TLP];
}

export function isValidTlp(level: string): boolean {
  return ALL_TLP_LEVELS.includes(level as TLPLevel);
}
