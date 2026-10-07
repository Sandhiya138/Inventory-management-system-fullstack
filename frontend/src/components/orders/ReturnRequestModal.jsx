import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { orderService } from '../../services/orderService';
import { useToast } from '../../hooks/useToast';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const ReturnRequestModal = ({ isOpen, onClose, order, onSuccess }) => {
  const { showSuccess, showError } = useToast();
  const [reasonCategory, setReasonCategory] = useState('Damaged on arrival');
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalReason = customReason.trim()
      ? `${reasonCategory}: ${customReason.trim()}`
      : reasonCategory;

    setSubmitting(true);
    try {
      await orderService.createReturn({
        orderId: order.id,
        reason: finalReason,
      });
      showSuccess('Return request submitted successfully. Staff will review it shortly.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showError(err.message || 'Failed to submit return request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Request Return for Order #${order.id}`}
      size="medium"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={submitting}
          >
            Submit Return Request
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{
          padding: '0.875rem',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Order Date:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formatDate(order.createdAt)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Order Total:</span>
            <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{formatCurrency(order.totalAmount || order.total || 0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Items Count:</span>
            <span style={{ color: 'var(--text-primary)' }}>{order.orderItems?.length || 0} item(s)</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="return-reason-select">Primary Reason</label>
          <select
            id="return-reason-select"
            className="form-control"
            value={reasonCategory}
            onChange={(e) => setReasonCategory(e.target.value)}
          >
            <option value="Damaged on arrival">Damaged on arrival</option>
            <option value="Defective or not working">Defective or not working</option>
            <option value="Incorrect item received">Incorrect item received</option>
            <option value="Item not as described">Item not as described</option>
            <option value="Ordered by mistake">Ordered by mistake</option>
            <option value="Other reason">Other reason</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="return-custom-notes">Additional Details / Notes</label>
          <textarea
            id="return-custom-notes"
            className="form-control"
            rows="3"
            placeholder="Please describe the issue in detail..."
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
          />
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
          Once submitted, our warehouse staff will review your request. You can check the approval status under the Returns tab.
        </p>
      </form>
    </Modal>
  );
};
