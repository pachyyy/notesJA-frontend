import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Lock } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const PasswordUnlockDialog = ({ isOpen, onClose, onUnlock }) => {
  const [password, setPassword] = useState('');

  const handleUnlock = () => {
    if (!password.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter the password.",
        variant: "destructive"
      });
      return;
    }
    onUnlock(password);
    setPassword('');
  };

  const handleClose = () => {
    setPassword('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-600" />
            Unlock Note
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="unlock-password">Enter Password</Label>
            <Input
              id="unlock-password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleUnlock}>
              Unlock
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordUnlockDialog;
