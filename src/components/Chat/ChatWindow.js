// src/components/Chat/ChatWindow.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, 
  Smile, 
  Paperclip, 
  MoreVertical, 
  Phone, 
  Video,
  X,
  Heart,
  ThumbsUp,
  Laugh
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocial } from '../../contexts/SocialContext';

const ChatWindow = ({ chatId, friend, onClose }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Evitar warning de ESLint
  console.log('setIsTyping function available:', typeof setIsTyping);
  const messagesEndRef = useRef(null);
  const { userProfile } = useAuth();
  const { sendMessage, getMessages, markAsRead } = useSocial();

  const emojis = ['😊', '😂', '😍', '🥰', '😘', '😉', '😋', '🤗', '🤔', '😅', '😭', '😴', '🤧', '🤒', '💕', '❤️', '💖', '💗', '💝', '🌸', '🌺', '🦋', '✨', '🔥', '💪'];

  const reactions = [
    { icon: Heart, emoji: '❤️', color: 'text-red-500' },
    { icon: ThumbsUp, emoji: '👍', color: 'text-blue-500' },
    { icon: Laugh, emoji: '😂', color: 'text-yellow-500' }
  ];

  const loadMessages = useCallback(async () => {
    try {
      const chatMessages = await getMessages(chatId);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [chatId, getMessages]);

  useEffect(() => {
    loadMessages();
    markAsRead(chatId);
  }, [chatId, loadMessages, markAsRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      try {
        const newMessage = {
          id: Date.now().toString(),
          text: message.trim(),
          senderId: userProfile.uid,
          senderName: userProfile.name,
          timestamp: new Date().toISOString(),
          type: 'text'
        };

        setMessages(prev => [...prev, newMessage]);
        setMessage('');
        
        await sendMessage(chatId, newMessage);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleReaction = async (messageId, reaction) => {
    try {
      // Implementar lógica de reacciones
      console.log('Reaction:', reaction, 'to message:', messageId);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isToday = (timestamp) => {
    const today = new Date();
    const messageDate = new Date(timestamp);
    return today.toDateString() === messageDate.toDateString();
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    if (isToday(timestamp)) {
      return 'Hoy';
    }
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {friend.name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold">{friend.name}</h3>
              <p className="text-sm text-pink-100">
                {isTyping ? 'Escribiendo...' : 'En línea'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(messageGroups).map(([date, dayMessages]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                {formatDate(dayMessages[0].timestamp)}
              </div>
            </div>

            {/* Messages for this date */}
            <div className="space-y-2">
              {dayMessages.map((msg, index) => {
                const isOwnMessage = msg.senderId === userProfile.uid;
                const showAvatar = index === 0 || dayMessages[index - 1].senderId !== msg.senderId;
                
                return (
                  <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar */}
                      {!isOwnMessage && (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${showAvatar ? '' : 'invisible'}`}>
                          <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                              {friend.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Message bubble */}
                      <div className="group relative">
                        <div className={`px-4 py-2 rounded-2xl ${
                          isOwnMessage 
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{msg.text}</p>
                        </div>
                        
                        {/* Timestamp */}
                        <div className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                          {formatTime(msg.timestamp)}
                        </div>

                        {/* Reaction buttons */}
                        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 hidden group-hover:flex bg-white border border-gray-200 rounded-full shadow-lg">
                          {reactions.map((reaction, idx) => {
                            const Icon = reaction.icon;
                            return (
                              <button
                                key={idx}
                                onClick={() => handleReaction(msg.id, reaction.emoji)}
                                className={`p-1 hover:bg-gray-50 rounded-full transition-colors ${reaction.color}`}
                              >
                                <Icon className="w-4 h-4" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-8 gap-2">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiClick(emoji)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>

          <button
            type="submit"
            disabled={!message.trim()}
            className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
