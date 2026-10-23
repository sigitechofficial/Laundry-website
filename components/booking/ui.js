/*
 * Shared Tailwind class strings for the booking flow
 * (place order, add services, checkout). These replace the scoped
 * prototype stylesheet (the design prototype; not shipped with the site).
 * Combine with cx() from components/ds/cx.js so later classes win.
 */

/* Page root: the prototype's body styles, plus browser defaults the
   prototype relied on (zero-specificity, so element classes still win). */
export const ROOT = [
  "m-0 overflow-x-clip bg-jdc-paper font-body text-[18px] leading-[1.6] text-jdc-text antialiased [-webkit-tap-highlight-color:transparent] [text-rendering:optimizeLegibility] max-[720px]:text-[17px]",
  "[:where(&)_img]:block [:where(&)_img]:max-w-full [:where(&)_a]:text-inherit [:where(&)_a]:no-underline [:where(&)_button]:cursor-pointer",
  "[:where(&)_h1]:my-[0.67em] [:where(&)_h1]:text-[2em] [:where(&)_h1]:font-bold",
  "[:where(&)_h2]:my-[0.83em] [:where(&)_h2]:text-[1.5em] [:where(&)_h2]:font-bold",
  "[:where(&)_h3]:my-[1em] [:where(&)_h3]:text-[1.17em] [:where(&)_h3]:font-bold",
  "[:where(&)_p]:my-[1em]",
  "[:where(&)_ul]:my-[1em] [:where(&)_ul]:list-disc [:where(&)_ul]:pl-10",
  "[:where(&)_button]:px-1.5 [:where(&)_button]:py-px",
  // (checkbox / radio default margins are set on those inputs directly)
  // ServiceBar toggles `has-svc-bar` on the root while the bottom bar shows
  "[&.has-svc-bar]:pb-[78px]",
].join(" ");

/* .btn: blue pill button */
export const BTN =
  "inline-flex h-14 cursor-pointer items-center justify-center gap-2.5 rounded-jdc-pill border-0 bg-jdc-blue px-[30px] py-0 text-[17px] font-bold text-white [transition:background_0.2s,transform_0.2s,box-shadow_0.2s] hover:bg-jdc-blue-dark disabled:cursor-not-allowed disabled:bg-[#B9C3D8]";

/* .btn--block */
export const BTN_BLOCK = "w-full";

/* .btn.btn--ghost */
export const BTN_GHOST = "border border-jdc-line bg-white text-jdc-navy hover:bg-jdc-paper";

/* ---------- Place order form (book.html .bk2-*) ----------
   [@media(min-width:901px)_and_(max-height:860px)]: = wide and short screens, [@media(min-width:901px)_and_(min-height:861px)_and_(max-height:960px)]: = wide, medium height
   (same queries as the prototype stylesheet). */

/* .bk2-g group (fieldset) and its legend; groups after the first get a top gap */
export const FIELDSET =
  "m-0 min-w-0 border-0 p-0 [fieldset+&]:mt-8 [@media(min-width:901px)_and_(min-height:861px)_and_(max-height:960px)]:[fieldset+&]:mt-[26px] [@media(min-width:901px)_and_(max-height:860px)]:[fieldset+&]:mt-4 max-[720px]:[fieldset+&]:mt-7";
export const LEGEND =
  "mx-0 mb-3 mt-0 p-0 font-display text-[17.5px] font-bold text-jdc-navy [@media(min-width:901px)_and_(max-height:860px)]:mb-1.5 [@media(min-width:901px)_and_(max-height:860px)]:text-[16.5px]";

/* .bk2-f field: label above control */
export const FIELD = "grid min-w-0 gap-2 [@media(min-width:901px)_and_(max-height:860px)]:gap-1.5";
export const FIELD_LABEL = "text-[13.5px] font-medium text-jdc-muted";
/* .bk2-c control box (icon + input + chevron); group/c drives the focus colour */
export const CTRL = "group/c relative min-w-0 flex-1";
/* .bk2-ic leading icon / .bk2-chev trailing chevron */
export const CTRL_ICON =
  "pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 text-[#8A93A6] transition-colors duration-200 group-focus-within/c:text-jdc-blue max-[720px]:left-3.5";
export const CTRL_CHEV =
  "pointer-events-none absolute right-3.5 top-1/2 flex -translate-y-1/2 text-[#8A93A6] transition-colors duration-200 group-focus-within/c:text-jdc-blue";
/* .bk2-in text input / select / slot button */
export const CTRL_INPUT =
  "h-[58px] w-full appearance-none text-ellipsis rounded-xl border border-jdc-line bg-white py-0 pl-[46px] pr-4 text-[16px] text-jdc-text [box-shadow:0_1px_3px_rgba(27,34,48,0.05)] [transition:border-color_0.2s,box-shadow_0.2s] placeholder:text-[#8A93A6] hover:border-[#C5CEDD] focus:border-jdc-blue focus:[box-shadow:0_0_0_4px_rgba(2,120,254,0.14)] focus:[outline:none] [@media(min-width:901px)_and_(min-height:861px)_and_(max-height:960px)]:h-14 [@media(min-width:901px)_and_(max-height:860px)]:h-12 max-[720px]:h-14 max-[720px]:pl-11";
/* .bk2-sel */
export const CTRL_SELECT = "cursor-pointer pr-[38px]";

/* ---------- Services + checkout page frame (services.html / checkout.html) ---------- */

/* .services-page section.pg.svc-hero > .wrap */
export const PAGE_BG = "bg-[#F7F7F8]";
export const HERO_SECTION = "pb-[88px] pt-6 max-[720px]:pb-[52px]";
// side margins follow the site gutter (96px desktop, 48px tablet, 20px phone) so they line up with the header
export const WRAP = "mx-auto max-w-[1560px] px-jdc-gutter min-[721px]:max-w-none";
/* .pg-head (+ --center) */
export const PG_HEAD = "mx-0 mb-11 mt-0 max-w-[640px] max-[720px]:mb-7";
export const PG_HEAD_CENTER = "mx-auto text-center";
/* .h2 big page heading; <em> keeps the heading colour */
export const H2 =
  "m-0 font-display text-[clamp(34px,4vw,54px)] font-bold leading-[1.05] tracking-[-0.03em] text-jdc-navy [&_em]:not-italic [&_em]:!text-inherit [&_span]:!text-inherit";
/* .bk2-back (also used in page heads, where it gets a bottom gap) */
/*
 * Back link + page heading. Tablet/desktop: "← Back" sits above the heading (prototype).
 * Phones (≤720px): it becomes a round ← button beside the heading to save height, like the app.
 * Use: <div className={TITLE_ROW}><a className={cx(BACK, BACK_ROUND)}>…<span className={BACK_LABEL}>Back</span></a><h1/></div>
 */
// items-start: with a two-line heading the arrow lines up with the first line
export const TITLE_ROW = "max-[720px]:flex max-[720px]:items-start max-[720px]:gap-3";
export const BACK_ROUND =
  "max-[720px]:m-0 max-[720px]:size-9 max-[720px]:flex-none max-[720px]:justify-center max-[720px]:gap-0 max-[720px]:rounded-full max-[720px]:border max-[720px]:border-jdc-line max-[720px]:bg-white max-[720px]:p-0 max-[720px]:hover:bg-jdc-paper";
// the word "Back" stays for screen readers on phones, where only the arrow shows
export const BACK_LABEL = "max-[720px]:sr-only";
export const BACK =
  "-ml-1 inline-flex items-center gap-1.5 rounded-[10px] pb-1.5 pl-1 pr-2.5 pt-1.5 text-[14.5px] font-semibold text-jdc-navy no-underline hover:bg-jdc-paper";
/* .svc-lead */
export const LEAD = "mx-0 mb-0 mt-3.5 max-w-[640px] text-[17px] leading-[1.6] text-jdc-muted";

/* "Good to know" FAQ (.pg--faq inside .services-page) */
export const FAQ_SECTION = "pb-16 pt-14";
export const FAQ_CARD = "mx-auto my-0 max-w-[600px]";
export const FAQ_LIST =
  "overflow-hidden rounded-[20px] border border-jdc-line bg-white px-[22px] [box-shadow:0_16px_40px_rgba(27,34,48,0.06)] max-[720px]:rounded-2xl max-[720px]:px-4";
export const FAQ_DETAILS = "group border-b border-jdc-line last:border-b-0";
export const FAQ_SUMMARY =
  "relative flex cursor-pointer list-none items-center justify-start gap-0 py-[13px] pl-0 pr-10 text-left font-body text-[15px] font-semibold text-jdc-navy [&::-webkit-details-marker]:hidden";
export const FAQ_ICON =
  "absolute right-0 top-1/2 flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[50%] border-0 bg-jdc-mist text-jdc-navy [transform:translateY(-50%)] [transition:transform_0.3s,background_0.3s,color_0.3s] group-open:bg-jdc-navy group-open:text-white group-open:[transform:translateY(-50%)_rotate(180deg)] max-[720px]:[&_svg]:h-3 max-[720px]:[&_svg]:w-3";
export const FAQ_ANSWER =
  "my-0 pb-[15px] pr-10 pt-0.5 text-left text-[15.5px] leading-[1.6] text-jdc-muted max-[720px]:text-[14.5px] max-[720px]:leading-[1.55]";

/* ---------- Pickup summary card (.svc-sum) ---------- */
export const SUM =
  "rounded-[20px] border-[1.5px] border-jdc-line bg-white px-[22px] pb-6 pt-[22px] [box-shadow:0_10px_30px_rgba(27,34,48,0.05)] max-[980px]:min-w-0 max-[980px]:max-w-full";
export const SUM_HEAD = "flex items-center gap-[9px] text-jdc-navy [&>b]:font-display [&>b]:text-[17px] [&>svg]:text-[#8A93A6]";
export const SUM_LEAD = "mx-0 mb-0 mt-3.5 text-[13px] text-jdc-muted";
export const SUM_BLOCK = "border-b border-jdc-line py-3.5 last:border-b-0 last:pb-0";
export const SUM_SUB = "mx-0 mb-2 mt-0 text-[12px] font-bold uppercase tracking-[0.04em] text-jdc-muted";
export const SUM_ROW =
  "mx-0 mb-0 mt-1.5 flex items-center gap-2 text-[14px] font-semibold text-jdc-navy [&_svg]:flex-none [&_svg]:text-[#8A93A6]";
export const SUM_ROW_BETWEEN = "justify-between gap-3";
export const SUM_ADDR = "flex min-w-0 items-center gap-2 [&>span]:overflow-hidden [&>span]:text-ellipsis [&>span]:whitespace-nowrap";
export const SUM_MUTED = "font-medium text-jdc-muted";
export const SUM_EDIT =
  "flex-none rounded-jdc-pill border-[1.5px] border-jdc-line px-3 py-1 text-[13px] font-bold text-jdc-navy hover:border-[#C5CEDD] hover:bg-jdc-paper";

/* ---------- Services requested card (.svc-req) ---------- */
export const REQ_COUNT =
  "ml-auto inline-flex h-6 min-w-[24px] items-center justify-center rounded-jdc-pill bg-jdc-mist px-2 text-[13px] font-extrabold text-jdc-navy";
export const REQ_LIST = "mx-0 mb-4 mt-3.5 flex flex-col gap-2";
export const REQ_EMPTY = "m-0 py-2.5 text-[14px] text-jdc-muted";
export const REQ_ITEM = "block rounded-[14px] border border-jdc-line bg-white px-3.5 py-3";
export const REQ_HEAD = "flex items-center justify-between gap-2.5";
export const REQ_NAME = "text-[14.5px] font-bold text-jdc-navy";
export const REQ_X =
  "h-[26px] w-[26px] flex-none cursor-pointer rounded-[50%] border-0 bg-white text-[18px] leading-none text-jdc-muted hover:bg-[#FDECEA] hover:text-[#C0392B]";
export const REQ_PREFS = "mt-2.5 flex flex-col gap-[7px]";
export const REQ_PREF = "rounded-[10px] border border-transparent bg-jdc-paper px-[11px] py-[7px]";
export const REQ_PREF_L = "block text-[11px] font-semibold leading-[1.35] text-jdc-muted";
export const REQ_PREF_V = "mt-px block text-[13px] font-bold leading-[1.35] text-jdc-navy [word-break:break-word]";
// One chosen option with its own settings (wash type -> temperature, detergent, note)
export const REQ_GROUP = "rounded-[10px] bg-jdc-paper px-[11px] py-2";
export const REQ_GROUP_HEAD = "flex items-baseline justify-between gap-2.5 text-[13.5px] font-bold leading-[1.35] text-jdc-navy";
export const REQ_GROUP_DETAIL = "flex-none text-[12px] font-semibold text-jdc-muted";
export const REQ_ROWS = "mt-1.5 flex flex-col gap-1 border-t border-jdc-line pt-1.5 first:mt-0 first:border-t-0 first:pt-0";
export const REQ_ROW = "flex items-baseline justify-between gap-3 text-[12.5px] leading-[1.4]";
export const REQ_ROW_L = "flex-none text-jdc-muted";
export const REQ_ROW_V = "text-right font-semibold text-jdc-navy [word-break:break-word]";
export const REQ_GROUP_NOTE = "mt-1.5 border-t border-jdc-line pt-1.5 text-[12.5px] leading-[1.45] text-jdc-navy [word-break:break-word]";
export const REQ_NOTE =
  "mx-0 mb-3.5 mt-0 flex items-start gap-2 text-[12.5px] leading-[1.5] text-jdc-muted [&>svg]:mt-px [&>svg]:flex-none [&>svg]:text-[#1A7F43]";

/* ---------- Modal shell (.svc-modal), used by preferences + checkout popups ---------- */
export const MODAL = "fixed inset-0 z-[100] flex items-center justify-center p-6 max-[720px]:items-end max-[720px]:p-0";
export const MODAL_OVERLAY = "absolute inset-0 bg-[rgba(27,34,48,0.5)] backdrop-blur-[2px]";
export const MODAL_PANEL =
  "relative flex max-h-[calc(100vh-48px)] w-full max-w-[560px] flex-col overflow-hidden rounded-[22px] bg-white [box-shadow:0_40px_90px_rgba(15,20,28,0.4)] max-[720px]:max-h-[92vh] max-[720px]:max-w-none max-[720px]:rounded-[22px_22px_0_0]";
export const MODAL_PANEL_SM = "max-w-[420px] max-[720px]:max-w-[420px]";
export const MODAL_HEAD =
  "flex items-center justify-between gap-4 border-b border-jdc-line px-6 py-5 [&>b]:font-display [&>b]:text-[20px] [&>b]:text-jdc-navy";
export const MODAL_X = "flex-none cursor-pointer border-0 bg-none text-[15px] font-semibold text-jdc-muted hover:text-jdc-navy";
export const MODAL_BODY = "grid gap-[22px] overflow-auto px-6 py-[22px]";
export const MODAL_FOOT = "border-t border-jdc-line px-6 py-4";

/* ---------- Service preferences (inside the modal) ---------- */
export const SEC_H3 = "mx-0 mb-3 mt-0 font-display text-[16px] text-jdc-navy";
export const OPT =
  "mt-2.5 overflow-hidden rounded-[14px] border-[1.5px] border-jdc-line transition-[border-color] duration-200 first-of-type:mt-0 focus-within:border-[#C4D3EA] hover:border-[#C4D3EA]";
export const OPT_ON = "border-jdc-blue focus-within:border-jdc-blue hover:border-jdc-blue";
export const OPT_ROW = "m-0 flex cursor-pointer items-center gap-3 px-4 py-3.5";
export const CHECKBOX = "mb-[3px] ml-1 mr-[3px] mt-[3px] h-5 w-5 flex-none accent-jdc-blue";
export const OPT_MAIN =
  "flex-1 [&>b]:block [&>b]:text-[15px] [&>b]:font-bold [&>b]:text-jdc-navy [&>small]:mt-0.5 [&>small]:block [&>small]:text-[13px] [&>small]:text-jdc-muted";
export const OPT_EXP = "flex flex-none cursor-pointer border-0 bg-none p-1 text-jdc-muted transition-transform duration-200";
export const OPT_MORE = "px-[18px] pb-[18px] pt-0.5 text-[13.5px] text-jdc-muted [&_p]:m-0";
export const SUB = "block !border-0 p-0 [div+&]:mt-4";
export const SUB_LBL = "m-0 text-[12.5px] font-semibold uppercase tracking-[0.06em] text-jdc-muted";
export const PILLS = "flex flex-wrap gap-2";
export const PILL =
  "h-10 cursor-pointer rounded-jdc-pill border border-jdc-line bg-white px-4 py-0 text-[14.5px] font-medium text-jdc-text [transition:background_0.15s,border-color_0.15s,color_0.15s] hover:border-[#C5CEDD]";
export const PILL_ON = "border-jdc-blue bg-jdc-blue font-semibold text-white hover:border-jdc-blue";
export const SUB_ADD =
  "mt-4 h-9 cursor-pointer rounded-jdc-pill border border-jdc-line bg-white px-3.5 py-0 text-[13.5px] font-semibold text-jdc-muted hover:border-[#C5CEDD] hover:text-jdc-navy";
export const SUB_NOTE = "mt-4";
export const SUB_NOTE_H = "mb-2 flex items-center gap-2 [&>b]:text-[14.5px] [&>b]:text-jdc-navy";
export const SUB_TAG = "rounded-jdc-pill bg-jdc-mist px-[9px] py-[3px] text-[12px] font-semibold text-jdc-muted";
export const SUB_HIDE = "ml-auto cursor-pointer border-0 bg-none text-[13.5px] text-jdc-muted";
export const SUB_TA =
  "min-h-[96px] w-full resize-y rounded-xl border border-jdc-line bg-white px-3.5 py-3 text-[15px] text-jdc-text focus:border-jdc-blue focus:[box-shadow:0_0_0_3px_rgba(2,120,254,0.14)] focus:[outline:none]";
export const QTY = "rounded-2xl bg-jdc-blue-tint px-[18px] pb-5 pt-[18px]";
export const QTY_H = "block font-display text-[15.5px] text-jdc-navy [&>span]:font-medium [&>span]:text-jdc-muted";
export const QTY_HINT = "mx-0 mb-3.5 mt-1 text-[13.5px] text-jdc-muted";
export const QTY_Q = "mx-0 mb-2.5 mt-0 text-[14px] font-bold text-jdc-navy";
export const PACK =
  "mb-2.5 flex cursor-pointer items-start gap-3 rounded-xl border-[1.5px] border-jdc-line bg-white px-[15px] py-[13px] [&_b]:block [&_b]:text-[14.5px] [&_b]:text-jdc-navy [&_small]:mt-0.5 [&_small]:block [&_small]:text-[13px] [&_small]:text-jdc-muted";
export const PACK_ON = "border-jdc-blue [box-shadow:0_0_0_2px_rgba(2,120,254,0.15)]";
export const RADIO = "mb-0 ml-[5px] mr-[3px] mt-0.5 h-[18px] w-[18px] flex-none accent-jdc-blue";
export const STEP =
  "mt-2.5 flex min-h-[64px] items-center justify-between gap-3 rounded-xl border border-jdc-line bg-white py-2.5 pl-4 pr-3";
export const STEP_LBL = "flex items-center gap-2.5 text-[14.5px] font-bold text-jdc-navy [&>b]:text-[15px]";
export const STEP_IC = "flex text-[#8A93A6]";
export const STEPPER =
  "m-0 inline-flex flex-none flex-nowrap items-center gap-0 overflow-hidden rounded-jdc-pill border border-jdc-line bg-white";
export const STEPPER_BTN =
  "flex h-10 w-10 cursor-pointer items-center justify-center rounded-[50%] border-0 bg-white text-[20px] leading-none text-jdc-navy hover:bg-jdc-mist";
export const STEPPER_VAL = "h-10 w-9 border-0 bg-white p-0 text-center text-[16px] font-bold text-jdc-navy";
export const TA =
  "min-h-[90px] w-full resize-y rounded-xl border-[1.5px] border-jdc-line bg-[#FAFBFE] px-3.5 py-3 text-[15px] text-jdc-text focus:border-jdc-blue focus:bg-white focus:[outline:none]";
export const MODAL_RM =
  "h-[52px] flex-none cursor-pointer rounded-jdc-pill border border-jdc-line bg-white px-5 py-0 text-[15px] font-semibold text-[#C0392B] hover:border-[#F1C4BE] hover:bg-[#FDF3F2]";

/* .svc-bar (fixed bottom bar) */
// z-40: under the header (z-50) and under menus / drawers, which open on top of it
export const BAR = "fixed inset-x-0 bottom-0 z-40border-t border-jdc-line bg-white/[0.96] pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur-[12px]";
export const BAR_IN =
  "mx-auto flex max-w-[1560px] items-center justify-between gap-4 px-5 min-[721px]:max-w-none min-[721px]:px-24";
export const BAR_TXT =
  "flex items-center gap-2.5 text-[15.5px] font-semibold text-jdc-navy max-[720px]:text-[14.5px] [&>b]:inline-flex [&>b]:h-7 [&>b]:min-w-[28px] [&>b]:items-center [&>b]:justify-center [&>b]:rounded-jdc-pill [&>b]:bg-jdc-navy [&>b]:px-2 [&>b]:text-[14px] [&>b]:text-white";
export const BAR_TXT_TOTAL =
  "flex-col items-start gap-0 leading-[1.2] [&>small]:text-[12.5px] [&>small]:font-medium [&>small]:text-jdc-muted [&>strong]:font-display [&>strong]:text-[20px] [&>strong]:text-jdc-navy";
export const BAR_GO =
  "h-[52px] rounded-xl px-[34px] max-[720px]:h-[50px] max-[720px]:max-w-[210px] max-[720px]:flex-1 max-[720px]:justify-center max-[720px]:px-[22px]";
