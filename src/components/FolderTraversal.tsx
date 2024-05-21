'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFolder, FaFolderOpen, FaTimes, FaEdit } from 'react-icons/fa';

interface Folder {
  _id: string;
  name: string;
  parentId?: string;
}

const FolderTraversal: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<{ [key: string]: Folder[] }>({});
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [editFolderName, setEditFolderName] = useState<string>('');
  const [notification, setNotification] = useState<string>('');

  useEffect(() => {
    fetchRootFolders();
  }, []);

  const fetchRootFolders = async () => {
    const response = await axios.get<{ success: boolean; data: Folder[] }>('/api/folders');
    setFolders(response.data.data.filter(folder => !folder.parentId));
  };

  const fetchChildrenFolders = async (id: string) => {
    const response = await axios.get<{ success: boolean; data: Folder[] }>(`/api/folders/${id}/children`);
    setExpandedFolders(prev => ({ ...prev, [id]: response.data.data }));
  };

  const createFolder = async () => {
    try {
      const response = await axios.post<{ success: boolean; data: Folder }>('/api/folders', { name: newFolderName, parentId: currentFolder ? currentFolder._id : null });
      setNotification('Folder created successfully.');
      if (currentFolder) {
        fetchChildrenFolders(currentFolder._id);
      } else {
        fetchRootFolders();
      }
      setNewFolderName('');
    } catch (error) {
      console.error('Error creating folder:', error);
      setNotification('Error creating folder.');
    }
  };

  const editFolder = async (id: string, newName: string) => {
    try {
      const response = await axios.put<{ success: boolean; data: Folder }>(`/api/folders/${id}`, { name: newName });
      setNotification('Folder edited successfully.');
      setEditingFolder(null);
      setEditFolderName('');

      // Update the folder name in the state directly
      setFolders(prevFolders => prevFolders.map(folder => folder._id === id ? { ...folder, name: newName } : folder));
      setExpandedFolders(prevExpanded => {
        const updated = { ...prevExpanded };
        Object.keys(updated).forEach(key => {
          updated[key] = updated[key].map(folder => folder._id === id ? { ...folder, name: newName } : folder);
        });
        return updated;
      });
    } catch (error) {
      console.error('Error editing folder:', error);
      setNotification('Error editing folder.');
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      await axios.delete<{ success: boolean; data: {} }>(`/api/folders/${id}`);
      setNotification('Folder deleted successfully.');
      if (currentFolder) {
        fetchChildrenFolders(currentFolder._id);
      } else {
        fetchRootFolders();
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      setNotification('Error deleting folder.');
    }
  };

  const toggleFolder = (folder: Folder) => {
    if (expandedFolders[folder._id]) {
      setExpandedFolders(prev => {
        const updated = { ...prev };
        delete updated[folder._id];
        return updated;
      });
    } else {
      fetchChildrenFolders(folder._id);
    }
    setCurrentFolder(folder);
  };

  const renderFolders = (folders: Folder[], level = 0) => {
    return (
      <ul className={`list-none ${level === 0 ? '' : 'ml-4'}`}>
        {folders.map(folder => (
          <div key={folder._id} className="mb-2">
            <li
              className="flex items-center p-2 bg-gray-100 border rounded hover:bg-gray-200 cursor-pointer"
              onClick={() => toggleFolder(folder)}
            >
              {expandedFolders[folder._id] ? (
                <FaFolderOpen className="mr-2" />
              ) : (
                <FaFolder className="mr-2" />
              )}
              <span className="flex-1">{folder.name}</span>
              <FaEdit className="mr-2 text-blue-500 hover:text-blue-700" onClick={(e) => {
                e.stopPropagation();
                setEditingFolder(folder);
                setEditFolderName(folder.name);
              }} />
              <FaTimes className="text-red-500 hover:text-red-700" onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to delete this folder?')) {
                  deleteFolder(folder._id);
                }
              }} />
            </li>
            {expandedFolders[folder._id] && renderFolders(expandedFolders[folder._id], level + 1)}
          </div>
        ))}
      </ul>
    );
  };

  return (
    <div className="p-4 bg-white border rounded shadow-md">
      <h1 className="text-xl font-bold mb-4">Folder Traversal</h1>
      {notification && <div className="mt-2 text-green-500">{notification}</div>}
      <div className="flex items-center mb-4">
        <input
          type="text"
          className="border p-2 flex-1 mr-2 rounded"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="New Folder Name"
        />
        <button className="p-2 bg-blue-500 text-white rounded" onClick={createFolder}>Create Folder</button>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">Root Folders</h2>
        {currentFolder && (
          <div className="mt-4">
            <p className="font-semibold mb-2">Current Folder: {currentFolder.name}</p>
          </div>
        )}
        {renderFolders(folders)}
      </div>
      {editingFolder && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-4 border rounded shadow-md">
            <h2 className="text-lg font-semibold mb-4">Edit Folder</h2>
            <input
              type="text"
              className="border p-2 mb-4 w-full rounded"
              value={editFolderName}
              onChange={(e) => setEditFolderName(e.target.value)}
              placeholder="Folder Name"
            />
            <div className="flex justify-end">
              <button
                className="p-2 bg-gray-500 text-white rounded mr-2"
                onClick={() => setEditingFolder(null)}
              >
                Cancel
              </button>
              <button
                className="p-2 bg-blue-500 text-white rounded"
                onClick={() => editFolder(editingFolder._id, editFolderName)}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderTraversal;
