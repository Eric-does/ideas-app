'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Trash2, Heart, MessageSquare } from 'lucide-react';

export default function IdeasApp() {
  const [userName, setUserName] = useState('');
  const [ideas, setIdeas] = useState([]);
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newIdeaDescription, setNewIdeaDescription] = useState('');
  const [isUserNameSet, setIsUserNameSet] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [expandedIdeaId, setExpandedIdeaId] = useState(null); // New state for tracking expanded idea

  // Modified toggleExpand function
  const toggleExpand = (ideaId) => {
    setExpandedIdeaId(expandedIdeaId === ideaId ? null : ideaId);
  };

  // Modified handleCommentSubmit to include keyboard support
  const handleCommentSubmit = (ideaId, e) => {
    // If event exists and it's not an Enter key press, return early
    if (e && e.key === 'Enter') {
      e.preventDefault();
    } else if (e && e.type === 'keypress' && e.key !== 'Enter') {
      return;
    }
    
    if (newComment.trim()) {
      const newCommentObj = {
        id: Date.now(),
        text: newComment,
        author: userName,
        likes: 0,
        likedBy: []
      };
      
      setIdeas(prevIdeas => prevIdeas.map(idea => {
        if (idea.id === ideaId) {
          return {
            ...idea,
            comments: [...idea.comments, newCommentObj]
          };
        }
        return idea;
      }));
      setNewComment('');
    }
  };

  // The rest of your state and handlers remain the same...
  // [Previous state and handler code here]

  // Modified JSX to use expandedIdeaId instead of individual idea.isExpanded
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* ... other JSX remains the same ... */}
      
      <div className="space-y-4">
        {ideas.map(idea => (
          <div key={idea.id} className="bg-white rounded-lg shadow-md p-6">
            {/* ... idea header remains the same ... */}

            <div className="mt-4 flex items-center space-x-4">
              <button
                onClick={() => handleVote(idea.id)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${
                  idea.voters.includes(userName)
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <ChevronUp size={18} />
                <span>{idea.votes}</span>
              </button>

              <button
                onClick={() => toggleExpand(idea.id)}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <MessageSquare size={18} />
                <span>{idea.comments.length}</span>
                {expandedIdeaId === idea.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            {expandedIdeaId === idea.id && (
              <div className="mt-4 space-y-4">
                <div className="border-t pt-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => handleCommentSubmit(idea.id, e)}
                      placeholder="Add a comment..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    />
                    <button
                      onClick={() => handleCommentSubmit(idea.id)}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Comment
                    </button>
                  </div>
                </div>

                {/* ... comments rendering remains the same ... */}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
