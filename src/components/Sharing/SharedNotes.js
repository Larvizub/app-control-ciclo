// src/components/Sharing/SharedNotes.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Share2, 
  Users,
  Lock,
  MessageCircle,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocial } from '../../contexts/SocialContext';

const SharedNotes = () => {
  const [notes, setNotes] = useState([]);
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tags: [],
    sharedWith: [],
    isPrivate: false,
    mood: null,
    cycleDay: null
  });

  const { userProfile } = useAuth();
  const { friends, sharedNotes, createSharedNote, deleteSharedNote } = useSocial();

  const moods = [
    { id: 'happy', name: 'Feliz', emoji: '😊', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'sad', name: 'Triste', emoji: '😢', color: 'bg-blue-100 text-blue-800' },
    { id: 'angry', name: 'Molesta', emoji: '😠', color: 'bg-red-100 text-red-800' },
    { id: 'anxious', name: 'Ansiosa', emoji: '😰', color: 'bg-purple-100 text-purple-800' },
    { id: 'excited', name: 'Emocionada', emoji: '🤩', color: 'bg-pink-100 text-pink-800' },
    { id: 'tired', name: 'Cansada', emoji: '😴', color: 'bg-gray-100 text-gray-800' }
  ];

  const tags = [
    { id: 'period', name: 'Período', color: 'bg-red-100 text-red-800' },
    { id: 'symptoms', name: 'Síntomas', color: 'bg-orange-100 text-orange-800' },
    { id: 'mood', name: 'Estado de ánimo', color: 'bg-purple-100 text-purple-800' },
    { id: 'relationship', name: 'Relación', color: 'bg-pink-100 text-pink-800' },
    { id: 'health', name: 'Salud', color: 'bg-green-100 text-green-800' },
    { id: 'work', name: 'Trabajo', color: 'bg-blue-100 text-blue-800' },
    { id: 'family', name: 'Familia', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'goals', name: 'Objetivos', color: 'bg-yellow-100 text-yellow-800' }
  ];

  const loadNotes = useCallback(async () => {
    try {
      const userNotes = await sharedNotes();
      setNotes(userNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  }, [sharedNotes]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'private') return matchesSearch && note.isPrivate;
    if (filter === 'shared') return matchesSearch && !note.isPrivate;
    if (filter === 'recent') return matchesSearch && isRecent(note.createdAt);
    
    return matchesSearch;
  });

  const isRecent = (date) => {
    const now = new Date();
    const noteDate = new Date(date);
    const diffInHours = (now - noteDate) / (1000 * 60 * 60);
    return diffInHours <= 24;
  };

  const handleCreateNote = async () => {
    try {
      const noteData = {
        ...newNote,
        authorId: userProfile.uid,
        authorName: userProfile.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const createdNote = await createSharedNote(noteData);
      setNotes(prev => [createdNote, ...prev]);
      setShowNewNoteModal(false);
      setNewNote({
        title: '',
        content: '',
        tags: [],
        sharedWith: [],
        isPrivate: false,
        mood: null,
        cycleDay: null
      });
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteSharedNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleTagToggle = (tagId) => {
    setNewNote(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  const handleFriendToggle = (friendId) => {
    setNewNote(prev => ({
      ...prev,
      sharedWith: prev.sharedWith.includes(friendId)
        ? prev.sharedWith.filter(id => id !== friendId)
        : [...prev.sharedWith, friendId]
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTagInfo = (tagId) => tags.find(tag => tag.id === tagId);
  const getMoodInfo = (moodId) => moods.find(mood => mood.id === moodId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-pink-500" />
              <h1 className="text-2xl font-bold text-gray-900">Notas Compartidas</h1>
            </div>
            <button
              onClick={() => setShowNewNoteModal(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Nueva Nota</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar notas..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="all">Todas</option>
              <option value="private">Privadas</option>
              <option value="shared">Compartidas</option>
              <option value="recent">Recientes</option>
            </select>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => {
            const mood = getMoodInfo(note.mood);
            return (
              <div key={note.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                {/* Note Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {note.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(note.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {note.isPrivate ? (
                      <Lock className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Share2 className="w-4 h-4 text-green-500" />
                    )}
                    <button className="text-gray-400 hover:text-gray-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Note Content */}
                <div className="mb-4">
                  <p className="text-gray-700 text-sm line-clamp-3">
                    {note.content}
                  </p>
                </div>

                {/* Mood */}
                {mood && (
                  <div className="mb-4">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${mood.color}`}>
                      <span>{mood.emoji}</span>
                      <span>{mood.name}</span>
                    </span>
                  </div>
                )}

                {/* Tags */}
                {note.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tagId) => {
                        const tag = getTagInfo(tagId);
                        return tag ? (
                          <span key={tagId} className={`px-2 py-1 rounded-full text-xs ${tag.color}`}>
                            {tag.name}
                          </span>
                        ) : null;
                      })}
                      {note.tags.length > 3 && (
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                          +{note.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Shared With */}
                {!note.isPrivate && note.sharedWith.length > 0 && (
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>Compartida con {note.sharedWith.length} personas</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{note.comments || 0}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredNotes.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No hay notas
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'No se encontraron notas con ese término' : 'Crea tu primera nota para comenzar'}
            </p>
            <button
              onClick={() => setShowNewNoteModal(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
            >
              Crear Nota
            </button>
          </div>
        )}
      </main>

      {/* New Note Modal */}
      {showNewNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Nueva Nota
                </h3>
                <button
                  onClick={() => setShowNewNoteModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título de la nota..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenido
                  </label>
                  <textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Escribe tu nota aquí..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                {/* Mood */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ¿Cómo te sientes?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {moods.map((mood) => (
                      <button
                        key={mood.id}
                        onClick={() => setNewNote(prev => ({ 
                          ...prev, 
                          mood: prev.mood === mood.id ? null : mood.id 
                        }))}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          newNote.mood === mood.id
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{mood.emoji}</div>
                        <div className="text-xs font-medium">{mood.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etiquetas
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => handleTagToggle(tag.id)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          newNote.tags.includes(tag.id)
                            ? tag.color
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Privacy */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Nota privada</p>
                    <p className="text-sm text-gray-600">Solo tú podrás ver esta nota</p>
                  </div>
                  <button
                    onClick={() => setNewNote(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      newNote.isPrivate ? 'bg-pink-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        newNote.isPrivate ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Share with friends */}
                {!newNote.isPrivate && friends.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Compartir con
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {friends.map((friend) => (
                        <div key={friend.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-semibold">
                                {friend.name.charAt(0)}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {friend.name}
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            checked={newNote.sharedWith.includes(friend.id)}
                            onChange={() => handleFriendToggle(friend.id)}
                            className="rounded text-pink-500 focus:ring-pink-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowNewNoteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateNote}
                  disabled={!newNote.title.trim() || !newNote.content.trim()}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Crear Nota
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedNotes;
