import React from 'react';
import { Card } from './ui/card';
import { Pin, Lock, Edit2, Trash2, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from './ui/button';
import { toast } from '../hooks/use-toast';

const NoteCard = ({ note, onClick, onDelete, onTogglePin, isUnlocked }) => {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete(note.id);
    }
  };

  const handleTogglePin = (e) => {
    e.stopPropagation();
    onTogglePin(note.id);
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    const textToCopy = `${note.title}\n\n${note.content}`;
    
    // Create temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = textToCopy;
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    
    try {
      // Select the text
      textarea.select();
      textarea.setSelectionRange(0, 99999); // For mobile devices
      
      // Copy the text
      const successful = document.execCommand('copy');
      
      // Remove the textarea
      document.body.removeChild(textarea);
      
      if (successful) {
        toast({
          title: "Copied!",
          description: "Note content copied to clipboard."
        });
      } else {
        toast({
          title: "Copy Failed",
          description: "Please try again or copy manually.",
          variant: "destructive"
        });
      }
    } catch (error) {
      // Clean up
      if (document.body.contains(textarea)) {
        document.body.removeChild(textarea);
      }
      console.error('Copy error:', error);
      toast({
        title: "Copy Failed",
        description: "Your browser may not support this feature.",
        variant: "destructive"
      });
    }
  };

  const isLocked = note.isPasswordProtected && !isUnlocked;

  return (
    <Card
      className="group relative cursor-pointer transition-all duration-200 hover:shadow-lg overflow-hidden"
      style={{
        backgroundColor: note.color || '#ffffff',
        borderColor: note.isPinned ? '#059669' : 'hsl(var(--border))'
      }}
      onClick={() => onClick(note)}
    >
      <div className="p-4">
        {/* Header with Pin and Lock icons */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 flex-1">
            {note.title || 'Untitled Note'}
          </h3>
          <div className="flex gap-1 ml-2">
            {note.isPinned && (
              <Pin className="w-4 h-4 text-emerald-600 fill-emerald-600" />
            )}
            {note.isPasswordProtected && (
              <Lock className="w-4 h-4 text-amber-600" />
            )}
          </div>
        </div>

        {/* Content Preview */}
        <div className="text-sm text-gray-700 mb-3">
          {isLocked ? (
            <div className="flex items-center gap-2 text-gray-500 italic">
              <Lock className="w-4 h-4" />
              <span>This note is password protected</span>
            </div>
          ) : (
            <div className="line-clamp-3 prose prose-sm max-w-none">
              <ReactMarkdown>{note.content || 'No content'}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="text-xs text-gray-500">
          {note.updated_at}
        </div>
      </div>

      {/* Action buttons on hover */}
      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-white/80 hover:bg-white"
          onClick={handleCopy}
          title="Copy note"
        >
          <Copy className="w-4 h-4 text-gray-600" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-white/80 hover:bg-white"
          onClick={handleTogglePin}
          title={note.isPinned ? 'Unpin note' : 'Pin note'}
        >
          <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-emerald-600 text-emerald-600' : 'text-gray-600'}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-white/80 hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
            onClick(note);
          }}
          title="Edit note"
        >
          <Edit2 className="w-4 h-4 text-gray-600" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-white/80 hover:bg-white hover:text-red-600"
          onClick={handleDelete}
          title="Delete note"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

export default NoteCard;
