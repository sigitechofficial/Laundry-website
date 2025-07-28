import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { IoClose } from "react-icons/io5";
import { FaArrowLeftLong } from "react-icons/fa6";

const ReusableModal = ({
  isOpen,
  onOpenChange,
  children,
  showHeader = false,
  headerTitle = "",
  onBack = null,
  onClose = null,
  showFooter = false,
  footerButtonText = "Close",
  onFooterAction = null,
  size = "md",
  placement = "auto",
  backdrop = "opaque",
  scrollBehavior = "inside",
  modalScroll = 0,
  className = "",
  isDismissable = true,
  footerContent,
}) => {
  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  const handleBack = () => {
    if (onBack) onBack();
  };

  const handleFooterAction = () => {
    if (onFooterAction) onFooterAction();
    else handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size={size}
      placement={placement}
      backdrop={backdrop}
      scrollBehavior={scrollBehavior}
      className={className}
      classNames={{
        closeButton: "hidden",
        base: "max-h-[100vh] !my-0 mx-0 max-sm:rounded-b-none",
      }}
      isDismissable={isDismissable}
      motionProps={{
        initial: { y: 50, opacity: 0 },
        animate: {
          y: 0,
          opacity: 1,
          transition: { duration: 0.3, ease: "easeOut" },
        },
        exit: {
          y: 50,
          opacity: 0,
          transition: { duration: 0.2, ease: "easeIn" },
        },
      }}
    >
      <ModalContent className="overflow-hidden">
        {(onCloseModal) => (
          <>
            {showHeader && (
              <ModalHeader
                className={`absolute transition-all duration-300 ease-in-out font-sf ${
                  modalScroll
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-full opacity-0"
                } top-0 left-0 z-20 bg-white w-full shadow-md`}
              >
                <div className="flex justify-center items-center w-full h-7">
                  <h2
                    className={`font-youth font-bold sm:text-[22px] text-center transition-all duration-500 ease-in-out 
        ${
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
                <div
                  onClick={handleBack}
                  className="bg-theme-gray-17 hover:bg-theme-gray-16 rounded-full cursor-pointer duration-150 size-10 absolute top-3 left-3 z-20 flex justify-center items-center text-2xl text-black font-black"
                >
                  <FaArrowLeftLong size={20} />
                </div>
              )}

              {onClose && (
                <div
                  onClick={handleClose}
                  className="bg-theme-gray-17 hover:bg-theme-gray-16 rounded-full cursor-pointer duration-150 size-10 absolute top-3 right-3 z-20 flex justify-center items-center text-2xl text-black font-black"
                >
                  <IoClose size={30} />
                </div>
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
  backdrop="blur"
  className="custom-modal-class"
>
  <div>
    <p>Are you sure you want to delete this item?</p>
    <p>This action cannot be undone.</p>
  </div>
</ReusableModal>
*/
