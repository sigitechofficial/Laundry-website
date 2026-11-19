"use client";

import { useId, useState } from "react";
import ProtoIcon from "../proto/ProtoIcon";
import { cx } from "../ds/cx";
import * as ui from "./ui";
import { groupServicePrefs } from "../../utilities/serviceChips";

/**
 * The services in the order with the customer's preferences, bags and items.
 * Used on Add services (removable, onRemove) and on Payment (read-only, Edit link).
 *
 * @param {Array} items              cart preferences (state.cart.preferences)
 * @param {number} [sharedBags]      bags for all services when one shared bag is used
 * @param {(serviceId) => void} [onRemove]  shows × on each service
 * @param {string} [editHref]        shows "Edit" in the heading (read-only use)
 * @param {React.ReactNode} [children]  footer (note, button)
 * @param {boolean} [collapsible]    the heading opens / closes the list (closed: one line of
 *                                   service names); starts closed
 */
export default function ServicesRequested({ items = [], sharedBags = 0, onRemove, editHref, collapsible = false, className, children }) {
  const listId = useId();
  const [open, setOpen] = useState(!collapsible);
  const names = items.map((i) => i?.serviceName).filter(Boolean).join(", ");
  const title = (
    <>
      <ProtoIcon name="basket" size={18} />
      <b className="whitespace-nowrap">Services requested</b>
      <span className={ui.REQ_COUNT}>{items.length}</span>
    </>
  );
  return (
    <div className={cx(ui.SUM, className)}>
      <div className={cx(ui.SUM_HEAD, "mb-0.5")}>
        {collapsible ? (
          <button
            type="button"
            className="-my-1 flex min-w-0 flex-1 cursor-pointer items-center gap-[9px] border-0 bg-transparent py-1 text-left text-inherit"
            aria-expanded={open}
            aria-controls={listId}
            onClick={() => setOpen((v) => !v)}
          >
            {title}
            <span className={cx("ml-auto flex text-[#8A93A6] transition-transform duration-200", open && "rotate-180")}>
              <ProtoIcon name="chevDown" size={18} />
            </span>
          </button>
        ) : (
          title
        )}
        {editHref ? (
          <a className={cx(ui.SUM_EDIT, collapsible ? "ml-1" : "ml-2")} href={editHref}>
            Edit
          </a>
        ) : null}
      </div>
      {collapsible && !open && names ? (
        <p className="m-0 mt-1.5 truncate text-[14px] text-jdc-muted">{names}</p>
      ) : null}
      {/* open / close by animating the row height (grid 0fr -> 1fr) */}
      <div
        id={listId}
        className={cx("grid transition-[grid-template-rows] duration-200 ease-out", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
        inert={!open || undefined}
      >
      <div className="min-h-0 overflow-hidden">
      <div className={ui.REQ_LIST}>
        {items.length > 0 ? (
          <>
            {items.map((item, idx) => (
              <div key={item?.serviceId ?? idx} className={ui.REQ_ITEM}>
                <div className={ui.REQ_HEAD}>
                  <span className={ui.REQ_NAME}>{item?.serviceName || "Selected"}</span>
                  {onRemove ? (
                    <button
                      type="button"
                      className={ui.REQ_X}
                      aria-label={`Remove ${item?.serviceName || "service"}`}
                      onClick={() => onRemove(item?.serviceId)}
                    >
                      ×
                    </button>
                  ) : null}
                </div>
                {(Array.isArray(item?.preferencesDisplay) && item.preferencesDisplay.length > 0) ||
                item?.additionalInstructions ? (
                  <div className={ui.REQ_PREFS}>
                    {groupServicePrefs(item?.preferencesDisplay).map((group, gIdx) => (
                      <div key={`${idx}-${gIdx}`} className={ui.REQ_GROUP}>
                        {group.title && (
                          <div className={ui.REQ_GROUP_HEAD}>
                            <span>{group.title}</span>
                            {group.detail && <span className={ui.REQ_GROUP_DETAIL}>{group.detail}</span>}
                          </div>
                        )}
                        {group.rows.length > 0 && (
                          <div className={ui.REQ_ROWS}>
                            {group.rows.map((row, rIdx) => (
                              <div key={rIdx} className={ui.REQ_ROW}>
                                <span className={ui.REQ_ROW_L}>{row.label}</span>
                                <span className={ui.REQ_ROW_V}>{row.value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {group.note && (
                          <p className={ui.REQ_GROUP_NOTE}>
                            <span className="text-jdc-muted">Note: </span>
                            {group.note}
                          </p>
                        )}
                      </div>
                    ))}
                    {item?.additionalInstructions && (
                      <div className={ui.REQ_PREF}>
                        <span className={ui.REQ_PREF_L}>Instructions</span>
                        <span className={ui.REQ_PREF_V}>{item?.additionalInstructions}</span>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ))}
            {sharedBags > 0 && (
              <div className={ui.REQ_ITEM}>
                <div className={cx(ui.REQ_PREFS, "mt-0")}>
                  <div className={ui.REQ_PREF}>
                    <span className={ui.REQ_PREF_L}>Number of bags (all services)</span>
                    <span className={ui.REQ_PREF_V}>{sharedBags}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className={ui.REQ_EMPTY}>No service selected yet. Pick one on the left to get started.</p>
        )}
      </div>
      </div>
      </div>
      {children}
    </div>
  );
}
