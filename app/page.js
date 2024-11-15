'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, MessageSquare, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function IdeasPage() {
  const [ideas, setIdeas] = useState([]);
  const [newIdea, setNewIdea] = useState('');
  const [newIdeaDescription, setNewIdeaDescription] = useState('');
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        // Fetch ideas
        const { data: ideasData, error: ideasError } = await supabase
          .from('ideas')
          .select('*')
          .order('created_at', { ascending: false });

        if (ideasError) throw ideasError;

        setIdeas(ideasData);
        setLoading(false);

        // Fetch comments
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select('*')
          .order('created_at', { ascending: true });

        if (commentsError) throw commentsError;

        // Group comments by idea_id
        const groupedComments = commentsData.reduce((acc, comment) => {
          if (!acc[comment.idea_id]) acc[comment.idea_id] = [];
          acc[comment.idea_id].push(comment);
          return acc;
        }, {});

        setComments(groupedComments);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('Failed to load ideas');
      }
    };

    fetchInitialData();

    // Set up real-time subscriptions
    const ideasSubscription = supabase
      .channel('ideas-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ideas'
      }, handleIdeasChange)
      .subscribe();

    const commentsSubscription = supabase
      .channel('comments-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments'
      }, handleCommentsChange)
      .subscribe();

    return () => {
      ideasSubscription.unsubscribe();
      commentsSubscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleIdeasChange = (payload) => {
    if (payload.eventType === 'INSERT') {
      setIdeas(prev => [payload.new, ...prev]);
    } else if (payload.eventType === 'DELETE') {
      setIdeas(prev => prev.filter(idea => idea.id !== payload.old.id));
    } else if (payload.eventType === 'UPDATE') {
      setIdeas(prev => prev.map(idea => 
        idea.id === payload.new.id ? { ...idea, ...payload.new } : idea
      ));
    }
  };

  const handleCommentsChange = (payload) => {
    if (payload.eventType === 'INSERT') {
      setComments(prev => ({
        ...prev,
        [payload.new.idea_id]: [...(prev[payload.new.idea_id] || []), payload.new]
      }));
    } else if (payload.eventType === 'DELETE') {
      setComments(prev => ({
        ...prev,
        [payload.old.idea_id]: prev[payload.old.idea_id]?.filter(
          comment => comment.id !== payload.old.id
        )
      }));
    }
  };

  const submitIdea = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to submit an idea');
      return;
    }

    if (!newIdea.trim() || !newIdeaDescription.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const newIdeaObj = {
      id: crypto.randomUUID(),
      title: newIdea,
      description: newIdeaDescription,
      user_id: user.id,
      created_at: new Date().toISOString(),
      votes: 0
    };

    // Optimistic update
    setIdeas(prev => [newIdeaObj, ...prev]);

    try {
      const { error } = await supabase
        .from('ideas')
        .insert([{
          title: newIdea,
          description: newIdeaDescription,
          user_id: user.id,
          votes: 0
        }]);

      if (error) throw error;

      setNewIdea('');
      setNewIdeaDescription('');
      toast.success('Idea submitted successfully!');
    } catch (error) {
      // Rollback optimistic update
      setIdeas(prev => prev.filter(idea => idea.id !== newIdeaObj.id));
      toast.error('Failed to submit idea');
      console.error('Error submitting idea:', error);
    }
  };

  const submitComment = async (ideaId) => {
    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }

    const commentText = newComments[ideaId]?.trim();
    if (!commentText) {
      toast.error('Please enter a comment');
      return;
    }

    const newComment = {
      id: crypto.randomUUID(),
      idea_id: ideaId,
      user_id: user.id,
      content: commentText,
      created_at: new Date().toISOString()
    };

    // Optimistic update
    setComments(prev => ({
      ...prev,
      [ideaId]: [...(prev[ideaId] || []), newComment]
    }));

    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          idea_id: ideaId,
          user_id: user.id,
          content: commentText
        }]);

      if (error) throw error;

      setNewComments(prev => ({ ...prev, [ideaId]: '' }));
      toast.success('Comment added successfully!');
    } catch (error) {
      // Rollback optimistic update
      setComments(prev => ({
        ...prev,
        [ideaId]: prev[ideaId].filter(comment => comment.id !== newComment.id)
      }));
      toast.error('Failed to add comment');
      console.error('Error submitting comment:', error);
    }
  };

  const toggleVote = async (ideaId, currentVotes) => {
    if (!user) {
      toast.error('Please sign in to vote');
      return;
    }

    // Optimistic update
    setIdeas(prev => prev.map(idea =>
      idea.id === ideaId
        ? { ...idea, votes: currentVotes + 1 }
        : idea
    ));

    try {
      const { error } = await supabase
        .from('ideas')
        .update({ votes: currentVotes + 1 })
        .eq('id', ideaId);

      if (error) throw error;
    } catch (error) {
      // Rollback optimistic update
      setIdeas(prev => prev.map(idea =>
        idea.id === ideaId
          ? { ...idea, votes: currentVotes }
          : idea
      ));
      toast.error('Failed to update vote');
      console.error('Error toggling vote:', error);
    }
  };

  const deleteIdea = async (ideaId) => {
    if (!user) {
      toast.error('Please sign in to delete');
      return;
    }

    const ideaToDelete = ideas.find(idea => idea.id === ideaId);
    
    // Optimistic update
    setIdeas(prev => prev.filter(idea => idea.id !== ideaId));

    try {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', ideaId)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Idea deleted successfully!');
    } catch (error) {
      // Rollback optimistic update
      setIdeas(prev => [...prev, ideaToDelete]);
      toast.error('Failed to delete idea');
      console.error('Error deleting idea:', error);
    }
  };

  const deleteComment = async (commentId, ideaId) => {
    if (!user) {
      toast.error('Please sign in to delete');
      return;
    }

    const commentToDelete = comments[ideaId]?.find(comment => comment.id === commentId);

    // Optimistic update
    setComments(prev => ({
      ...prev,
      [ideaId]: prev[ideaId].filter(comment => comment.id !== commentId)
    }));

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Comment deleted successfully!');
    } catch (error) {
      // Rollback optimistic update
      setComments(prev => ({
        ...prev,
        [ideaId]: [...prev[ideaId], commentToDelete]
      }));
      toast.error('Failed to delete comment');
      console.error('Error deleting comment:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <form onSubmit={submitIdea} className="space-y-4">
        <Input
          placeholder="Your idea title"
          value={newIdea}
          onChange={(e) => setNewIdea(e.target.value)}
          className="w-full"
        />
        <Textarea
          placeholder="Describe your idea..."
          value={newIdeaDescription}
          onChange={(e) => setNewIdeaDescription(e.target.value)}
          className="w-full"
        />
        <Button type="submit" className="w-full">Submit Idea</Button>
      </form>

      <div className="space-y-4">
        {ideas.map((idea) => (
          <Card key={idea.id} className="w-full">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{idea.title}</h3>
                  <p className="text-gray-600">{idea.description}</p>
                </div>
                {user?.id === idea.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteIdea(idea.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleVote(idea.id, idea.votes || 0)}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  {idea.votes || 0}
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {(comments[idea.id] || []).length}
                </Button>
              </div>

              <div className="space-y-4">
                {comments[idea.id]?.map((comment) => (
                  <div key={comment.id} className="flex justify-between items-start bg-gray-50 p-3 rounded">
                    <p>{comment.content}</p>
                    {user?.id === comment.user_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteComment(comment.id, idea.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                <div className="flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={newComments[idea.id] || ''}
                    onChange={(e) => setNewComments(prev => ({
                      ...prev,
                      [idea.id]: e.target.value
                    }))}
                  />
                  <Button onClick={() => submitComment(idea.id)}>
                    Comment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
