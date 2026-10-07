import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Icon } from '../icons/Icons';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="460px"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: confirmVariant === 'danger' ? 'rgba(186, 45, 74, 0.2)' : 'rgba(212, 175, 55, 0.2)',
            color: confirmVariant === 'danger' ? '#f06a88' : 'var(--color-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name="alert-circle" size={24} />
        </div>
        <div>
          <p className="text-secondary" style={{ marginTop: 4, lineHeight: 1.6 }}>
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
};
