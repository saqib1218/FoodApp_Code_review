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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Engagement Center</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage customer communications and support
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {/* Conversations List */}
          <div className="border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Conversations</h2>
            </div>
            <div className="overflow-y-auto h-[calc(100vh-250px)]">
              {isLoading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading conversations...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-gray-500">No conversations found.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {conversations.map((conversation) => (
                    <li 
                      key={conversation.id}
                      className={`hover:bg-gray-50 cursor-pointer ${selectedConversation?.id === conversation.id ? 'bg-gray-50' : ''}`}
                      onClick={() => handleSelectConversation(conversation)}
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="relative flex-shrink-0">
                              {conversation.user?.avatar ? (
                                <img src={conversation.user.avatar} alt={conversation.user.name} className="h-10 w-10 rounded-full object-cover" />
                              ) : (
                                <UserCircleIcon className="h-10 w-10 text-gray-400" />
                              )}
                              {conversation.user?.online && (
                                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-green-500"></span>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                {conversation.user?.name}
                                {conversation.pinned && (
                                  <span className="text-xs text-primary-600 border border-primary-200 rounded px-1">Pinned</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatLastSeen(conversation.user)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {conversation.unread > 0 && (
                              <div className="flex-shrink-0">
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary-100 text-primary-800 text-xs font-medium">
                                  {conversation.unread}
                                </span>
                              </div>
                            )}
                            <button
                              className="p-1 rounded hover:bg-gray-100"
                              onClick={(e) => { e.stopPropagation(); toggleMenu(conversation.id); }}
                              aria-label="More"
                            >
                              <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
                            </button>
                            {menuOpenFor === conversation.id && (
                              <div className="relative">
                                <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded shadow z-10">
                                  <button
                                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                                    onClick={(e) => { e.stopPropagation(); pinChat(conversation.id); }}
                                  >
                                    Pin chat
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.lastMessage.isCustomer ? (
                              <span className="font-medium">Customer: </span>
                            ) : (
                              <span className="font-medium">You: </span>
                            )}
                            {conversation.lastMessage.text}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right panel: Team view shows only Take Ownership action */}
          <div className="col-span-2 flex flex-col h-[calc(100vh-200px)]">
            {selectedConversation ? (
              <div className="flex-1 flex items-center justify-center">
                <button
                  type="button"
                  className="px-6 py-3 rounded-md bg-primary-600 text-white hover:bg-primary-700 shadow"
                >
                  Take Ownership
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <UserCircleIcon className="h-16 w-16 text-gray-400 mx-auto" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No conversation selected</h3>
                  <p className="mt-1 text-sm text-gray-500">Select a conversation from the list</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamEngagements;
