import React from 'react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PaperAirplaneIcon, UserCircleIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import myChatData from '../../data/chat/myEngagement.json';

const MyEngagements = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpenFor, setMenuOpenFor] = useState(null);

  // Get partner data from navigation state
  const partnerData = location.state || {};
  const { partnerId, partnerName, partnerEmail, partnerPhone, openChat } = partnerData;

  // Debug: Log the received data
  console.log('MyEngagements - Received navigation data:', partnerData);
  console.log('Partner details:', { partnerId, partnerName, partnerEmail, partnerPhone, openChat });

  // Load conversations from JSON and optionally append partner chat
  useEffect(() => {
    let data = Array.isArray(myChatData) ? [...myChatData] : [];

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
      // Avoid duplicate if already exists
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

  // Fetch messages for a conversation
  const fetchMessages = (conversationId) => {
    // TODO: Replace with actual API call to fetch messages for the conversation
    // For now, return empty array for regular conversations
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation?.isPartner) {
      return [
        {
          id: 1,
          text: `Chat started with ${conversation.customer.name}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          isCustomer: false,
          isSystem: true
        }
      ];
    }
    return [];
  };

  const handleSelectConversation = (conversation) => {
    // Mark conversation as read when selected
    const updatedConversations = conversations.map(c => 
      c.id === conversation.id ? { ...c, unread: 0 } : c
    );
    setConversations(updatedConversations);

    // Fetch messages for the selected conversation
    const messages = fetchMessages(conversation.id);
    setSelectedConversation({
      ...conversation,
      messages: messages || []
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!message.trim() || !selectedConversation) return;

    // Add the new message to the conversation
    const newMessage = {
      id: Date.now(),
      text: message,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isCustomer: false
    };

    setSelectedConversation({
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMessage],
      lastMessage: newMessage
    });

    // Update the conversation in the list
    const updatedConversations = conversations.map(c => 
      c.id === selectedConversation.id 
        ? { 
            ...c, 
            lastMessage: newMessage
          } 
        : c
    );
    setConversations(updatedConversations);

    // Clear the message input
    setMessage('');
  };

  // Helpers for header/subtitle and chat actions
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
    // sort: pinned first, keep relative order otherwise
    const sorted = updated.sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1));
    setConversations(sorted);
    setMenuOpenFor(null);
  };

  return (
    <div className="p-6 text-center text-neutral-600">Working on it...</div>
  );
};

export default MyEngagements;
