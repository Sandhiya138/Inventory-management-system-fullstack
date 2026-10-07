import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatDateTime, formatDate } from '../../utils/formatters';

export const ReturnsPage = () => {
  const { isStaff, isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [returns, setReturns] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Process Return Modal (Staff/Admin)
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [processStatus, setProcessStatus] = useState('APPROVED');
  const [staffNotes, setStaffNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getReturns();
      setReturns(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err.message || 'Unable to load return requests from backend server.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProcess = (ret) => {
    setSelectedReturn(ret);
    setProcessStatus(ret.status === 'REQUESTED' ? 'APPROVED' : ret.status);
    setStaffNotes(ret.staffNotes || '');
    setProcessModalOpen(true);
  };

  const handleProcessSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReturn) return;
    setProcessing(true);
    try {
      await orderService.processReturn(selectedReturn.id, processStatus, staffNotes);
      showSuccess(`Return #${selectedReturn.id} processed as ${processStatus}`);
      setProcessModalOpen(false);
      loadReturns();
    } catch (err) {
      showError(err.message || 'Failed to process return request');
    } finally {
      setProcessing(false);
    }
  };

  const filteredReturns = useMemo(() => {
    return returns.filter((r) => {
      const matchesStatus = !statusFilter || r.status === statusFilter;
      const matchesSearch =
        !searchTerm ||
        String(r.id).includes(searchTerm) ||
        String(r.order?.id).includes(searchTerm) ||
        r.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.order?.viewer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [returns, statusFilter, searchTerm]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'REQUESTED':
        return <span className="badge badge-warning">REQUESTED</span>;
      case 'APPROVED':
        return <span className="badge badge-info">APPROVED</span>;
      case 'COMPLETED':
        return <span className="badge badge-success">COMPLETED</span>;
      case 'REJECTED':
        return <span className="badge badge-danger">REJECTED</span>;
      default:
        return <span className="badge badge-default">{status}</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-main">
            Return Merchandise <span className="text-gold">Authorizations (RMA)</span>
          </h1>
          <p className="text-muted text-sm mt-1">
            Review customer claims, authorize product returns, and process restocking workflows.
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid gap-3" style={{ gridTemplateColumns: '2fr 1fr' }}>
          <Input
            placeholder="Search by return ID, order #, reason, or requester..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="search"
          />

          <Select
            placeholder="All Return Statuses"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'REQUESTED', label: 'Requested (Pending Staff Review)' },
              { value: 'APPROVED', label: 'Approved (Awaiting Return Shipment)' },
              { value: 'COMPLETED', label: 'Completed (Stock Restocked)' },
              { value: 'REJECTED', label: 'Rejected' },
            ]}
          />
        </div>
      </Card>

      {/* Returns Table */}
      {error ? (
        <ErrorState
          title="Unable to load returns"
          message={error}
          onRetry={loadReturns}
        />
      ) : (
        <Card p={0}>
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton variant="table" count={4} />
            </div>
          ) : filteredReturns.length === 0 ? (
          <EmptyState
            title="No Returns Found"
            message="No return requests match your current criteria."
            icon="returns"
          />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>RMA #</th>
                  <th>Order Reference</th>
                  <th>Requester</th>
                  <th>Reason</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th>Requested Date</th>
                  <th>Processed Date</th>
                  {(isStaff || isAdmin) && <th style={{ textAlign: 'right' }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {filteredReturns.map((ret) => (
                  <tr key={ret.id}>
                    <td>
                      <span className="font-bold text-gold">RMA-{ret.id}</span>
                    </td>
                    <td>
                      <span className="font-semibold text-main block">
                        Order #{ret.order?.id}
                      </span>
                      <span className="text-xs text-muted">
                        Total: ${ret.order?.totalAmount || 0}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-main block">
                        {ret.order?.viewer?.fullName || 'Customer'}
                      </span>
                      {ret.order?.viewer?.email && (
                        <span className="text-xs text-muted">{ret.order.viewer.email}</span>
                      )}
                    </td>
                    <td>
                      <div className="text-sm text-secondary font-medium" style={{ maxWidth: '280px' }}>
                        {ret.reason}
                      </div>
                      {ret.staffNotes && (
                        <span className="text-xs text-gold block mt-0.5">
                          Staff Note: {ret.staffNotes}
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {getStatusBadge(ret.status)}
                    </td>
                    <td className="text-xs text-muted">
                      {formatDate(ret.createdAt || ret.requestedDate)}
                    </td>
                    <td className="text-xs text-muted">
                      {ret.processedDate ? formatDateTime(ret.processedDate) : 'Pending'}
                    </td>
                    {(isStaff || isAdmin) && (
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenProcess(ret)}
                        >
                          Process
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </Card>
      )}

      {/* Staff Process Return Modal */}
      {processModalOpen && selectedReturn && (
        <Modal
          isOpen={processModalOpen}
          onClose={() => setProcessModalOpen(false)}
          title={`Process Return RMA-${selectedReturn.id}`}
          subtitle={`Order #${selectedReturn.order?.id} • Requested by ${selectedReturn.order?.viewer?.fullName || 'Viewer'}`}
          footer={
            <>
              <Button
                variant="ghost"
                onClick={() => setProcessModalOpen(false)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleProcessSubmit}
                loading={processing}
              >
                Save Decision
              </Button>
            </>
          }
        >
          <form onSubmit={handleProcessSubmit} className="flex flex-col gap-4">
            <div className="p-3 bg-surface-1 rounded-md border border-subtle">
              <span className="text-xs text-muted block mb-1">Customer Stated Reason:</span>
              <p className="text-sm font-semibold text-main m-0 italic">"{selectedReturn.reason}"</p>
            </div>

            <Select
              label="Evaluation Decision"
              value={processStatus}
              onChange={(e) => setProcessStatus(e.target.value)}
              options={[
                { value: 'APPROVED', label: 'APPROVE - Accept Return & Send Authorization' },
                { value: 'COMPLETED', label: 'COMPLETE - Received & Restocked to Inventory' },
                { value: 'REJECTED', label: 'REJECT - Decline Return Claim' },
              ]}
              required
            />

            <div className="form-group">
              <label className="form-label">Staff Notes / Inspection Remarks</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Reason for decision, packaging inspection results, or return instructions..."
                value={staffNotes}
                onChange={(e) => setStaffNotes(e.target.value)}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
