// src/components/Social/Social.js
import React, { useState, useMemo } from 'react';
import { Users, MessageCircle, UserPlus, Share2, FileText } from 'lucide-react';
import { useSocial } from '../../contexts/SocialContext';
import { useAuth } from '../../contexts/AuthContext';
import ChatList from '../Chat/ChatList';
import SharedNotes from '../Sharing/SharedNotes';

const Social = () => {
  const { 
    friends, 
    friendRequests, 
    chats, 
    onlineUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest
  } = useSocial();
  const { userProfile } = useAuth();
  
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [activeTab, setActiveTab] = useState('friends');

  // Filtrar usuarios en línea para mostrar solo amigos y pareja
  const filteredOnlineUsers = useMemo(() => {
    // Obtener IDs de amigos
    const friendIds = friends.map(f => f.id || f.uid);
    // Agregar ID de la pareja si existe
    const partnerId = userProfile?.partnerId;
    const allowedIds = [...friendIds];
    if (partnerId) {
      allowedIds.push(partnerId);
    }
    
    // Filtrar usuarios en línea que sean amigos o pareja
    return onlineUsers.filter(user => allowedIds.includes(user.userId));
  }, [friends, onlineUsers, userProfile?.partnerId]);
  
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [activeTab, setActiveTab] = useState('friends');

  const handleSendFriendRequest = async (e) => {
    e.preventDefault();
    if (newFriendEmail.trim()) {
      await sendFriendRequest(newFriendEmail.trim());
      setNewFriendEmail('');
    }
  };

  const tabs = [
    { id: 'friends', name: 'Amigas', icon: Users, count: friends.length },
    { id: 'requests', name: 'Solicitudes', icon: UserPlus, count: friendRequests.length },
    { id: 'chats', name: 'Chats', icon: MessageCircle, count: chats.length },
    { id: 'notes', name: 'Notas', icon: FileText, count: 0 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-pink-500" />
              <h1 className="text-2xl font-bold text-gray-900">Social</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">
                {filteredOnlineUsers.length} amigos en línea
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Agregar amiga */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Agregar Amiga
              </h3>
              <form onSubmit={handleSendFriendRequest} className="space-y-4">
                <input
                  type="email"
                  value={newFriendEmail}
                  onChange={(e) => setNewFriendEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
                >
                  Enviar Solicitud
                </button>
              </form>
            </div>

            {/* Amigos en línea */}
            {filteredOnlineUsers.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Amigos en Línea
                </h3>
                <div className="space-y-3">
                  {filteredOnlineUsers.slice(0, 5).map((user) => (
                    <div key={user.userId} className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {user.userName.charAt(0)}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {user.userName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-pink-500 text-pink-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{tab.name}</span>
                        {tab.count > 0 && (
                          <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-6">
                {/* Lista de amigas */}
                {activeTab === 'friends' && (
                  <div className="space-y-4">
                    {friends.length > 0 ? (
                      friends.map((friend) => (
                        <div key={friend.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {friend.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{friend.name}</p>
                              <p className="text-sm text-gray-600">{friend.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <MessageCircle className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                              <Share2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg mb-2">No tienes amigas aún</p>
                        <p className="text-sm">Agrega amigas para compartir y conectar</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Solicitudes de amistad */}
                {activeTab === 'requests' && (
                  <div className="space-y-4">
                    {friendRequests.length > 0 ? (
                      friendRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {request.fromName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{request.fromName}</p>
                              <p className="text-sm text-gray-600">{request.fromEmail}</p>
                              <p className="text-xs text-gray-500">
                                Quiere ser tu amiga
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => acceptFriendRequest(request.id, request.from)}
                              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Aceptar
                            </button>
                            <button
                              onClick={() => rejectFriendRequest(request.from)}
                              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              Rechazar
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <UserPlus className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg mb-2">No tienes solicitudes pendientes</p>
                        <p className="text-sm">Las nuevas solicitudes aparecerán aquí</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Chats */}
                {activeTab === 'chats' && (
                  <div className="h-[600px]">
                    <ChatList />
                  </div>
                )}

                {/* Notas compartidas */}
                {activeTab === 'notes' && (
                  <div className="h-[600px] overflow-hidden">
                    <SharedNotes />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Social;
