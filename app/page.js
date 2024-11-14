'use client';

import React, { useState, useEffect } from 'react';
import { Heart, ChevronDown, ChevronUp, Edit2, Trash2, X, Check } from 'lucide-react';

// Simple styled components using Tailwind
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`}>{children}</div>
);

const CardHeader = ({ children }) => (
  <div className="px-6 py-4 border-b">{children}</div>
);

const CardContent = ({ children }) => (
  <div className="px-6 py-4">{children}</div>
);

const Input = ({ className = '', ...props }) => (
  <input
    className={`w-full px-3 py-2 border rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
);

const Button = ({ className = '', ...props }) => (
  <button
    className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
);

const IdeaSubmissionApp = () => {
  const [ideas, setIdeas] = useState([]);
  const [userName, setUserName] = useState('');
  const [isNameSubmitted, setIsNameSubmitted] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newIdeaDescription, setNewIdeaDescription] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(-1);
  const [editingIdea, setEditingIdea] = useState(null);
  const [editingIdeaTitle, setEditingIdeaTitle] = useState('');
  const [editingIdeaDescription, setEditingIdeaDescription] = useState('');
  const [editingComment, setEditingComment] = useState({ ideaIndex: null, commentIndex: null });
  const [editingCommentText, setEditingCommentText] = useState('');

  // Load ideas from localStorage on initial render
  useEffect(() => {
    const savedIdeas = localStorage.getItem('ideas');
    if (savedIdeas) {
      setIdeas(JSON.parse(savedIdeas));
    }
  }, []);

  // Save ideas to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ideas', JSON.stringify(ideas));
  }, [ideas]);

  const submitName = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (userName.trim()) {
        setIsNameSubmitted(true);
        localStorage.setItem('userName', userName);
      }
    }
  };

  const submitIdea = () => {
    if (isNameSubmitted && newIdeaTitle.trim()) {
      setIdeas([
        ...ideas,
        {
          title: newIdeaTitle,
          description: newIdeaDescription.trim(),
          submittedBy: userName,
          votes: 0,
          votedUsers: [],
          comments: []
        }
      ]);
      setNewIdeaTitle('');
      setNewIdeaDescription('');
    }
  };

  // ... (keep all the other functions from the previous version)

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Idea Submission and Voting</h1>
        </CardHeader>
        <CardContent>
          {!isNameSubmitted ? (
            <div className="mb-4">
              <Input
                placeholder="Enter Your Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={submitName}
              />
              <Button onClick={submitName}>Submit</Button>
            </div>
          ) : (
            // ... (keep the rest of the JSX from the previous version, but replace shadcn components with our simple ones)
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IdeaSubmissionApp;
