import { useEffect, useMemo, useState } from "react";
import {
  fetchModifierGroupsForItem,
  fetchModifiersForGroups,
  type DbModifierGroup,
  type DbModifier,
} from "../../shared/services/MenuItemModifiers";

/** Keep the same result shape you already use elsewhere */
export type PhoResult = {
  qty: number;
  unitPrice: number;
  bowlSize?: string;
  noodleSize?: string;
  broth?: string;
  removed?: string[];                          // multi
  substituted?: string[];                      // reserved
  extraMeats?: { key: string; qty: number }[]; // keep shape, force qty=1
  extras?: { key: string; qty: number }[];     // keep shape, force qty=1
  notes?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (res: PhoResult) => void;
  orgId: string;
  menuItemId: string;
  baseTitle: string;
  basePrice: number;
};

export default function ItemAdjust(props: Props) {
  const { open, onClose, onAdd, orgId, menuItemId, baseTitle, basePrice } = props;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [groups, setGroups] = useState<DbModifierGroup[]>([]);
  const [optionsByGroup, setOptionsByGroup] = useState<Record<string, DbModifier[]>>({});
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  // single-select radios: groupId -> optionId
  const [singlePick, setSinglePick] = useState<Record<string, string | null>>({});
  // multi-select checkboxes: groupId -> Set<optionId>
  const [multiPick, setMultiPick] = useState<Record<string, Set<string>>>({});

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

        // reset
        setQty(1);
        setNote("");
        setSinglePick({});
        setMultiPick({});
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message ?? "Failed to load modifiers");
        setGroups([]);
        setOptionsByGroup({});
        setSinglePick({});
        setMultiPick({});
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [open, orgId, menuItemId]);

  const unitPrice = useMemo(() => basePrice, [basePrice]);
  const totalPrice = useMemo(() => unitPrice * qty, [unitPrice, qty]);

  // Heuristics by group name (adjust to your exact names if you prefer)
  const isPhoMeats = (name: string) => /pho\s*meats?/i.test(name);
  const isExtras   = (name: string) => /^extras?$/i.test(name) || /add-ons?/i.test(name);
  const isRemoved  = (name: string) => /removed?|no\s+/i.test(name);
  const isSingle   = (name: string) => /(bowl|size|noodle|broth)/i.test(name);

  const toggleMulti = (groupId: string, optionId: string, checked: boolean) => {
    setMultiPick(prev => {
      const next = { ...prev };
      const set = new Set(next[groupId] ?? []);
      if (checked) set.add(optionId);
      else set.delete(optionId);
      next[groupId] = set;
      return next;
    });
  };

  const setSingle = (groupId: string, optionId: string) => {
    setSinglePick(prev => ({ ...prev, [groupId]: optionId }));
  };

  const onConfirm = () => {
    let bowlSize: string | undefined;
    let noodleSize: string | undefined;
    let broth: string | undefined;
    let removed: string[] = [];
    // IMPORTANT: keep the old shapes, but we’ll force qty = 1 and unique keys
    let extraMeats: { key: string; qty: number }[] = [];
    let extrasArr:  { key: string; qty: number }[] = [];

    for (const g of groups) {
      const gid = g.modifier_group_id;
      const gname = g.name ?? "";
      const opts = optionsByGroup[gid] ?? [];

      if (isSingle(gname)) {
        const pickedId = singlePick[gid];
        if (pickedId) {
          const label = opts.find(o => o.modifier_id === pickedId)?.name ?? "";
          if (/bowl|size/i.test(gname)) bowlSize = label;
          else if (/noodle/i.test(gname)) noodleSize = label;
          else if (/broth/i.test(gname)) broth = label;
        }
        continue;
      }

      const picked = Array.from(multiPick[gid] ?? []);
      if (!picked.length) continue;
      const names = picked
        .map(id => opts.find(o => o.modifier_id === id)?.name)
        .filter(Boolean) as string[];

      if (isPhoMeats(gname)) {
        // No quantities allowed → emit qty:1 for each unique key
        const unique = Array.from(new Set(names));
        extraMeats = unique.map(n => ({ key: n, qty: 1 }));
      } else if (isExtras(gname)) {
        const unique = Array.from(new Set(names));
        extrasArr = unique.map(n => ({ key: n, qty: 1 }));
      } else if (isRemoved(gname)) {
        removed = Array.from(new Set([...removed, ...names]));
      } else {
        // Treat any other multi group as extras by default (qty:1)
        const unique = Array.from(new Set(names));
        extrasArr = Array.from(new Set([...extrasArr.map(e => e.key), ...unique])).map(n => ({ key: n, qty: 1 }));
      }
    }

    const payload: PhoResult = {
      qty,
      unitPrice,
      bowlSize,
      noodleSize,
      broth,
      removed: removed.length ? removed : undefined,
      extraMeats: extraMeats.length ? extraMeats : undefined,
      extras: extrasArr.length ? extrasArr : undefined,
      notes: note?.trim() || undefined,
    };

    onAdd(payload);
    onClose();
  };

  if (!open) return null;

  return (
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
            <div className="text-muted">No options.</div>
          )}

          {!loading && !err && groups.length > 0 && (
            <>
              {groups.map(g => {
                const gid = g.modifier_group_id;
                const opts = optionsByGroup[gid] ?? [];
                const name = g.name ?? "";
                const renderAsSingle = isSingle(name);
                // IMPORTANT: meats & extras & removed = checkboxes (no +/-)
                const renderAsMulti = !renderAsSingle;

                return (
                  <div key={gid} className="mb-3">
                    <div className="fw-semibold">{g.name}</div>
                    <div className="mt-2 vstack">
                      {opts.map(o => {
                        const checked = renderAsSingle
                          ? (singlePick[gid] === o.modifier_id)
                          : (multiPick[gid]?.has(o.modifier_id) ?? false);

                        return (
                          <label
                            key={o.modifier_id}
                            className="d-flex align-items-center justify-content-between border-bottom py-2 mb-0"
                          >
                            <span className="d-flex align-items-center">
                              <input
                                className="form-check-input me-2"
                                type={renderAsSingle ? "radio" : "checkbox"}
                                name={renderAsSingle ? `single-${gid}` : undefined}
                                checked={checked}
                                onChange={(e) => {
                                  if (renderAsSingle) setSingle(gid, o.modifier_id);
                                  else toggleMulti(gid, o.modifier_id, e.target.checked);
                                }}
                              />
                              {o.name}
                            </span>
                          </label>
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
