'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Folder {
  _id: string;
  name: string;
  parentId?: string;
  children: Folder[];
}

const FolderTraversal: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [newFolderName, setNewFolderName] = useState<string>('');

  useEffect(() => {
    fetchRootFolders();
  }, []);

  const fetchRootFolders = async () => {
    const response = await axios.get<{ success: boolean; data: Folder[] }>('/api/folders');
    setFolders(response.data.data.filter(folder => !folder.parentId));
  };

  const fetchFolderById = async (id: string) => {
    const response = await axios.get<{ success: boolean; data: Folder }>(`/api/folders/${id}`);
    setCurrentFolder(response.data.data);
  };

  const createFolder = async () => {
    const response = await axios.post<{ success: boolean; data: Folder }>('/api/folders', { name: newFolderName, parentId: currentFolder ? currentFolder._id : null });
    if (currentFolder) {
      fetchFolderById(currentFolder._id);
    } else {
      fetchRootFolders();
    }
    setNewFolderName('');
  };

  const deleteFolder = async (id: string) => {
    await axios.delete<{ success: boolean; data: {} }>(`/api/folders/${id}`);
    if (currentFolder) {
      fetchFolderById(currentFolder._id);
    } else {
      fetchRootFolders();
    }
  };

  return (
    <div>
      <h1>Folder Traversal</h1>
      <div>
        {currentFolder ? (
          <button onClick={() => setCurrentFolder(null)}>Back to Root</button>
        ) : null}
        {currentFolder ? (
          <h2>Current Folder: {currentFolder.name}</h2>
        ) : (
          <h2>Root Folders</h2>
        )}
        <ul>
          {(currentFolder ? currentFolder.children : folders).map(folder => (
            <li key={folder._id}>
              <span onClick={() => fetchFolderById(folder._id)}>{folder.name}</span>
              <button onClick={() => deleteFolder(folder._id)}>Delete</button>
            </li>
          ))}
        </ul>
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="New Folder Name"
        />
        <button onClick={createFolder}>Create Folder</button>
      </div>
    </div>
  );
};

export default FolderTraversal;
