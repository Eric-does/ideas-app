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

  useEffect(() => {
    const savedIdeas = localStorage.getItem('ideas');
    if (savedIdeas) {
      setIdeas(JSON.parse(savedIdeas));
    }
  }, []);

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

  const startEditingIdea = (index) => {
    setEditingIdea(index);
    setEditingIdeaTitle(ideas[index].title);
    setEditingIdeaDescription(ideas[index].description);
  };

  const saveIdeaEdit = (index) => {
    if (editingIdeaTitle.trim()) {
      const updatedIdeas = [...ideas];
      updatedIdeas[index] = {
        ...updatedIdeas[index],
        title: editingIdeaTitle,
        description: editingIdeaDescription
      };
      setIdeas(updatedIdeas);
      setEditingIdea(null);
      setEditingIdeaTitle('');
      setEditingIdeaDescription('');
    }
  };

  const deleteIdea = (index) => {
    const updatedIdeas = [...ideas];
    updatedIdeas.splice(index, 1);
    setIdeas(updatedIdeas);
    if (expandedIndex === index) {
      setExpandedIndex(-1);
    }
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? -1 : index);
  };

  const addComment = (index) => {
    if (isNameSubmitted && newCommentText.trim()) {
      const updatedIdeas = [...ideas];
      updatedIdeas[index].comments.push({
        name: userName,
        text: newCommentText,
        likes: 0,
        likedUsers: []
      });
      setIdeas(updatedIdeas);
      setNewCommentText('');
    }
  };

  const likeComment = (ideaIndex, commentIndex) => {
    if (isNameSubmitted) {
      const updatedIdeas = [...ideas];
      const comment = updatedIdeas[ideaIndex].comments[commentIndex];
      if (!comment.likedUsers.includes(userName)) {
        comment.likes++;
        comment.likedUsers.push(userName);
      } else {
        comment.likes--;
        comment.likedUsers = comment.likedUsers.filter(name => name !== userName);
      }
      setIdeas(updatedIdeas);
    }
  };

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
            <>
              <div className="mb-4">
                <Input
                  placeholder="New Idea Title"
                  value={newIdeaTitle}
                  onChange={(e) => setNewIdeaTitle(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') submitIdea();
                  }}
                />
                <Input
                  placeholder="New Idea Description (optional)"
                  value={newIdeaDescription}
                  onChange={(e) => setNewIdeaDescription(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') submitIdea();
                  }}
                />
                <Button onClick={submitIdea}>Submit Idea</Button>
              </div>
              {ideas.map((idea, index) => (
                <Card key={index} className="mb-4">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {editingIdea === index ? (
                          <div>
                            <Input
                              value={editingIdeaTitle}
                              onChange={(e) => setEditingIdeaTitle(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') saveIdeaEdit(index);
                              }}
                            />
                            <Input
                              value={editingIdeaDescription}
                              onChange={(e) => setEditingIdeaDescription(e.target.value)}
                              placeholder="Description (optional)"
                              className="mt-2"
                            />
                            <div className="flex gap-2 mt-2">
                              <Button onClick={() => saveIdeaEdit(index)} size="sm">
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => setEditingIdea(null)}
                                className="bg-gray-500 hover:bg-gray-600"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h2 className="text-xl font-bold">{idea.title}</h2>
                            {idea.description && <p className="mt-2">{idea.description}</p>}
                          </>
                        )}
                        <span className="text-gray-500 text-sm">Submitted by {idea.submittedBy}</span>
                      </div>
                      {idea.submittedBy === userName && editingIdea !== index && (
                        <div className="flex gap-2">
                          <button
                            className="text-blue-500 hover:text-blue-700"
                            onClick={() => startEditingIdea(index)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => deleteIdea(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Button
                        onClick={() => upvoteIdea(index)}
                        className={idea.votedUsers.includes(userName) ? 'bg-blue-700' : ''}
                      >
                        Upvote ({idea.votes})
                      </Button>
                      <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => toggleExpand(index)}
                      >
                        {expandedIndex === index ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {expandedIndex === index && (
                      <div className="mt-4">
                        <div>
                          <Input
                            placeholder="Leave a Comment"
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') addComment(index);
                            }}
                          />
                          <Button onClick={() => addComment(index)}>Comment</Button>
                        </div>
                        {idea.comments.length > 0 && (
                          <div className="mt-4">
                            <h3 className="font-medium mb-2">Comments</h3>
                            {idea.comments.map((comment, commentIndex) => (
                              <div key={commentIndex} className="bg-gray-100 p-2 mb-2 rounded">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">Comment by {comment.name}</span>
                                  <button
                                    className={`text-red-500 hover:text-red-700 ${
                                      comment.likedUsers.includes(userName) ? 'font-bold' : ''
                                    }`}
                                    onClick={() => likeComment(index, commentIndex)}
                                  >
                                    <Heart className="w-4 h-4 inline-block mr-1" />
                                    {comment.likes}
                                  </button>
                                </div>
                                <p>{comment.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IdeaSubmissionApp;
