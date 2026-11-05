'use client';

import { createContext, useContext } from 'react';

/** `preview` = private admin/local preview. `base` = URL prefix for store links ('' or '/preview'). */
const StoreContext = createContext<{ preview: boolean; base: string }>({ preview: false, base: '' });

export function StoreProvider({ preview, children }: { preview: boolean; children: React.ReactNode }) {
  return <StoreContext.Provider value={{ preview, base: preview ? '/preview' : '' }}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
