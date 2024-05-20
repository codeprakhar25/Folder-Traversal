'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFolder, FaFolderOpen, FaTimes } from 'react-icons/fa';

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

  const fetchChildrenFolders = async (id: string) => {
    const response = await axios.get<{ success: boolean; data: Folder[] }>(`/api/folders/${id}/children`);
    const folderIndex = folders.findIndex(folder => folder._id === id);
    const updatedFolders = [...folders];
    updatedFolders[folderIndex].children = response.data.data;
    setFolders(updatedFolders);
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

  const renderFolders = (folders: Folder[], level = 0) => {
    return (
      <ul className={`ml-${level * 4} list-none`}>
        {folders.map(folder => (
          <>
            <li key={folder._id} className="flex items-center my-1">
              {folder.children && folder.children.length > 0 ? (
                <FaFolderOpen className="mr-2 cursor-pointer" onClick={() => {
                    fetchChildrenFolders(folder._id);
                    setCurrentFolder(folder);
                }} />
              ) : (
                <FaFolder className="mr-2 cursor-pointer" onClick={() => {
                  if (folder.children.length === 0) { 
                    fetchChildrenFolders(folder._id);
                  } else {
                    setCurrentFolder(folder);
                  }
                }} />
              )}
              <span className="cursor-pointer" onClick={() => fetchFolderById(folder._id)}>{folder.name}</span>
              <FaTimes className="ml-2 text-red-500 cursor-pointer" onClick={() => deleteFolder(folder._id)} />
            </li>
            {folder.children && folder.children.length > 0 && renderFolders(folder.children, level + 1)}
          </>
        ))}
      </ul>
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Folder Traversal</h1>
      <div className="mt-4">
        <input
          type="text"
          className="border p-2"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="New Folder Name"
        />
        <button className="ml-2 p-2 bg-blue-500 text-white" onClick={createFolder}>Create Folder</button>
      </div>
      <div className="mt-4">
        {currentFolder ? (
          <button className="mb-2" onClick={() => setCurrentFolder(null)}>Back</button>
        ) : null}
        {currentFolder ? (
          <h2 className="text-lg font-semibold">Current Folder: {currentFolder.name}</h2>
        ) : (
          <h2 className="text-lg font-semibold">Root Folders</h2>
        )}
        <div className="mt-2">
          {renderFolders(currentFolder ? currentFolder.children : folders)}
        </div>

      </div>
    </div>
  );
};

export default FolderTraversal;
