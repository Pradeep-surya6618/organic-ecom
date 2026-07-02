import React, { createContext, useContext, useState, useEffect } from 'react';

const ContentContext = createContext();

const initialContent = [
  { id: 1, title: "Farm Fresh in 10 Minutes", location: "Homepage Hero Banner", type: "Active Banner", detail: "Updated 2h ago" },
  { id: 2, title: "5 ways to make greens last", location: "Healthy Living Blog", type: "Lifestyle Tip", detail: "Published Jun 8" },
  { id: 3, title: "Make leafy greens last all week", tag: "Kitchen notes", type: "Blog Story", date: "5 min read", image: "https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=900&q=82" },
  { id: 4, title: "Inside a regenerative family farm", tag: "Meet the grower", type: "Blog Story", date: "7 min read", image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=82" },
  { id: 5, title: "Build a brighter everyday pantry", tag: "Wellness", type: "Blog Story", date: "4 min read", image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=82" }
];

export const ContentProvider = ({ children }) => {
  const [contents, setContents] = useState(() => {
    try {
      const stored = localStorage.getItem('organic_content');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading organic_content from localStorage:', e);
    }
    localStorage.setItem('organic_content', JSON.stringify(initialContent));
    return initialContent;
  });

  useEffect(() => {
    localStorage.setItem('organic_content', JSON.stringify(contents));
  }, [contents]);

  const addContent = (newContent) => {
    setContents((prev) => [
      ...prev,
      {
        ...newContent,
        id: prev.length > 0 ? Math.max(...prev.map(c => c.id)) + 1 : 1,
        detail: newContent.detail || `Published ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      }
    ]);
  };

  const updateContent = (id, updatedContent) => {
    setContents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedContent } : c))
    );
  };

  const deleteContent = (id) => {
    setContents((prev) => prev.filter((c) => c.id !== id));
  };

  const banners = contents.filter(c => c.type === "Active Banner" || c.type === "Lifestyle Tip");
  const blogStories = contents.filter(c => c.type === "Blog Story");

  return (
    <ContentContext.Provider
      value={{
        contents,
        banners,
        blogStories,
        addContent,
        updateContent,
        deleteContent
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
