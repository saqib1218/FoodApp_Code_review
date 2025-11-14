import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserCircleIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import teamChatData from '../../data/chat/teamEngagement.json';

const TeamEngagements = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpenFor, setMenuOpenFor] = useState(null);

  // Get partner data from navigation state
  const partnerData = location.state || {};
  const { partnerId, partnerName, partnerEmail, partnerPhone, openChat } = partnerData;

  console.log('TeamEngagements - Received navigation data:', partnerData);

  useEffect(() => {
    // Load base data from JSON
    let data = Array.isArray(teamChatData) ? [...teamChatData] : [];

    // If navigation provided a specific partner to open, prepend it
    if (partnerId && partnerName && openChat) {
      const nowIso = new Date().toISOString();
      const partnerConversation = {
        id: partnerId,
        user: {
          id: partnerId,
          name: partnerName,
          email: partnerEmail,
          phone: partnerPhone,
          avatar: null,
          online: true,
          lastSeen: null
        },
        pinned: false,
        lastMessage: {
          text: 'Start a conversation with this partner',
          timestamp: nowIso,
          isCustomer: false,
          status: 'sent'
        },
        unread: 0,
        messages: [
          {
            id: 1,
            text: `Chat started with ${partnerName}`,
            timestamp: nowIso.replace('T', ' ').substring(0, 16),
            isCustomer: false,
            isSystem: true,
            status: 'sent'
          }
        ]
      };
      const exists = data.some(c => c.id === partnerId);
      if (!exists) data.unshift(partnerConversation);
      setSelectedConversation(partnerConversation);
    }

    // Sort pinned first, then by lastMessage timestamp desc
    const sorted = data.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      const at = new Date(a.lastMessage?.timestamp || 0).getTime();
      const bt = new Date(b.lastMessage?.timestamp || 0).getTime();
      return bt - at;
    });
    setConversations(sorted);
    // Auto-select the top chat by default if nothing is selected already
    if (!selectedConversation && sorted.length > 0) {
      setSelectedConversation(sorted[0]);
    }
    setIsLoading(false);
  }, [partnerId, partnerName, partnerEmail, partnerPhone, openChat, selectedConversation]);

  const fetchMessages = (conversationId) => {
    // For team view we don't show messages; keep structure if needed
    return [];
  };

  const handleSelectConversation = (conversation) => {
    const updatedConversations = conversations.map(c => 
      c.id === conversation.id ? { ...c, unread: 0 } : c
    );
    setConversations(updatedConversations);

    const messages = fetchMessages(conversation.id);
    setSelectedConversation({
      ...conversation,
      messages: messages || []
    });
  };

  const formatLastSeen = (user) => {
    if (user?.online) return 'online';
    if (!user?.lastSeen) return '';
    try {
      const d = new Date(user.lastSeen);
      return `last seen ${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return '';
    }
  };

  const toggleMenu = (id) => {
    setMenuOpenFor(prev => (prev === id ? null : id));
  };

  const pinChat = (id) => {
    const updated = conversations.map(c => c.id === id ? { ...c, pinned: true } : c);
    const sorted = updated.sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1));
    setConversations(sorted);
    setMenuOpenFor(null);
  };

  return (
    <div className="p-6 text-center text-neutral-600">Working on it...</div>
  );
};

export default TeamEngagements;
