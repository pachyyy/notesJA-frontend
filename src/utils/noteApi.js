import api from './api';

export const getNotes = async () => {
  try {
    const response = await api.get('/notes');
    return response.data;
  } catch (error) {
    console.error('Error loading notes:', error);
    return [];
  }
};

export const createNote = async (note) => {
  try {
    const response = await api.post('/notes', note);
    return response.data;
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
};

export const updateNote = async (noteId, updates) => {
  try {
    const response = await api.put(`/notes/${noteId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
};

export const deleteNote = async (noteId) => {
  try {
    await api.delete(`/notes/${noteId}`);
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};
