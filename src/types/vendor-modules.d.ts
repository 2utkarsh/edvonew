declare module 'embla-carousel-autoplay' {
   const Autoplay: any;
   export default Autoplay;
}

declare module '@yaireo/tagify' {
   const Tagify: any;
   export default Tagify;
}

declare module 'cmdk' {
   export const Command: any;
}

declare module 'plyr-react' {
   import * as React from 'react';

   const Plyr: React.ComponentType<any>;
   export default Plyr;
}

declare module 'nprogress' {
   const NProgress: {
      start: () => void;
      done: () => void;
      configure: (options?: Record<string, unknown>) => void;
   };

   export default NProgress;
}

declare module 'lucide-static/icon-nodes.json' {
   const value: Record<string, unknown>;
   export default value;
}
