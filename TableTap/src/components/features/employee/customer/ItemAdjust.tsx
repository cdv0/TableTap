import { useEffect, useMemo, useState } from "react";

export type PhoResult = {
  title: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  bowlSize: "regular" | "large";
  noodleSize: "thin" | "wide" | "egg";
  broth: "beef" | "chicken" | "vegetable";
  removed: string[];
  substituted: string[];
  extraMeats: { key: string; qty: number }[];
  extras: { key: string; qty: number }[];
  notes?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (result: PhoResult) => void;
};

const BASE_TITLE = "Beef pho";
const BASE_PRICE = 14.99;

const defaultToppings = [
  { key: "onions", label: "Onions", allowRemove: true },
  { key: "cilantro", label: "Cilantro", allowRemove: true },
  { key: "rareSteak", label: "Rare steak", allowRemove: true, allowSub: true },
  { key: "tendon", label: "Tendon", allowRemove: true, allowSub: true },
];

const extraMeats = [
  { key: "rareSteak", label: "Rare steak", price: 4 },
  { key: "brisket", label: "Brisket", price: 4 },
  { key: "tendon", label: "Tendon", price: 4 },
  { key: "tripe", label: "Tripe", price: 4 },
  { key: "meatball", label: "Meatball", price: 4 },
  { key: "beefFat", label: "Beef Fat", price: 4 },
  { key: "chicken", label: "Chicken", price: 4 },
  { key: "shrimp", label: "Shrimp", price: 4 },
  { key: "tofu", label: "Tofu", price: 3 },
  { key: "veg", label: "Steam Vegetables", price: 4 },
  { key: "filet", label: "Filet Mignon", price: 6 },
];

const extras = [
  { key: "noodles", label: "Noodles", price: 4 },
  { key: "soup", label: "Soup", price: 4 },
  { key: "vinegarOnions", label: "Vinegar Onions", price: 1 },
];

export default function ItemAdjustPho({ open, onClose, onAdd }: Props) {
  const [bowlSize, setBowlSize] = useState<"regular" | "large">("regular");
  const [noodleSize, setNoodleSize] = useState<"" | "thin" | "wide" | "egg">("");
  const [broth, setBroth] = useState<"" | "beef" | "chicken" | "vegetable">("");
  const [removed, setRemoved] = useState<string[]>([]);
  const [substituted, setSubstituted] = useState<string[]>([]);
  const [extraMeatQty, setExtraMeatQty] = useState<Record<string, number>>({});
  const [extraQty, setExtraQty] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [qty, setQty] = useState(1);

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

  const noodleDelta = noodleSize === "wide" || noodleSize === "egg" ? 1 : 0;
  const bowlDelta = bowlSize === "large" ? 1 : 0;

  const sumQty = (map: Record<string, number>, list: { key: string; price: number }[]) =>
    Object.entries(map).reduce((sum, [k, q]) => {
      const p = list.find(i => i.key === k)?.price ?? 0;
      return sum + p * q;
    }, 0);

  const unitPrice = useMemo(
    () => BASE_PRICE + bowlDelta + noodleDelta + sumQty(extraMeatQty, extraMeats) + sumQty(extraQty, extras),
    [bowlDelta, noodleDelta, extraMeatQty, extraQty]
  );

  const totalPrice = useMemo(() => unitPrice * qty, [unitPrice, qty]);

  const toggleRemove = (k: string) =>
    setRemoved(prev => (prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]));

  const toggleSub = (k: string) =>
    setSubstituted(prev => (prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]));

  const inc = (
    map: Record<string, number>,
    set: (m: Record<string, number>) => void,
    key: string,
    d: number
  ) => {
    const next = { ...map, [key]: Math.max(0, (map[key] ?? 0) + d) };
    if (next[key] === 0) delete next[key];
    set(next);
  };

  const canSubmit = noodleSize !== "" && broth !== "";

  const submit = () => {
    if (!canSubmit) return;
    onAdd({
      title: BASE_TITLE,
      qty,
      unitPrice,
      totalPrice,
      bowlSize,
      noodleSize: noodleSize as "thin" | "wide" | "egg",
      broth: broth as "beef" | "chicken" | "vegetable",
      removed,
      substituted,
      extraMeats: Object.entries(extraMeatQty).map(([key, q]) => ({ key, qty: q })),
      extras: Object.entries(extraQty).map(([key, q]) => ({ key, qty: q })),
      notes: notes.trim() || undefined,
    });
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
        {/* Header */}
        <div style={{ height: 180, background: "#eee" }} />
        <div className="p-3">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="m-0">{BASE_TITLE}</h5>
            <button className="btn btn-sm btn-light" onClick={onClose}>✕</button>
          </div>
          <p className="text-muted small">
            Flavorful Vietnamese noodle soup made with a rich, clear beef broth, flat rice noodles, and thinly sliced beef.
          </p>

          {/* Bowl size */}
          <div className="mb-3">
            <div className="fw-semibold">Bowl Size</div>
            <div className="mt-2 vstack gap-2">
              {["regular", "large"].map(opt => (
                <label key={opt} className="d-flex justify-content-between border rounded px-2 py-2">
                  <div>
                    <input
                      type="radio"
                      checked={bowlSize === opt}
                      onChange={() => setBowlSize(opt as "regular" | "large")}
                    /> {opt === "regular" ? "Regular" : "Large"}
                  </div>
                  {opt === "large" && <span className="text-muted small">+ $1.00</span>}
                </label>
              ))}
            </div>
          </div>

          {/* Noodle size */}
          <div className="mb-3">
            <div className="fw-semibold">Noodle Size</div>
            <div className="mt-2 vstack gap-2">
              {["thin", "wide", "egg"].map(opt => (
                <label key={opt} className="d-flex justify-content-between border rounded px-2 py-2">
                  <div>
                    <input
                      type="radio"
                      checked={noodleSize === opt}
                      onChange={() => setNoodleSize(opt as "thin" | "wide" | "egg")}
                    /> {opt === "thin" ? "Thin noodles" : opt === "wide" ? "Wide noodles" : "Egg noodles"}
                  </div>
                  {(opt === "wide" || opt === "egg") && <span className="text-muted small">+ $1.00</span>}
                </label>
              ))}
            </div>
            {noodleSize === "" && <div className="text-danger small">Required</div>}
          </div>

          {/* Broth */}
          <div className="mb-3">
            <div className="fw-semibold">Broth</div>
            <div className="mt-2 vstack gap-2">
              {["beef", "chicken", "vegetable"].map(opt => (
                <label key={opt} className="d-flex justify-content-between border rounded px-2 py-2">
                  <input
                    type="radio"
                    checked={broth === opt}
                    onChange={() => setBroth(opt as "beef" | "chicken" | "vegetable")}
                  /> {opt.charAt(0).toUpperCase() + opt.slice(1)} Broth
                </label>
              ))}
            </div>
            {broth === "" && <div className="text-danger small">Required</div>}
          </div>

          {/* Default toppings */}
          <div className="mb-3">
            <div className="fw-semibold">What it comes with</div>
            <div className="vstack">
              {defaultToppings.map(t => (
                <div key={t.key} className="d-flex justify-content-between border-bottom py-2">
                  <span>{t.label}</span>
                  <div>
                    {t.allowSub && (
                      <button
                        className="btn btn-sm btn-outline-secondary me-1"
                        onClick={() => toggleSub(t.key)}
                      >
                        Sub
                      </button>
                    )}
                    {t.allowRemove && (
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => toggleRemove(t.key)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Extra meats */}
          <div className="mb-3">
            <div className="fw-semibold">Extra Meat Options</div>
            <div className="vstack">
              {extraMeats.map(opt => {
                const q = extraMeatQty[opt.key] ?? 0;
                return (
                  <div key={opt.key} className="d-flex justify-content-between border-bottom py-2">
                    <div>{opt.label} <span className="text-muted small">${opt.price.toFixed(2)}</span></div>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-secondary" onClick={() => inc(extraMeatQty, setExtraMeatQty, opt.key, -1)}>-</button>
                      <button className="btn btn-light" disabled>{q}</button>
                      <button className="btn btn-outline-secondary" onClick={() => inc(extraMeatQty, setExtraMeatQty, opt.key, +1)}>+</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Extras */}
          <div className="mb-3">
            <div className="fw-semibold">Extras</div>
            <div className="vstack">
              {extras.map(opt => {
                const q = extraQty[opt.key] ?? 0;
                return (
                  <div key={opt.key} className="d-flex justify-content-between border-bottom py-2">
                    <div>{opt.label} <span className="text-muted small">${opt.price.toFixed(2)}</span></div>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-secondary" onClick={() => inc(extraQty, setExtraQty, opt.key, -1)}>-</button>
                      <button className="btn btn-light" disabled>{q}</button>
                      <button className="btn btn-outline-secondary" onClick={() => inc(extraQty, setExtraQty, opt.key, +1)}>+</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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
            <button className="btn btn-danger" disabled={!canSubmit} onClick={submit}>
              Add to cart • ${totalPrice.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}