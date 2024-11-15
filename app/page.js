'use client';

// ... all imports remain the same ...

export default function IdeasApp() {
  // ... all previous state and most functions remain the same ...

  // Add new function to handle comment deletion
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

  // ... all other existing code remains the same until the comment rendering section ...

  // In the return statement, update the comment rendering section:
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
