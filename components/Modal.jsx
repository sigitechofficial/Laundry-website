"use client";

import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { IoClose } from "react-icons/io5";
import { FaArrowLeftLong } from "react-icons/fa6";

/*
 * HeroUI popup used by the older account screens (order history, delete account,
 * turnaround notices). It follows the same rules as components/ds/Dialog so both kinds
 * look and move alike:
 *  - plain dimmed backdrop (bg-jdc-scrim), never blurred: the blur builds up over
 *    several frames and made the page flicker;
 *  - centred with a short rise-and-fade; at 720px and below a bottom sheet that
 *    slides up (same breakpoint as Dialog, not HeroUI's own 640px);
 *  - HeroUI / react-aria handle scroll lock, Escape, focus trap and focus return.
 * Callers may pass `classNames` / `motionProps`; they are merged over these defaults.
 */
const PHONE = "(max-width: 720px)";

function useIsPhone() {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(PHONE);
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return phone;
}

const POP = {
  initial: { y: 12, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.18, ease: "easeOut" } },
  exit: { y: 12, opacity: 0, transition: { duration: 0.14, ease: "easeIn" } },
};
const SHEET = {
  initial: { y: "100%" },
  animate: { y: 0, transition: { duration: 0.28, ease: [0.2, 0.8, 0.2, 1] } },
  exit: { y: "100%", transition: { duration: 0.2, ease: "easeIn" } },
};
const ICON_BTN =
  "absolute top-3 z-20 flex size-10 cursor-pointer items-center justify-center rounded-full border-0 bg-theme-gray-17 text-black duration-150 hover:bg-theme-gray-16";

const ReusableModal = ({
  isOpen,
  onOpenChange,
  children,
  showHeader = false,
  headerTitle = "",
  ariaLabel,
  onBack = null,
  onClose = null,
  showFooter = false,
  size = "md",
  placement = "auto",
  backdrop = "opaque",
  scrollBehavior = "inside",
  modalScroll = 0,
  className = "",
  classNames,
  motionProps,
  isDismissable = true,
  footerContent,
}) => {
  const phone = useIsPhone();

  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  const sheet = phone && (placement === "auto" || placement === "bottom");
  const motion = motionProps || (sheet ? SHEET : POP);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size={size}
      placement={placement === "auto" ? (phone ? "bottom" : "center") : placement}
      backdrop={backdrop === "transparent" ? "transparent" : "opaque"}
      scrollBehavior={scrollBehavior}
      className={className}
      classNames={{
        closeButton: "hidden",
        backdrop: "bg-jdc-scrim",
        ...classNames,
        base: [
          "max-h-[100vh] !my-0 mx-0",
          sheet && "max-h-[92vh] !max-w-none !rounded-b-none",
          classNames?.base,
        ]
          .filter(Boolean)
          .join(" "),
      }}
      isDismissable={isDismissable}
      motionProps={motion}
    >
      <ModalContent className="overflow-hidden bg-white" aria-label={showHeader ? undefined : ariaLabel || headerTitle || undefined}>
        {() => (
          <>
            {showHeader && (
              <ModalHeader
                className={`absolute transition-[transform,opacity] duration-300 ease-in-out font-sf ${
                  modalScroll
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-full opacity-0"
                } top-0 left-0 z-20 bg-white w-full border-b border-jdc-line`}
              >
                <div className="flex justify-center items-center w-full h-7">
                  <h2
                    className={`font-youth font-bold sm:text-[22px] text-center transition-[transform,opacity] duration-500 ease-in-out ${
                      modalScroll
                        ? "translate-y-0 opacity-100 delay-500"
                        : "-translate-y-4 opacity-0 delay-0"
                    }`}
                  >
                    {headerTitle}
                  </h2>
                </div>
              </ModalHeader>
            )}

            <ModalBody className="p-0 overflow-hidden">
              {onBack && (
                <button type="button" aria-label="Back" onClick={onBack} className={`${ICON_BTN} left-3`}>
                  <FaArrowLeftLong size={20} />
                </button>
              )}

              {onClose && (
                <button type="button" aria-label="Close" onClick={handleClose} className={`${ICON_BTN} right-3`}>
                  <IoClose size={30} />
                </button>
              )}
              {children}
            </ModalBody>

            {showFooter && (
              <ModalFooter className="p-0">{footerContent}</ModalFooter>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
export default ReusableModal;

// Usage Examples:

// Basic modal with just content
/*
<ReusableModal isOpen={isOpen} onOpenChange={onOpenChange}>
  <p>Your modal content here</p>
</ReusableModal>
*/

// Modal with header and close functionality
/*
<ReusableModal
  isOpen={isOpen}
  onOpenChange={onOpenChange}
  showHeader={true}
  headerTitle="My Modal Title"
  onClose={() => console.log('Modal closed')}
>
  <p>Your modal content here</p>
</ReusableModal>
*/

// Modal with header (back + close buttons) and footer
/*
<ReusableModal
  isOpen={isOpen}
  onOpenChange={onOpenChange}
  showHeader={true}
  headerTitle="Settings"
  onBack={() => console.log('Back pressed')}
  onClose={() => console.log('Close pressed')}
  showFooter={true}
  footerButtonText="Delete"
  onFooterAction={() => console.log('Delete action')}
>
  <p>Your modal content here</p>
</ReusableModal>
*/

// Full featured modal
/*
<ReusableModal
  isOpen={isOpen}
  onOpenChange={onOpenChange}
  showHeader={true}
  headerTitle="Confirm Action"
  onBack={() => goToPreviousStep()}
  onClose={() => closeModal()}
  showFooter={true}
  footerButtonText="Confirm Delete"
  onFooterAction={() => handleDelete()}
  size="lg"
  className="custom-modal-class"
>
  <div>
    <p>Are you sure you want to delete this item?</p>
    <p>This action cannot be undone.</p>
  </div>
</ReusableModal>
*/
