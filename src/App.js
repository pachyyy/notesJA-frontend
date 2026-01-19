import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Plus, Search, StickyNote } from 'lucide-react';
import NoteCard from './components/NoteCard';
import NoteEditor from './components/NoteEditor';
import PasswordUnlockDialog from './components/PasswordUnlockDialog';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Toaster } from './components/ui/toaster';
import { toast } from './hooks/use-toast';
import { format } from 'date-fns';
import { getNotes, createNote, updateNote, deleteNote } from './utils/noteApi';
import { hashPassword, verifyPassword } from './utils/passwordUtils';

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [noteToUnlock, setNoteToUnlock] = useState(null);
  const [unlockedNotes, setUnlockedNotes] = useState(new Set());

  useEffect(() => {
    const fetchNotes = async () => {
      const savedNotes = await getNotes();
      setNotes(savedNotes);
    };
    fetchNotes();
  }, []);

  const handleCreateNote = () => {
    setSelectedNote(null);
    setIsEditorOpen(true);
  };

  const handleNoteClick = (note) => {
    if (note.isPasswordProtected && !unlockedNotes.has(note.id)) {
      setNoteToUnlock(note);
    } else {
      setSelectedNote(note);
      setIsEditorOpen(true);
    }
  };

  const handleUnlock = (password) => {
    if (!noteToUnlock) return;

    if (verifyPassword(password, noteToUnlock.passwordHash)) {
      setUnlockedNotes(prev => new Set([...prev, noteToUnlock.id]));
      setSelectedNote(noteToUnlock);
      setIsEditorOpen(true);
      setNoteToUnlock(null);
      toast({
        title: 'Note Unlocked',
        description: 'You can now view and edit this note.'
      });
    } else {
      toast({
        title: 'Incorrect Password',
        description: 'The password you entered is incorrect.',
        variant: 'destructive'
      });
    }
  };

  const handleSaveNote = async (noteData) => {
    try {
      const timestamp = format(new Date(), 'dd MMM yyyy HH:mm');
      if (selectedNote) {
        // Update existing note
        const updates = { 
          ...noteData,
          updated_at: timestamp
        };

        if (noteData.password && noteData.password !== '') {
          updates.passwordHash = await hashPassword(noteData.password);
        } else if (!noteData.isPasswordProtected) {
          updates.passwordHash = null;
        }

        delete updates.password;

        const updatedNote = await updateNote(selectedNote.id, updates);
        setNotes(notes.map(n => n.id === selectedNote.id ? updatedNote : n));

        toast({
          title: 'Note Updated',
          description: 'Your changes have been saved.'
        });
      } else {
        // Create new note
        const newNotePayload = {
          ...noteData,
          updated_at: timestamp,
          passwordHash: noteData.password ? await hashPassword(noteData.password) : null
        };

        delete newNotePayload.password;

        const savedNote = await createNote(newNotePayload);
        setNotes([...notes, savedNote]);

        toast({
          title: 'Note Created',
          description: 'Your new note has been saved.'
        });
      }
    } catch (error) {
      console.error("Failed to save note:", error);
      toast({
        title: "Save Failed",
        description: "There was an error while saving the note.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId);
      setNotes(notes.filter(n => n.id !== noteId));
      // Remove from unlocked notes if present
      setUnlockedNotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(noteId);
        return newSet;
      });

      toast({
        title: 'Note Deleted',
        description: 'The note has been removed.'
      });
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast({
        title: "Delete Failed",
        description: "There was an error while deleting the note.",
        variant: "destructive"
      });
    }
  };

  const handleTogglePin = async (noteId) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      try {
        const updatedNote = await updateNote(noteId, { isPinned: !note.isPinned });
        setNotes(notes.map(n => n.id === noteId ? updatedNote : n));
      } catch (error) {
        console.error("Failed to pin/unpin note:", error);
        toast({
          title: "Update Failed",
          description: "There was an error while updating the note.",
          variant: "destructive"
        });
      }
    }
  };

  // Filter and sort notes
  const filteredNotes = notes.filter(note => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.title?.toLowerCase().includes(query) ||
      note.content?.toLowerCase().includes(query)
    );
  });

  const pinnedNotes = filteredNotes.filter(note => note.isPinned);
  const unpinnedNotes = filteredNotes.filter(note => !note.isPinned);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Toaster />
      
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
                <StickyNote className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Markdown Notes</h1>
                <p className="text-sm text-gray-500">Keep your thoughts organized</p>
              </div>
            </div>
            <Button onClick={handleCreateNote} size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              New Note
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {notes.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <StickyNote className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Notes Yet</h2>
            <p className="text-gray-500 mb-6">Create your first markdown note to get started</p>
            <Button onClick={handleCreateNote} size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Create First Note
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pinned Notes */}
            {pinnedNotes.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Pinned Notes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {pinnedNotes.map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onClick={handleNoteClick}
                      onDelete={handleDeleteNote}
                      onTogglePin={handleTogglePin}
                      isUnlocked={unlockedNotes.has(note.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Notes */}
            {unpinnedNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                    Other Notes
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {unpinnedNotes.map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onClick={handleNoteClick}
                      onDelete={handleDeleteNote}
                      onTogglePin={handleTogglePin}
                      isUnlocked={unlockedNotes.has(note.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredNotes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No notes found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Note Editor Dialog */}
      <NoteEditor
        note={selectedNote}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedNote(null);
        }}
        onSave={handleSaveNote}
      />

      {/* Password Unlock Dialog */}
      <PasswordUnlockDialog
        isOpen={!!noteToUnlock}
        onClose={() => setNoteToUnlock(null)}
        onUnlock={handleUnlock}
      />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
