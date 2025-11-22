// src/components/Chat/ChatList.js
import React, { useState } from 'react';
import { 
  MessageCircle, 
  Search, 
  Users, 
  Plus,
  CheckCircle2
} from 'lucide-react';
import { useSocial } from '../../contexts/SocialContext';
import ChatWindow from './ChatWindow';

const ChatList = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  
  const { 
    chats, 
    friends, 
    createChat, 
    onlineUsers 
  } = useSocial();

  const filteredChats = chats.filter(chat =>
    chat.participants.some(participant =>
      participant.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const formatLastActivity = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now - date;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const isUserOnline = (userId) => {
    return onlineUsers.some(user => user.userId === userId);
  };

  const handleCreateChat = async (friendId) => {
    try {
      const newChat = await createChat(friendId);
      setSelectedChat({
        ...newChat,
        friend: friends.find(f => f.id === friendId)
      });
      setShowNewChatModal(false);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleChatSelect = (chat) => {
    const friend = friends.find(f => 
      chat.participants.some(p => p.userId === f.id)
    );
    setSelectedChat({ ...chat, friend });
  };

  if (selectedChat) {
    return (
      <ChatWindow
        chatId={selectedChat.id}
        friend={selectedChat.friend}
        onClose={() => setSelectedChat(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-8 h-8" />
            <h2 className="text-xl font-bold">Chats</h2>
          </div>
          <button
            onClick={() => setShowNewChatModal(true)}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-200" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar chats..."
            className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-20 border border-pink-300 rounded-lg text-white placeholder-pink-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredChats.map((chat) => {
              const otherParticipant = chat.participants.find(p => p.userId !== chat.currentUserId);
              const isOnline = isUserOnline(otherParticipant?.userId);
              
              return (
                <button
                  key={chat.id}
                  onClick={() => handleChatSelect(chat)}
                  className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {otherParticipant?.name?.charAt(0) || '?'}
                        </span>
                      </div>
                      {isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>

                    {/* Chat info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {otherParticipant?.name || 'Usuario'}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatLastActivity(chat.lastActivity)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">
                          {chat.lastMessage || 'No hay mensajes aún'}
                        </p>
                        {chat.unreadCount > 0 && (
                          <span className="bg-pink-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No tienes chats aún
              </h3>
              <p className="text-gray-500 mb-4">
                Conecta con amigas y empieza a chatear
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
              >
                Nuevo Chat
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New chat modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Nuevo Chat
                </h3>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <div className="space-y-3">
                {friends.length > 0 ? (
                  friends.map((friend) => {
                    const hasExistingChat = chats.some(chat =>
                      chat.participants.some(p => p.userId === friend.id)
                    );
                    const isOnline = isUserOnline(friend.id);

                    return (
                      <button
                        key={friend.id}
                        onClick={() => handleCreateChat(friend.id)}
                        disabled={hasExistingChat}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          hasExistingChat
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'hover:bg-gray-50 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {friend.name.charAt(0)}
                              </span>
                            </div>
                            {isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{friend.name}</p>
                            <p className="text-sm text-gray-600">{friend.email}</p>
                          </div>
                          {hasExistingChat && (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No tienes amigas aún. Agrega amigas en la sección Social.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;
