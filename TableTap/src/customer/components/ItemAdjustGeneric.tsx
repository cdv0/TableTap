import { useEffect, useMemo, useState } from "react";
import {
  fetchModifierGroupsForItem,
  fetchModifiersForGroups,
  type DbModifierGroup,
  type DbModifier,
} from "../../shared/services/MenuItemModifiers";

type OptionWithQty = { id: string; name: string; qty: number };
type Selection = { groupId: string; groupName: string; options: OptionWithQty[] };

export type GenericAdjustResult = {
  qty: number;
  unitPrice: number;
  selections: Selection[];
  notes?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (res: GenericAdjustResult) => void;
  orgId: string;
  menuItemId: string;
  baseTitle: string;
  basePrice: number;
};

export default function ItemAdjustGeneric(props: Props) {
  const { open, onClose, onAdd, orgId, menuItemId, baseTitle, basePrice } = props;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [groups, setGroups] = useState<DbModifierGroup[]>([]);
  const [optionsByGroup, setOptionsByGroup] = useState<Record<string, DbModifier[]>>({});

  // All groups are 0..N picks via checkbox
  const [multi, setMulti] = useState<Record<string, Set<string>>>({});
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const gs = await fetchModifierGroupsForItem(orgId, menuItemId);
        if (!alive) return;
        setGroups(gs);

        const ids = gs.map(g => g.modifier_group_id);
        const byGroup = ids.length ? await fetchModifiersForGroups(ids) : {};
        if (!alive) return;

        setOptionsByGroup(byGroup);
        setMulti({});
        setQtyMap({});
        setQty(1);
        setNote("");
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message ?? "Failed to load modifiers");
        setGroups([]);
        setOptionsByGroup({});
        setMulti({});
        setQtyMap({});
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [open, orgId, menuItemId]);

  const unitPrice = useMemo(() => basePrice, [basePrice]);
  const totalPrice = useMemo(() => unitPrice * qty, [unitPrice, qty]);

  // Toggle a single checkbox and keep qty clean
  const togglePick = (groupId: string, optionId: string, checked: boolean) => {
    setMulti(prev => {
      const next = { ...prev };
      const set = new Set(next[groupId] ?? []);
      if (checked) set.add(optionId);
      else set.delete(optionId);
      next[groupId] = set;
      return next;
    });
    setQtyMap(m => {
      const next = { ...m };
      if (checked) next[optionId] = next[optionId] ?? 1;
      else delete next[optionId];
      return next;
    });
  };

  const decQty = (optionId: string) =>
    setQtyMap(m => ({ ...m, [optionId]: Math.max(1, (m[optionId] ?? 1) - 1) }));
  const incQty = (optionId: string) =>
    setQtyMap(m => ({ ...m, [optionId]: (m[optionId] ?? 1) + 1 }));

  const buildSelections = (): Selection[] => {
    const out: Selection[] = [];
    for (const g of groups) {
      const opts = optionsByGroup[g.modifier_group_id] ?? [];
      const pickedIds = Array.from(multi[g.modifier_group_id] ?? []);
      if (!pickedIds.length) continue;

      const picked: OptionWithQty[] = [];
      pickedIds.forEach(id => {
        const o = opts.find(x => x.modifier_id === id);
        if (!o) return;
        const q = Math.max(1, Number(qtyMap[id] ?? 1));
        picked.push({ id: o.modifier_id, name: o.name, qty: q });
      });

      if (picked.length) {
        out.push({ groupId: g.modifier_group_id, groupName: g.name, options: picked });
      }
    }
    return out;
  };

  const selectionsToNote = (sel: Selection[], extra?: string) => {
    const body = sel
      .map(s => `${s.groupName}: ${s.options.map(o => (o.qty > 1 ? `${o.name} x${o.qty}` : o.name)).join(", ")}`)
      .join(" | ");
    const parts = [body, extra?.trim()].filter(Boolean);
    return parts.length ? parts.join(" | ") : undefined;
  };

  const onConfirm = () => {
  const selections = buildSelections();
  onAdd({
    qty,
    unitPrice,
    selections,                 // structured modifiers
    notes: note.trim() || undefined, // ONLY user free text
  });
  onClose();
};


  if (!open) return null;

  return (
    // Pho-style sheet overlay
    <div
      className="position-fixed top-0 start-0 w-100 h-100"
      style={{ zIndex: 1050, background: "rgba(0,0,0,0.35)" }}
      onClick={onClose}
    >
      <div
        className="position-absolute top-0 start-50 translate-middle-x bg-white w-100"
        style={{ maxWidth: 520, maxHeight: "100vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ height: 180, background: "#eee" }} />
        <div className="p-3">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="m-0">{baseTitle}</h5>
            <button className="btn btn-sm btn-light" onClick={onClose}>✕</button>
          </div>

          {loading && <div className="text-muted">Loading…</div>}
          {err && <div className="alert alert-danger mb-3">{err}</div>}
          {!loading && !err && groups.length === 0 && (
            <div className="text-muted">No modifiers available.</div>
          )}

          {!loading && !err && groups.length > 0 && (
            <>
              {groups.map(g => {
                const opts = optionsByGroup[g.modifier_group_id] ?? [];
                const groupId = g.modifier_group_id;

                return (
                  <div key={groupId} className="mb-3">
                    <div className="fw-semibold">{g.name}</div>

                    <div className="mt-2 vstack">
                      {opts.map(o => {
                        const picked = multi[groupId]?.has(o.modifier_id) ?? false;
                        const q = Math.max(1, Number(qtyMap[o.modifier_id] ?? 1));
                        return (
                          <div
                            key={o.modifier_id}
                            className="d-flex justify-content-between align-items-center border-bottom py-2"
                          >
                            <label className="d-flex align-items-center mb-0">
                              <input
                                className="form-check-input me-2"
                                type="checkbox"
                                checked={picked}
                                onChange={(e) => togglePick(groupId, o.modifier_id, e.target.checked)}
                              />
                              <span>{o.name}</span>
                            </label>

                            {picked ? (
                              <div className="btn-group btn-group-sm">
                                <button className="btn btn-outline-secondary" onClick={() => decQty(o.modifier_id)}>-</button>
                                <button className="btn btn-light" disabled>{q}</button>
                                <button className="btn btn-outline-secondary" onClick={() => incQty(o.modifier_id)}>+</button>
                              </div>
                            ) : (
                              <div style={{ height: 30 }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div className="mb-3">
                <div className="fw-semibold">Notes</div>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Add special instructions"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="d-flex justify-content-between align-items-center border-top pt-2">
                <div className="btn-group btn-group-sm">
                  <button className="btn btn-outline-secondary" onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
                  <button className="btn btn-light" disabled>{qty}</button>
                  <button className="btn btn-outline-secondary" onClick={() => setQty(q => q + 1)}>+</button>
                </div>
                <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
                  Add to cart • ${totalPrice.toFixed(2)}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
