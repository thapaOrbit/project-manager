import { useState, useCallback } from 'react';

interface ConfirmationDialogOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export const useConfirmDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<ConfirmationDialogOptions>({
    title: '',
    description: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'default',
  });
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void) | null>(null);

  const showConfirmation = useCallback((
    options: ConfirmationDialogOptions,
    onConfirm: () => void
  ) => {
    setDialogConfig(options);
    setOnConfirmCallback(() => onConfirm);
    setIsOpen(true);
  }, []);

  const hideConfirmation = useCallback(() => {
    setIsOpen(false);
    setOnConfirmCallback(null);
  }, []);

  const handleConfirm = useCallback(() => {
    if (onConfirmCallback) {
      onConfirmCallback();
    }
    hideConfirmation();
  }, [onConfirmCallback, hideConfirmation]);

  return {
    isOpen,
    title: dialogConfig.title,
    description: dialogConfig.description,
    confirmText: dialogConfig.confirmText,
    cancelText: dialogConfig.cancelText,
    variant: dialogConfig.variant,
    showConfirmation,
    hideConfirmation,
    handleConfirm,
  };
};