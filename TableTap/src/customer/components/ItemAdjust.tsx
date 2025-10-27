// components/features/employee/customer/ItemAdjust.tsx
import { useEffect, useMemo, useState } from "react";
import { fetchModifierGroupsForItem, fetchModifiersForGroups } from "../../shared/services/MenuItemModifiers";

export type PhoResult = {
  title: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  bowlSize?: "regular" | "large";
  noodleSize?: "thin" | "wide" | "egg";
  broth?: "beef" | "chicken" | "vegetable";
  removed: string[];
  substituted: string[];            // left in for future parity
  extraMeats: { key: string; qty: number }[];
  extras: { key: string; qty: number }[];
  notes?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (result: PhoResult) => void;
  /** NEW: which item’s modifiers to load */
  menuItemId: string;
  /** NEW: org scope */
  orgId: string;
  /** Optional overrides for title/price */
  baseTitle?: string;
  basePrice?: number;
};

const DEFAULT_TITLE = "Pho";
const DEFAULT_BASE_PRICE = 12.0;

/** Helper: classify groups by name until rule columns exist */
function classifyGroup(name: string):
  | "bowlSize"
  | "noodleSize"
  | "broth"
  | "toppings"
  | "extraMeats"
  | "extras"
  | "other" {
  const n = name.toLowerCase();
  if (n.includes("bowl") && n.includes("size")) return "bowlSize";
  if (n.includes("noodle") && n.includes("size")) return "noodleSize";
  if (n.includes("broth")) return "broth";
  if (n.includes("meat")) return "extraMeats";
  if (n.includes("extra")) return "extras";
  if (n.includes("topping")) return "toppings";
  return "other";
}

/** Future pricing hook for per-option price deltas */
const getPriceDelta = (_modifierName: string) => 0;

export default function ItemAdjust({
  open,
  onClose,
  onAdd,
  menuItemId,
  orgId,
  baseTitle,
  basePrice,
}: Props) {
  // radios (only enforced if those groups exist)
  const [bowlSize, setBowlSize] = useState<"regular" | "large">("regular");
  const [noodleSize, setNoodleSize] = useState<"" | "thin" | "wide" | "egg">("");
  const [broth, setBroth] = useState<"" | "beef" | "chicken" | "vegetable">("");

  // toppings (removals/subs) & quantities
  const [removed, setRemoved] = useState<string[]>([]);
  const [substituted, setSubstituted] = useState<string[]>([]);
  const [extraMeatQty, setExtraMeatQty] = useState<Record<string, number>>({});
  const [extraQty, setExtraQty] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [qty, setQty] = useState(1);

  // fetched groups/options
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<
    Array<{ id: string; name: string; type: ReturnType<typeof classifyGroup> }>
  >([]);
  const [modsByGroup, setModsByGroup] = useState<Record<string, { id: string; name: string }[]>>(
    {}
  );

  /** Reset state whenever modal opens */
  useEffect(() => {
    if (!open) return;
    setBowlSize("regular");
    setNoodleSize("");
    setBroth("");
    setRemoved([]);
    setSubstituted([]);
    setExtraMeatQty({});
    setExtraQty({});
    setNotes("");
    setQty(1);
  }, [open]);

  /** Fetch modifier groups/options for this item */
  useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const dbGroups = await fetchModifierGroupsForItem(orgId, menuItemId);
        const enhanced = dbGroups.map(g => ({
          id: g.modifier_group_id,
          name: g.name,
          type: classifyGroup(g.name),
        }));
        const ids = enhanced.map(g => g.id);
        const byGroup = await fetchModifiersForGroups(ids);

        if (!alive) return;
        setGroups(enhanced);
        setModsByGroup(
          Object.fromEntries(
            Object.entries(byGroup).map(([g, rows]) => [g, rows.map(r => ({ id: r.modifier_id, name: r.name }))])
          )
        );
      } catch (e) {
        console.error("Load modifiers failed:", e);
        setGroups([]);
        setModsByGroup({});
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [open, orgId, menuItemId]);

  // Pull lists by type (hide sections that have no items)
  const bowlGroup = groups.find(g => g.type === "bowlSize");
  const noodleGroup = groups.find(g => g.type === "noodleSize");
  const brothGroup = groups.find(g => g.type === "broth");
  const toppingsGroup = groups.find(g => g.type === "toppings");
  const extraMeatsGroup = groups.find(g => g.type === "extraMeats");
  const extrasGroup = groups.find(g => g.type === "extras");

  const bowlOptions = bowlGroup ? (modsByGroup[bowlGroup.id] ?? []) : [];
  const noodleOptions = noodleGroup ? (modsByGroup[noodleGroup.id] ?? []) : [];
  const brothOptions = brothGroup ? (modsByGroup[brothGroup.id] ?? []) : [];
  const toppingOptions = toppingsGroup ? (modsByGroup[toppingsGroup.id] ?? []) : [];
  const extraMeatOptions = extraMeatsGroup ? (modsByGroup[extraMeatsGroup.id] ?? []) : [];
  const extrasOptions = extrasGroup ? (modsByGroup[extrasGroup.id] ?? []) : [];

  /** Pricing (base + deltas + quantities). Deltas are 0 for now. */
  const BASE_PRICE = basePrice ?? DEFAULT_BASE_PRICE;

  const radioDelta = useMemo(() => {
    let delta = 0;
    if (bowlGroup && bowlSize) {
      const optName = bowlSize === "large" ? "Large" : "Regular";
      delta += getPriceDelta(optName);
    }
    if (noodleGroup && noodleSize) {
      const name = noodleSize === "thin" ? "Thin noodles" : noodleSize === "wide" ? "Wide noodles" : "Egg noodles";
      delta += getPriceDelta(name);
    }
    if (brothGroup && broth) {
      const name = `${broth.charAt(0).toUpperCase() + broth.slice(1)} Broth`;
      delta += getPriceDelta(name);
    }
    return delta;
  }, [bowlGroup, bowlSize, noodleGroup, noodleSize, brothGroup, broth]);

  const sumQty = (map: Record<string, number>, list: { key: string; price: number }[]) =>
    Object.entries(map).reduce((sum, [k, q]) => {
      const p = list.find(i => i.key === k)?.price ?? 0;
      return sum + p * q;
    }, 0);

  // Build dynamic price lists for quantities (all $0 for now; hook ready)
  const extraMeatsPriceList = useMemo(
    () => extraMeatOptions.map(o => ({ key: o.name, price: getPriceDelta(o.name) /* -> future */ })),
    [extraMeatOptions]
  );
  const extrasPriceList = useMemo(
    () => extrasOptions.map(o => ({ key: o.name, price: getPriceDelta(o.name) /* -> future */ })),
    [extrasOptions]
  );

  const unitPrice = useMemo(
    () => BASE_PRICE + radioDelta + sumQty(extraMeatQty, extraMeatsPriceList) + sumQty(extraQty, extrasPriceList),
    [BASE_PRICE, radioDelta, extraMeatQty, extraMeatsPriceList, extraQty, extrasPriceList]
  );
  const totalPrice = useMemo(() => unitPrice * qty, [unitPrice, qty]);

  // UI helpers
  const toggleRemove = (label: string) =>
    setRemoved(prev => (prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label]));
  const toggleSub = (label: string) =>
    setSubstituted(prev => (prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label]));
  const inc = (map: Record<string, number>, set: (m: Record<string, number>) => void, key: string, d: number) => {
    const next = { ...map, [key]: Math.max(0, (map[key] ?? 0) + d) };
    if (next[key] === 0) delete next[key];
    set(next);
  };

  /** Required radios only if those groups exist */
  const needNoodle = Boolean(noodleGroup);
  const needBroth = Boolean(brothGroup);
  const canSubmit = (!needNoodle || noodleSize !== "") && (!needBroth || broth !== "");

  if (!open) return null;

  const title = baseTitle ?? DEFAULT_TITLE;

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1050, background: "rgba(0,0,0,0.35)" }} onClick={onClose}>
      <div
        className="position-absolute top-0 start-50 translate-middle-x bg-white w-100"
        style={{ maxWidth: 520, maxHeight: "100vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ height: 180, background: "#eee" }} />
        <div className="p-3">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="m-0">{title}</h5>
            <button className="btn btn-sm btn-light" onClick={onClose}>✕</button>
          </div>
          {/* (Optional) item description could come from parent later */}

          {/* Bowl size (single) */}
          {bowlOptions.length > 0 && (
            <div className="mb-3">
              <div className="fw-semibold">{bowlGroup?.name ?? "Bowl Size"}</div>
              <div className="mt-2 vstack gap-2">
                {bowlOptions.map(o => {
                  const isLarge = o.name.toLowerCase().includes("large");
                  const value: "regular" | "large" = isLarge ? "large" : "regular";
                  return (
                    <label key={o.id} className="d-flex justify-content-between border rounded px-2 py-2">
                      <div>
                        <input type="radio" checked={bowlSize === value} onChange={() => setBowlSize(value)} />{" "}
                        {o.name}
                      </div>
                      {/* future: show +$ if getPriceDelta(o.name) > 0 */}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Noodle size (required if present) */}
          {noodleOptions.length > 0 && (
            <div className="mb-3">
              <div className="fw-semibold">{noodleGroup?.name ?? "Noodle Size"}</div>
              <div className="mt-2 vstack gap-2">
                {noodleOptions.map(o => {
                  const n = o.name.toLowerCase();
                  const value: "thin" | "wide" | "egg" =
                    n.includes("wide") ? "wide" : n.includes("egg") ? "egg" : "thin";
                  return (
                    <label key={o.id} className="d-flex justify-content-between border rounded px-2 py-2">
                      <div>
                        <input type="radio" checked={noodleSize === value} onChange={() => setNoodleSize(value)} /> {o.name}
                      </div>
                      {/* future price label */}
                    </label>
                  );
                })}
              </div>
              {needNoodle && noodleSize === "" && <div className="text-danger small">Required</div>}
            </div>
          )}

          {/* Broth (required if present) */}
          {brothOptions.length > 0 && (
            <div className="mb-3">
              <div className="fw-semibold">{brothGroup?.name ?? "Broth"}</div>
              <div className="mt-2 vstack gap-2">
                {brothOptions.map(o => {
                  const n = o.name.toLowerCase();
                  const value: "beef" | "chicken" | "vegetable" =
                    n.includes("chicken") ? "chicken" : n.includes("veg") ? "vegetable" : "beef";
                  return (
                    <label key={o.id} className="d-flex justify-content-between border rounded px-2 py-2">
                      <input type="radio" checked={broth === value} onChange={() => setBroth(value)} /> {o.name}
                    </label>
                  );
                })}
              </div>
              {needBroth && broth === "" && <div className="text-danger small">Required</div>}
            </div>
          )}

          {/* Toppings (removals) — treat modifiers starting with "No " as removable flags */}
          {toppingOptions.length > 0 && (
            <div className="mb-3">
              <div className="fw-semibold">{toppingsGroup?.name ?? "What it comes with"}</div>
              <div className="vstack">
                {toppingOptions.map(o => {
                  // "No cilantro" -> label "cilantro"
                  const lower = o.name.toLowerCase();
                  const label = lower.startsWith("no ") ? o.name.slice(3) : o.name;
                  const key = label.trim();
                  const isOn = removed.includes(key);
                  return (
                    <div key={o.id} className="d-flex justify-content-between border-bottom py-2">
                      <span>{label}</span>
                      <div>
                        {/* keep substitute button for future parity; does nothing special yet */}
                        {/* <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => toggleSub(key)}>Sub</button> */}
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => toggleRemove(key)}>
                          {isOn ? "Undo" : "✕"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Extra Meats (quantity) */}
          {extraMeatOptions.length > 0 && (
            <div className="mb-3">
              <div className="fw-semibold">{extraMeatsGroup?.name ?? "Extra Meat Options"}</div>
              <div className="vstack">
                {extraMeatOptions.map(o => {
                  const q = extraMeatQty[o.name] ?? 0;
                  return (
                    <div key={o.id} className="d-flex justify-content-between border-bottom py-2">
                      <div>
                        {o.name}{" "}
                        {/* future: price label if getPriceDelta(o.name) > 0 */}
                        {/* <span className="text-muted small">+ ${getPriceDelta(o.name).toFixed(2)}</span> */}
                      </div>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-secondary" onClick={() => inc(extraMeatQty, setExtraMeatQty, o.name, -1)}>-</button>
                        <button className="btn btn-light" disabled>{q}</button>
                        <button className="btn btn-outline-secondary" onClick={() => inc(extraMeatQty, setExtraMeatQty, o.name, +1)}>+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Extras (quantity) */}
          {extrasOptions.length > 0 && (
            <div className="mb-3">
              <div className="fw-semibold">{extrasGroup?.name ?? "Extras"}</div>
              <div className="vstack">
                {extrasOptions.map(o => {
                  const q = extraQty[o.name] ?? 0;
                  return (
                    <div key={o.id} className="d-flex justify-content-between border-bottom py-2">
                      <div>{o.name}</div>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-secondary" onClick={() => inc(extraQty, setExtraQty, o.name, -1)}>-</button>
                        <button className="btn btn-light" disabled>{q}</button>
                        <button className="btn btn-outline-secondary" onClick={() => inc(extraQty, setExtraQty, o.name, +1)}>+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mb-3">
            <div className="fw-semibold">Notes</div>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Add special instructions"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Footer */}
          <div className="d-flex justify-content-between align-items-center border-top pt-2">
            <div className="btn-group btn-group-sm">
              <button className="btn btn-outline-secondary" onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
              <button className="btn btn-light" disabled>{qty}</button>
              <button className="btn btn-outline-secondary" onClick={() => setQty(q => q + 1)}>+</button>
            </div>
            <button
              className="btn btn-danger"
              disabled={!canSubmit || loading}
              onClick={() => {
                if (!canSubmit) return;
                const result: PhoResult = {
                  title,
                  qty,
                  unitPrice,
                  totalPrice,
                  bowlSize: bowlGroup ? bowlSize : undefined,
                  noodleSize: noodleGroup && noodleSize ? (noodleSize as "thin" | "wide" | "egg") : undefined,
                  broth: brothGroup && broth ? (broth as "beef" | "chicken" | "vegetable") : undefined,
                  removed,
                  substituted,
                  extraMeats: Object.entries(extraMeatQty).map(([key, q]) => ({ key, qty: q })),
                  extras: Object.entries(extraQty).map(([key, q]) => ({ key, qty: q })),
                  notes: notes.trim() || undefined,
                };
                onAdd(result);
                onClose();
              }}
            >
              Add to cart • ${totalPrice.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
