import { useEffect, useReducer, useState } from "react";
import { IoClose } from "react-icons/io5";
import "./addItemSidebar.css";
import {
  insertMenuItem,
  insertMenuItemModifierGroups,
  updateMenuItem,
  selectMenuItemModifierGroupIds,
  replaceMenuItemModifierGroups,
} from "../../../../../services/MenuItems";

type ModifierGroup = { modifier_group_id: string; name: string };
type MenuItem = {
  item_id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string;
};

interface Props {
  onClose: () => void;
  categoryId: string | null;
  organizationId: string | null;
  modifierGroups: ModifierGroup[];
  onSaved?: () => void;
  existingItem?: MenuItem | null;
}

type Values = {
  name: string;
  description: string;
  price: string;
  file: File | null;
  modifierGroupIds: string[];
};

type State = { values: Values; initial: Values };

const emptyValues: Values = {
  name: "",
  description: "",
  price: "",
  file: null,
  modifierGroupIds: [],
};

type Action =
  | { type: "change"; name: "name"; value: string }
  | { type: "change"; name: "description"; value: string }
  | { type: "change"; name: "price"; value: string }
  | { type: "change"; name: "file"; value: File | null }
  | { type: "setModifiers"; ids: string[] }
  | { type: "toggleModifier"; id: string }
  | { type: "setAll"; values: Values }
  | { type: "resetToInitial" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "change":
      return { ...state, values: { ...state.values, [action.name]: action.value } };
    case "setModifiers":
      return { ...state, values: { ...state.values, modifierGroupIds: action.ids } };
    case "toggleModifier": {
      const has = state.values.modifierGroupIds.includes(action.id);
      const next = has
        ? state.values.modifierGroupIds.filter((x) => x !== action.id)
        : [...state.values.modifierGroupIds, action.id];
      return { ...state, values: { ...state.values, modifierGroupIds: next } };
    }
    case "setAll":
      return { values: action.values, initial: action.values };
    case "resetToInitial":
      return { ...state, values: state.initial };
    default:
      return state;
  }
}

function AddItemSidebar({
  onClose,
  categoryId,
  organizationId,
  modifierGroups,
  onSaved,
  existingItem,
}: Props) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [state, dispatch] = useReducer(reducer, { values: emptyValues, initial: emptyValues });
  const { name, description, price, file, modifierGroupIds } = state.values;

  useEffect(() => {
    if (existingItem) {
      const base: Values = {
        name: existingItem.name ?? "",
        description: existingItem.description ?? "",
        price: String(existingItem.price ?? ""),
        file: null,
        modifierGroupIds: [],
      };
      dispatch({ type: "setAll", values: base });

      (async () => {
        const { data, error } = await selectMenuItemModifierGroupIds(existingItem.item_id);
        if (!error) dispatch({ type: "setModifiers", ids: data });
      })();
    } else {
      dispatch({ type: "setAll", values: emptyValues });
    }
  }, [existingItem]);

  const onText =
    (field: "name" | "description") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      dispatch({ type: "change", name: field, value: e.target.value });

  const onPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(v) || v === "") {
      dispatch({ type: "change", name: "price", value: v });
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    dispatch({ type: "change", name: "file", value: f });
  };

  const toggleModifier = (id: string) => dispatch({ type: "toggleModifier", id });

  const handleSave = async () => {
    if (!organizationId || !categoryId || !name.trim() || price.trim() === "") return;
    const priceNum = Number.parseFloat(price);
    if (Number.isNaN(priceNum)) return;

    if (existingItem) {
      const { error: updErr } = await updateMenuItem(existingItem.item_id, {
        name: name.trim(),
        description: description.trim() || null,
        price: priceNum,
      });
      if (updErr) return;
      const { error: repErr } = await replaceMenuItemModifierGroups(
        existingItem.item_id,
        modifierGroupIds
      );
      if (repErr) return;
      // TODO: upload image file later
      onSaved?.();
      onClose();
      return;
    }

    const { data: item, error: itemErr } = await insertMenuItem(
      name.trim(),
      description.trim() || null,
      priceNum,
      organizationId,
      categoryId
    );
    if (itemErr || !item) return;

    // TODO: upload image file later

    const { error: joinErr } = await insertMenuItemModifierGroups(
      item.item_id,
      modifierGroupIds
    );
    if (joinErr) {}

    dispatch({ type: "resetToInitial" });
    onSaved?.();
    onClose();
  };

  const selectedCount = modifierGroupIds.length;
  const dropdownLabel = selectedCount === 0 ? "Select modifier groups" : `${selectedCount} selected`;
  const priceValid = price === "" ? false : /^\d+(\.\d{1,2})?$/.test(price);

  return (
    <div className="overlayBackground">
      <div className="overlayContainer d-flex flex-column">
        <div className="flex-grow-1 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="mb-0">{existingItem ? "Edit item" : "Add item"}</h1>
            <button className="btn border-0 bg-transparent" type="button" id="ButtonClose" onClick={onClose}>
              <IoClose size={20} />
            </button>
          </div>

          <div className="flex-grow-1 overflow-auto">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-3">
                <p className="mb-1 fw-semibold">Name</p>
                <input placeholder="Name" type="text" className="form-control" value={name} onChange={onText("name")} />
              </div>

              <div className="mb-3">
                <p className="mb-1 fw-semibold">Description</p>
                <textarea className="form-control" placeholder="Description" rows={3} value={description} onChange={onText("description")} />
              </div>

              <div className="mb-3">
                <p className="mb-1 fw-semibold">Price</p>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="^\d+(\.\d{0,2})?$"
                  className="form-control"
                  placeholder="0.00"
                  value={price}
                  onChange={onPrice}
                />
              </div>

              <div className="mb-3">
                <p className="mb-1 fw-semibold">Image</p>
                <input type="file" accept="image/*" onChange={onFile} />
              </div>

              <div className="mb-3">
                <p className="mb-1 fw-semibold">Modifier Groups</p>

                <div className="dropdown">
                  <button
                    className="custom-dropdown-style btn dropdown-toggle"
                    type="button"
                    id="dropdownMenuButton"
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                  >
                    {dropdownLabel}
                  </button>

                  <div
                    className={`dropdown-menu ${isDropdownOpen ? "show" : ""}`}
                    aria-labelledby="dropdownMenuButton"
                    style={{ minWidth: 260, maxHeight: 280, overflowY: "auto" }}
                  >
                    {modifierGroups.length === 0 && <span className="dropdown-item-text text-muted">No modifier groups found</span>}

                    {modifierGroups.map((g) => {
                      const id = g.modifier_group_id;
                      const checked = modifierGroupIds.includes(id);
                      return (
                        <label
                          key={id}
                          className="dropdown-item d-flex align-items-center gap-2"
                          style={{ cursor: "pointer" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input type="checkbox" className="form-check-input" checked={checked} onChange={() => toggleModifier(id)} />
                          <span>{g.name}</span>
                        </label>
                      );
                    })}

                    {modifierGroups.length > 0 && <div className="dropdown-divider" />}
                    <button type="button" className="dropdown-item text-center" onClick={() => setIsDropdownOpen(false)}>
                      Done
                    </button>
                  </div>
                </div>

                {modifierGroupIds.length > 0 && (
                  <div className="mt-2 d-flex flex-wrap gap-2">
                    {modifierGroupIds.map((id) => {
                      const mgName = modifierGroups.find((g) => g.modifier_group_id === id)?.name ?? id;
                      return (
                        <span key={id} className="badge text-bg-light">
                          {mgName}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="pt-3 border-top d-flex gap-2 justify-content-end">
          <button
            className="btn border-0 fw-semibold"
            onClick={() => {
              dispatch({ type: "resetToInitial" });
              onClose();
            }}
          >
            Cancel
          </button>
          <button
            className="btn btn-danger fw-semibold"
            onClick={handleSave}
            disabled={!name.trim() || !organizationId || !categoryId || !priceValid}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddItemSidebar;
