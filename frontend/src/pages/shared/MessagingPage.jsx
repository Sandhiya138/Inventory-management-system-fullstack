import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { messageService } from '../../services/messageService';
import { userService } from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatDateTime } from '../../utils/formatters';
import { Icon } from '../../components/icons/Icons';

export const MessagingPage = () => {
  const { user, isAdmin, isStaff, isViewer } = useAuth();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');
  const [sending, setSending] = useState(false);

  // New Conversation Modal
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [relatedOrderId, setRelatedOrderId] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [creatingConv, setCreatingConv] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
    loadPotentialRecipients();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await messageService.getConversations();
      const safeData = Array.isArray(data) ? data : [];
      const sorted = safeData.sort(
        (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      );
      setConversations(sorted);
      if (sorted.length > 0 && !activeConversation) {
        setActiveConversation(sorted[0]);
      }
    } catch (err) {
      const msg = err.message || 'Unable to load conversations from backend server.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const loadPotentialRecipients = async () => {
    try {
      const users = await userService.getUsers();
      // Filter based on allowed communication rules:
      // ADMIN <-> STAFF
      // STAFF <-> VIEWER
      // VIEWER <-> STAFF
      const filtered = (users || []).filter((u) => {
        if (u.id === user?.id) return false;
        if (isViewer) return u.role === 'STAFF';
        if (isAdmin) return u.role === 'STAFF';
        if (isStaff) return u.role === 'ADMIN' || u.role === 'VIEWER';
        return true;
      });
      setAvailableUsers(filtered);
    } catch (err) {
      console.error('Could not load recipients:', err);
    }
  };

  const loadMessages = async (convId) => {
    setLoadingMessages(true);
    try {
      const data = await messageService.getMessages(convId);
      setMessages(data || []);
    } catch (err) {
      showError(err.message || 'Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeConversation) return;

    setSending(true);
    try {
      const sent = await messageService.sendMessage(activeConversation.id, newMessageText.trim());
      setMessages((prev) => [...prev, sent]);
      setNewMessageText('');
    } catch (err) {
      showError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleCreateConversation = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !selectedRecipientId || !initialMessage.trim()) {
      showError('Please fill in title, recipient, and message');
      return;
    }

    setCreatingConv(true);
    try {
      const recipient = availableUsers.find((u) => String(u.id) === String(selectedRecipientId));
      let type = 'STAFF_VIEWER';
      if (
        (user?.role === 'ADMIN' && recipient?.role === 'STAFF') ||
        (user?.role === 'STAFF' && recipient?.role === 'ADMIN')
      ) {
        type = 'ADMIN_STAFF';
      }

      const payload = {
        title: newTitle.trim(),
        type,
        participantTwoId: Number(selectedRecipientId),
        relatedOrderId: relatedOrderId ? Number(relatedOrderId) : null,
        initialMessage: initialMessage.trim(),
      };

      const newConv = await messageService.createConversation(payload);
      showSuccess('Conversation initiated successfully');
      setNewModalOpen(false);
      setNewTitle('');
      setSelectedRecipientId('');
      setRelatedOrderId('');
      setInitialMessage('');

      await loadConversations();
      if (newConv) {
        setActiveConversation(newConv);
      }
    } catch (err) {
      showError(err.message || 'Failed to initiate conversation');
    } finally {
      setCreatingConv(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-main">
            Internal <span className="text-gold">Messaging & Support Channel</span>
          </h1>
          <p className="text-muted text-sm mt-1">
            Secure multi-role direct messaging (Admin ↔ Staff, Staff ↔ Viewer).
          </p>
        </div>
        <Button
          variant="primary"
          icon="plus"
          onClick={() => setNewModalOpen(true)}
        >
          New Conversation
        </Button>
      </div>

      {error && (
        <ErrorState
          title="Unable to load messages"
          message={error}
          onRetry={loadConversations}
        />
      )}

      {/* Main Two-Column Chat Container */}
      <div
        className="card p-0 grid"
        style={{
          gridTemplateColumns: '340px 1fr',
          height: '680px',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Left Pane: Conversations List */}
        <div
          style={{
            borderRight: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-1)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="p-4 border-b border-subtle flex items-center justify-between">
            <span className="text-sm font-bold text-main">Discussions ({conversations.length})</span>
            <Button
              variant="ghost"
              size="sm"
              icon="refresh"
              onClick={loadConversations}
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }} className="p-2 flex flex-col gap-1">
            {loading ? (
              <div className="p-4 flex flex-col gap-3">
                <LoadingSkeleton variant="card" height={60} />
                <LoadingSkeleton variant="card" height={60} />
                <LoadingSkeleton variant="card" height={60} />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Icon name="message-square" size={32} className="text-muted mb-2" />
                <p className="text-xs text-muted">No conversations found.</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewModalOpen(true)}
                  style={{ marginTop: 8 }}
                >
                  Start Chat
                </Button>
              </div>
            ) : (
              conversations.map((c) => {
                const isSelected = activeConversation?.id === c.id;
                const otherParty =
                  c.participantOne?.id === user?.id
                    ? c.participantTwo
                    : c.participantOne;

                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveConversation(c)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(94, 25, 51, 0.45)' : 'transparent',
                      border: isSelected
                        ? '1px solid var(--color-gold)'
                        : '1px solid transparent',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-main truncate" style={{ maxWidth: '180px' }}>
                        {c.title}
                      </span>
                      <span
                        className="badge"
                        style={{
                          fontSize: '0.6rem',
                          background: c.type === 'ADMIN_STAFF' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(122, 154, 131, 0.2)',
                          color: c.type === 'ADMIN_STAFF' ? 'var(--color-gold)' : 'var(--color-sage)',
                        }}
                      >
                        {c.type === 'ADMIN_STAFF' ? 'Admin/Staff' : 'Staff/Viewer'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>With: {otherParty?.fullName || 'Colleague'}</span>
                      {c.relatedOrder && (
                        <span className="text-gold font-mono">#{c.relatedOrder.id}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Messages History & Input */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {activeConversation ? (
            <>
              {/* Active Conversation Header */}
              <div
                className="p-4 border-b border-subtle flex items-center justify-between"
                style={{ background: 'rgba(255, 255, 255, 0.02)' }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-main m-0">{activeConversation.title}</h3>
                    {activeConversation.relatedOrder && (
                      <span className="badge badge-gold">
                        Order #{activeConversation.relatedOrder.id}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted">
                    Channel: {activeConversation.type} • Created {formatDateTime(activeConversation.createdAt)}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  icon="refresh"
                  onClick={() => loadMessages(activeConversation.id)}
                >
                  Sync
                </Button>
              </div>

              {/* Message Stream */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {loadingMessages ? (
                  <div className="flex flex-col gap-3 py-4">
                    <LoadingSkeleton variant="card" height={50} />
                    <LoadingSkeleton variant="card" height={50} />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-muted text-sm py-12">
                    No messages in this conversation yet. Send the first message below.
                  </p>
                ) : (
                  messages.map((m) => {
                    const isMe = m.sender?.id === user?.id;

                    return (
                      <div
                        key={m.id}
                        style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '70%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMe ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>
                          {isMe ? 'You' : m.sender?.fullName || 'User'} ({m.sender?.role})
                        </div>
                        <div
                          style={{
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-md)',
                            background: isMe
                              ? 'linear-gradient(135deg, var(--color-wine) 0%, var(--color-terracotta) 100%)'
                              : 'var(--bg-surface-2)',
                            color: isMe ? 'var(--color-cream)' : 'var(--text-main)',
                            border: isMe ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid var(--border-subtle)',
                            boxShadow: isMe ? '0 4px 12px rgba(122, 29, 63, 0.25)' : 'none',
                            fontSize: '0.875rem',
                            lineHeight: 1.4,
                            wordBreak: 'break-word',
                          }}
                        >
                          {m.content}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {formatDateTime(m.createdAt)}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-subtle flex gap-2"
                style={{ background: 'var(--bg-surface-1)' }}
              >
                <input
                  type="text"
                  placeholder="Type your message... (press Enter to send)"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="input"
                  style={{ flex: 1 }}
                />
                <Button
                  type="submit"
                  variant="primary"
                  icon="send"
                  loading={sending}
                  disabled={!newMessageText.trim()}
                >
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Icon name="message-square" size={48} className="text-muted mb-3" />
              <h3 className="text-lg font-bold text-main mb-1">Select a Conversation</h3>
              <p className="text-xs text-muted max-w-sm mb-4">
                Choose a conversation from the sidebar or click "New Conversation" to start a direct thread.
              </p>
              <Button variant="primary" icon="plus" onClick={() => setNewModalOpen(true)}>
                New Conversation
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      <Modal
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        title="Start New Conversation"
        subtitle="Initiate a direct communication thread"
        footer={
          <>
            <Button variant="ghost" onClick={() => setNewModalOpen(false)} disabled={creatingConv}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateConversation} loading={creatingConv}>
              Create Thread
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateConversation} className="flex flex-col gap-4">
          <Input
            label="Subject / Topic"
            placeholder="e.g. Order #12 delivery inquiry, Restocking request..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
            autoFocus
          />

          <Select
            label="Recipient"
            placeholder="Select a colleague or recipient..."
            value={selectedRecipientId}
            onChange={(e) => setSelectedRecipientId(e.target.value)}
            options={availableUsers.map((u) => ({
              value: String(u.id),
              label: `${u.fullName} (${u.role}) - ${u.email}`,
            }))}
            required
          />

          <Input
            label="Related Order ID (Optional)"
            type="number"
            placeholder="e.g. 1"
            value={relatedOrderId}
            onChange={(e) => setRelatedOrderId(e.target.value)}
          />

          <div className="form-group">
            <label className="form-label">Initial Message</label>
            <textarea
              className="form-control"
              rows="4"
              placeholder="State your question, requisition details, or support query..."
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
