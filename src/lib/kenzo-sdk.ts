interface KenzoSDK {
  init: (config: { apiKey: string; apiBaseUrl: string }) => void;
  startFlow: (flowId: string) => void;
  stopFlow: () => void;
  track: (event: string, properties?: any) => void;
  identify: (userId: string, traits?: any) => void;
  destroy: () => void;
  reload: () => void;
  version: () => string;
}

export const Kenzo: KenzoSDK = {
  init: (config) => {
    if (typeof window === 'undefined') return;

    if ((window as any).Kenzo) {
      (window as any).Kenzo.init(config);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://kenzo-dap.onrender.com/sdk.js';
    script.async = true;
    script.onload = () => {
      if ((window as any).Kenzo) {
        (window as any).Kenzo.init(config);
      }
    };
    document.head.appendChild(script);
  },

  startFlow: (flowId) => {
    if (typeof window !== 'undefined' && (window as any).Kenzo) {
      (window as any).Kenzo.startFlow(flowId);
    }
  },

  stopFlow: () => {
    if (typeof window !== 'undefined' && (window as any).Kenzo) {
      (window as any).Kenzo.stopFlow();
    }
  },

  track: (event, properties) => {
    if (typeof window !== 'undefined' && (window as any).Kenzo) {
      (window as any).Kenzo.track(event, properties);
    }
  },

  identify: (userId, traits) => {
    if (typeof window !== 'undefined' && (window as any).Kenzo) {
      (window as any).Kenzo.identify(userId, traits);
    }
  },

  destroy: () => {
    if (typeof window !== 'undefined' && (window as any).Kenzo) {
      (window as any).Kenzo.destroy();
    }
  },

  reload: () => {
    if (typeof window !== 'undefined' && (window as any).Kenzo) {
      (window as any).Kenzo.reload();
    }
  },

  version: () => {
    if (typeof window !== 'undefined' && (window as any).Kenzo) {
      return (window as any).Kenzo.version();
    }
    return '1.0.0';
  },
};
