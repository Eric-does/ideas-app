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
  const [expandedIdeaId, setExpandedIdeaId] = useState(null);

  useEffect(() => {
    const savedIdeas = localStorage.getItem('ideas');
    if (savedIdeas) {
      setIdeas(JSON.parse(savedIdeas));
    }
    const savedUserName = localStorage.getItem('userName');
    if (savedUserName) {
      setUserName(savedUserName);
      setIsUserNameSet(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ideas', JSON.stringify(ideas));
  }, [ideas]);

  useEffect(() => {
    if (userName) {
      localStorage.setItem('userName', userName);
    }
  }, [userName]);

  const handleUserNameSubmit = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      setIsUserNameSet(true);
    }
  };

  const handleNewIdeaSubmit = (e) => {
    e.preventDefault();
    if (newIdeaTitle.trim()) {
      const newIdea = {
        id: Date.now(),
        title: newIdeaTitle,
        description: newIdeaDescription,
        votes: 0,
        voters: [],
        comments: [],
        author: userName
      };
      setIdeas([...ideas, newIdea]);
      setNewIdeaTitle('');
      setNewIdeaDescription('');
    }
  };

  const handleVote = (ideaId) => {
    setIdeas(ideas.map(idea => {
      if (idea.id === ideaId) {
        const hasVoted = idea.voters.includes(userName);
        return {
          ...idea,
          votes: hasVoted ? idea.votes - 1 : idea.votes + 1,
          voters: hasVoted 
            ? idea.voters.filter(voter => voter !== userName)
            : [...idea.voters, userName]
        };
      }
      return idea;
    }));
  };

  const handleDelete = (ideaId) => {
    setIdeas(ideas.filter(idea => idea.id !== ideaId));
  };

  const handleCommentSubmit = (ideaId, e) => {
    if (e && e.key === 'Enter') {
      e.preventDefault();
    } else if (e && e.type === 'keypress' && e.key !== 'Enter') {
      return;
    }
    
    if (newComment.trim()) {
      setIdeas(ideas.map(idea => {
        if (idea.id === ideaId) {
          const newCommentObj = {
            id: Date.now(),
            text: newComment,
            author: userName,
            likes: 0,
            likedBy: []
          };
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

  const handleCommentDelete = (ideaId, commentId) => {
    setIdeas(ideas.map(idea => {
      if (idea.id === ideaId) {
        return {
          ...idea,
          comments: idea.comments.filter(comment => comment.id !== commentId)
        };
      }
      return idea;
    }));
  };

  const toggleExpand = (ideaId) => {
    setExpandedIdeaId(expandedIdeaId === ideaId ? null : ideaId);
  };

  const handleCommentLike = (ideaId, commentId) => {
    setIdeas(ideas.map(idea => {
      if (idea.id === ideaId) {
        return {
          ...idea,
          comments: idea.comments.map(comment => {
            if (comment.id === commentId) {
              const hasLiked = comment.likedBy.includes(userName);
              return {
                ...comment,
                likes: hasLiked ? comment.likes - 1 : comment.likes + 1,
                likedBy: hasLiked 
                  ? comment.likedBy.filter(liker => liker !== userName)
                  : [...comment.likedBy, userName]
              };
            }
            return comment;
          })
        };
      }
      return idea;
    }));
  };

  if (!isUserNameSet) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleUserNameSubmit} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Welcome to Ideas Hub</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Get Started
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-semibold mb-6 text-gray-800">Idea Submission and Voting</h1>
          
          <form onSubmit={handleNewIdeaSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={newIdeaTitle}
                onChange={(e) => setNewIdeaTitle(e.target.value)}
                placeholder="New Idea Title"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              />
            </div>
            <div>
              <textarea
                value={newIdeaDescription}
                onChange={(e) => setNewIdeaDescription(e.target.value)}
                placeholder="New Idea Description (optional)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none h-24"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Submit Idea
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {ideas.map(idea => (
            <div key={idea.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-800">{idea.title}</h2>
                  {idea.description && (
                    <p className="mt-2 text-gray-600">{idea.description}</p>
                  )}
                  <p className="mt-2 text-sm text-gray-500">Submitted by {idea.author}</p>
                </div>
                {idea.author === userName && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleDelete(idea.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center space-x-4">
                <button
                  onClick={() => handleVote(idea.id)}
                  className="flex items-center space-x-1 px-3 py-1 rounded-md transition-all bg-blue-100 text-blue-600 hover:font-bold"
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

                  {idea.comments.map(comment => (
                    <div key={comment.id} className="bg-gray-50 rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-gray-800">{comment.text}</p>
                          <p className="mt-1 text-sm text-gray-500">
                            By {comment.author}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCommentLike(idea.id, comment.id)}
                            className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors ${
                              comment.likedBy.includes(userName)
                                ? 'text-red-500'
                                : 'text-gray-400 hover:text-red-500'
                            }`}
                          >
                            <Heart size={16} />
                            <span className="text-sm">{comment.likes}</span>
                          </button>
                          {comment.author === userName && (
                            <button
                              onClick={() => handleCommentDelete(idea.id, comment.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md"
                              title="Delete comment"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
