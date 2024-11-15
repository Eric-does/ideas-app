'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Trash2, Heart, MessageSquare } from 'lucide-react';
import { supabase } from '../utils/supabase';

export default function IdeasApp() {
  const [userName, setUserName] = useState('');
  const [ideas, setIdeas] = useState([]);
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newIdeaDescription, setNewIdeaDescription] = useState('');
  const [isUserNameSet, setIsUserNameSet] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [expandedIdeaId, setExpandedIdeaId] = useState(null);

  useEffect(() => {
    async function fetchIdeas() {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching ideas:', error);
      } else {
        setIdeas(data || []);
      }
    }

    const channel = supabase
      .channel('ideas-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ideas' },
        (payload) => {
          fetchIdeas();
      })
      .subscribe();

    fetchIdeas();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const savedUserName = localStorage.getItem('userName');
    if (savedUserName) {
      setUserName(savedUserName);
      setIsUserNameSet(true);
    }
  }, []);

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

  const handleNewIdeaSubmit = async (e) => {
    e.preventDefault();
    if (newIdeaTitle.trim()) {
      try {
        const newIdea = {
          title: newIdeaTitle,
          description: newIdeaDescription || '',
          author: userName,
          votes: 0,
          voters: []
        };

        const { error } = await supabase
          .from('ideas')
          .insert([newIdea]);

        if (error) {
          console.error('Error details:', error);
          alert('Failed to submit idea. Please try again.');
        } else {
          setNewIdeaTitle('');
          setNewIdeaDescription('');
        }
      } catch (err) {
        console.error('Submission error:', err);
        alert('Failed to submit idea. Please try again.');
      }
    }
  };

  const handleVote = async (ideaId) => {
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;

    const hasVoted = idea.voters?.includes(userName);
    const newVoters = hasVoted 
      ? (idea.voters || []).filter(voter => voter !== userName)
      : [...(idea.voters || []), userName];
    
    const { error } = await supabase
      .from('ideas')
      .update({ 
        votes: hasVoted ? (idea.votes || 0) - 1 : (idea.votes || 0) + 1,
        voters: newVoters
      })
      .eq('id', ideaId);

    if (error) {
      console.error('Error updating vote:', error);
    }
  };

  const handleDelete = async (ideaId) => {
    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', ideaId);

    if (error) {
      console.error('Error deleting idea:', error);
    }
  };

  const handleCommentSubmit = async (ideaId, e) => {
    if (e && e.key === 'Enter') {
      e.preventDefault();
    } else if (e && e.type === 'keypress' && e.key !== 'Enter') {
      return;
    }
    
    if (newComment.trim()) {
      try {
        const newCommentObj = {
          idea_id: ideaId,
          text: newComment,
          author: userName,
          likes: 0,
          liked_by: []
        };

        const { error } = await supabase
          .from('comments')
          .insert([newCommentObj]);

        if (error) {
          console.error('Error details:', error);
          alert('Failed to submit comment. Please try again.');
        } else {
          setNewComment('');
        }
      } catch (err) {
        console.error('Comment submission error:', err);
        alert('Failed to submit comment. Please try again.');
      }
    }
  };

  const handleCommentDelete = async (ideaId, commentId) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const toggleExpand = (ideaId) => {
    setExpandedIdeaId(expandedIdeaId === ideaId ? null : ideaId);
  };

  const handleCommentLike = async (ideaId, commentId) => {
    const comment = ideas
      .find(i => i.id === ideaId)?.comments
      ?.find(c => c.id === commentId);
    
    if (!comment) return;

    const hasLiked = comment.liked_by?.includes(userName);
    const newLikedBy = hasLiked 
      ? (comment.liked_by || []).filter(liker => liker !== userName)
      : [...(comment.liked_by || []), userName];

    const { error } = await supabase
      .from('comments')
      .update({ 
        likes: hasLiked ? (comment.likes || 0) - 1 : (comment.likes || 0) + 1,
        liked_by: newLikedBy
      })
      .eq('id', commentId);

    if (error) {
      console.error('Error updating comment like:', error);
    }
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
                  <span>{idea.votes || 0}</span>
                </button>

                <button
                  onClick={() => toggleExpand(idea.id)}
                  className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <MessageSquare size={18} />
                  <span>{idea.comments?.length || 0}</span>
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

                  {idea.comments && [...idea.comments]
                    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
                    .map(comment => (
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
                                comment.liked_by?.includes(userName)
                                  ? 'text-red-500'
                                  : 'text-gray-400 hover:text-red-500'
                              }`}
                            >
                              <Heart size={16} />
                              <span className="text-sm">{comment.likes || 0}</span>
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
