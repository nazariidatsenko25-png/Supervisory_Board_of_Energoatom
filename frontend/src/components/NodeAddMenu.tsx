'use client';

import { useState, useRef, useEffect } from 'react';
import { NODE_CATALOG, CATEGORIES, NodeCatalogItem, useStore } from '@/store/agentStore';

type Props = {
  sourceNodeId: string;
  sourceHandleId?: string;
  /** Position of the "+" button relative to the node: 'bottom' | 'right' */
  position?: 'bottom' | 'right';
  /** Filter: which categories to show. If omitted, show all except 'core' (no duplicate prompts). */
  excludeCategories?: string[];
};

export function NodeAddMenu({
  sourceNodeId,
  sourceHandleId,
  position = 'bottom',
  excludeCategories = ['core'],
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const addNodeWithEdge = useStore((s) => s.addNodeWithEdge);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const filteredItems = NODE_CATALOG.filter((item) => {
    if (excludeCategories.includes(item.category)) return false;
    if (!searchQuery.trim()) return true;
    return (
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const visibleCategories = CATEGORIES.filter(
    (cat) => !excludeCategories.includes(cat.id) && filteredItems.some((i) => i.category === cat.id)
  );

  const handleSelect = (item: NodeCatalogItem) => {
    addNodeWithEdge(sourceNodeId, item.type, item.defaultData, sourceHandleId);
    setIsOpen(false);
    setSearchQuery('');
  };

  const getNodeColor = (type: string) => {
    const map: Record<string, string> = {
      prompt: 'var(--node-prompt)',
      tool: 'var(--node-tool)',
      guardrail: 'var(--node-guardrail)',
      knowledge: 'var(--node-knowledge)',
      output: 'var(--node-output)',
      condition: 'var(--node-condition)',
      api: 'var(--node-api)',
      memory: 'var(--node-memory)',
    };
    return map[type] || 'var(--accent)';
  };

  const getNodeGlow = (type: string) => {
    const map: Record<string, string> = {
      prompt: 'var(--node-prompt-glow)',
      tool: 'var(--node-tool-glow)',
      guardrail: 'var(--node-guardrail-glow)',
      knowledge: 'var(--node-knowledge-glow)',
      output: 'var(--node-output-glow)',
      condition: 'var(--node-condition-glow)',
      api: 'var(--node-api-glow)',
      memory: 'var(--node-memory-glow)',
    };
    return map[type] || 'var(--accent-glow)';
  };

  // Position styles for the button and dropdown
  const isBottom = position === 'bottom';
  const btnPositionClass = isBottom
    ? 'left-1/2 -translate-x-1/2 -bottom-10'
    : 'top-1/2 -translate-y-1/2 -right-10';
  const menuPositionStyle = isBottom
    ? { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px' }
    : { top: '0', left: '100%', marginLeft: '8px' };

  return (
    <div ref={menuRef} className={`absolute ${btnPositionClass} z-40`}>
      {/* + Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-7 h-7 rounded-full flex items-center justify-center transition-all border group"
        style={{
          background: isOpen ? 'var(--accent)' : 'var(--bg-secondary)',
          borderColor: isOpen ? 'var(--accent)' : 'var(--border-light)',
          color: isOpen ? 'var(--text-inverse)' : 'var(--text-tertiary)',
          boxShadow: isOpen ? '0 0 16px var(--accent-glow-strong)' : '0 2px 8px rgba(0,0,0,0.3)',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
            (e.currentTarget as HTMLElement).style.color = 'var(--accent)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)';
          }
        }}
      >
        <svg
          className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-45' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path d="M12 5v14m-7-7h14" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute w-[260px] bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden animate-fade-in-up"
          style={menuPositionStyle}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search */}
          <div className="p-2.5 border-b border-[var(--border)]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Пошук блоку..."
              autoFocus
              className="w-full px-3 py-1.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all"
            />
          </div>

          {/* Items list */}
          <div className="max-h-[280px] overflow-y-auto scrollbar-thin py-1">
            {visibleCategories.map((cat) => {
              const catItems = filteredItems.filter((i) => i.category === cat.id);
              return (
                <div key={cat.id}>
                  <div className="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
                    {cat.icon} {cat.label}
                  </div>
                  {catItems.map((item) => (
                    <button
                      key={`${item.type}-${item.label}`}
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[var(--bg-tertiary)] transition-colors text-left"
                    >
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center text-xs flex-shrink-0"
                        style={{ background: getNodeGlow(item.type) }}
                      >
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-medium text-[var(--text-primary)] block leading-tight truncate">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-[var(--text-tertiary)] leading-tight truncate block">
                          {item.description}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
            {filteredItems.length === 0 && (
              <div className="px-4 py-6 text-center text-xs text-[var(--text-tertiary)]">
                Нічого не знайдено
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
