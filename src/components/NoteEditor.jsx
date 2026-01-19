import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Eye, Edit, Pin, Lock, Palette, X, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Label } from './ui/label';
import { toast } from '../hooks/use-toast';

const colors = [
  '#ffffff', '#fef3c7', '#fecaca', '#fbcfe8', '#ddd6fe',
  '#bfdbfe', '#a7f3d0', '#d1fae5', '#fed7aa', '#fce7f3'
];

const NoteEditor = ({ note, isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [isPinned, setIsPinned] = useState(false);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('edit'); // 'edit' or 'preview'
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setColor(note.color || '#ffffff');
      setIsPinned(note.isPinned || false);
      setIsPasswordProtected(note.isPasswordProtected || false);
      setPassword('');
    } else {
      // New note
      setTitle('');
      setContent('');
      setColor('#ffffff');
      setIsPinned(false);
      setIsPasswordProtected(false);
      setPassword('');
    }
    setMode('edit');
  }, [note, isOpen]);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      toast({
        title: "Empty Note",
        description: "Please add a title or content to save the note.",
        variant: "destructive"
      });
      return;
    }

    const noteData = {
      title: title.trim(),
      content: content.trim(),
      color,
      isPinned,
      isPasswordProtected,
      password: password.trim()
    };

    onSave(noteData);
    onClose();
  };

  const togglePasswordProtection = () => {
    if (!isPasswordProtected) {
      setShowPasswordDialog(true);
    } else {
      setIsPasswordProtected(false);
      setPassword('');
    }
  };

  const handleSetPassword = () => {
    if (password.trim().length < 4) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 4 characters long.",
        variant: "destructive"
      });
      return;
    }
    setIsPasswordProtected(true);
    setShowPasswordDialog(false);
    toast({
      title: "Password Set",
      description: "Your note is now password protected."
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: color }}>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{note ? 'Edit Note' : 'New Note'}</span>
              <div className="flex items-center gap-2">
                {/* Mode Toggle */}
                <div className="flex gap-1 bg-gray-100 rounded-md p-1">
                  <Button
                    variant={mode === 'edit' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMode('edit')}
                    className="h-8"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant={mode === 'preview' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMode('preview')}
                    className="h-8"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Title Input */}
            <Input
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-semibold border-none shadow-none focus-visible:ring-0"
              style={{ backgroundColor: 'transparent' }}
            />

            {/* Content Area */}
            {mode === 'edit' ? (
              <Textarea
                placeholder="Write your markdown content here...\n\nSupported markdown:\n- **bold** or __bold__\n- *italic* or _italic_\n- # Heading\n- [Link](url)\n- ![Image](url)\n- - List item\n- > Quote\n- \`code\`"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] font-mono text-sm border-none shadow-none focus-visible:ring-0 resize-none"
                style={{ backgroundColor: 'transparent' }}
              />
            ) : (
              <div className="min-h-[400px] p-4 rounded-md border bg-white/50">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content || '*No content to preview*'}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                {/* Color Picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Palette className="w-4 h-4" />
                      Color
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto">
                    <div className="grid grid-cols-5 gap-2">
                      {colors.map((c) => (
                        <button
                          key={c}
                          className="w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform"
                          style={{
                            backgroundColor: c,
                            borderColor: color === c ? '#000' : '#ddd'
                          }}
                          onClick={() => setColor(c)}
                        />
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Pin Toggle */}
                <Button
                  variant={isPinned ? 'default' : 'outline'}
                  size="sm"
                  className="gap-2"
                  onClick={() => setIsPinned(!isPinned)}
                >
                  <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
                  {isPinned ? 'Pinned' : 'Pin'}
                </Button>

                {/* Password Protection */}
                <Button
                  variant={isPasswordProtected ? 'default' : 'outline'}
                  size="sm"
                  className="gap-2"
                  onClick={togglePasswordProtection}
                >
                  <Lock className="w-4 h-4" />
                  {isPasswordProtected ? 'Protected' : 'Protect'}
                </Button>
              </div>

              {/* Save/Cancel Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Check className="w-4 h-4 mr-2" />
                  Save Note
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Password Protection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password (min 4 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSetPassword()}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSetPassword}>
                Set Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NoteEditor;
