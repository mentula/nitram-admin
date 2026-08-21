import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useBlogPosts, useCreateBlogPost, useUpdateBlogPost } from '@/lib/hooks/useBlog';
import { BlogPostList } from '@/components/admin/blog/BlogPostList';
import { BlogPostForm } from '@/components/admin/blog/BlogPostForm';
import { BlogCategoryManager } from '@/components/admin/blog/BlogCategoryManager';
import { BlogTagManager } from '@/components/admin/blog/BlogTagManager';
import { BlogAuthorManager } from '@/components/admin/blog/BlogAuthorManager';
import { KPICard } from '@/components/admin/KPICard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
  FileText,
  CheckCircle,
  FileEdit,
  Eye,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/blog/')({
  component: BlogAdminPage,
});

function BlogAdminPage() {
  const navigate = useNavigate();
  const { data: posts } = useBlogPosts();
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();

  const [activeTab, setActiveTab] = useState('posts');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<any>(null);

  // Calculate KPIs
  const totalPosts = posts?.length || 0;
  const publishedPosts = posts?.filter(p => p.published).length || 0;
  const draftPosts = posts?.filter(p => !p.published).length || 0;
  const totalViews = posts?.reduce((sum, p) => sum + p.view_count, 0) || 0;

  const handleCreatePost = () => {
    setEditingPostId(null);
    setEditingPost(null);
    setDialogOpen(true);
  };

  const handleEditPost = async (postId: string) => {
    setEditingPostId(postId);
    
    // Fetch post data (would normally come from a hook)
    // For now, find it in the list
    const post = posts?.find(p => p.id === postId);
    if (post) {
      setEditingPost(post);
      setDialogOpen(true);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingPostId) {
        await updatePost.mutateAsync({
          id: editingPostId,
          updates: data,
          tagIds: data.tagIds,
        });
        toast.success('Post updated successfully');
      } else {
        await createPost.mutateAsync({
          post: data,
          tagIds: data.tagIds,
        });
        toast.success('Post created successfully');
      }
      setDialogOpen(false);
      setEditingPostId(null);
      setEditingPost(null);
    } catch (error) {
      toast.error(editingPostId ? 'Failed to update post' : 'Failed to create post');
    }
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setEditingPostId(null);
    setEditingPost(null);
  };

  return (
    <ProtectedRoute requiredRole={['super_admin', 'manager', 'content_manager']}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
              <p className="text-gray-600 mt-1">
                Create and manage blog posts, categories, tags, and authors
              </p>
            </div>
            <Button onClick={handleCreatePost}>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Total Posts"
              value={totalPosts}
              icon={FileText}
              iconColor="text-blue-600"
            />
            <KPICard
              title="Published"
              value={publishedPosts}
              icon={CheckCircle}
              iconColor="text-green-600"
            />
            <KPICard
              title="Drafts"
              value={draftPosts}
              icon={FileEdit}
              iconColor="text-yellow-600"
            />
            <KPICard
              title="Total Views"
              value={totalViews}
              icon={Eye}
              iconColor="text-purple-600"
            />
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="tags">Tags</TabsTrigger>
              <TabsTrigger value="authors">Authors</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <BlogPostList onEdit={handleEditPost} />
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <BlogCategoryManager />
              </div>
            </TabsContent>

            <TabsContent value="tags" className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <BlogTagManager />
              </div>
            </TabsContent>

            <TabsContent value="authors" className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <BlogAuthorManager />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Create/Edit Post Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-[96vw] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <DialogTitle>
                  {editingPostId ? 'Edit Blog Post' : 'Create New Blog Post'}
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to List
                </Button>
              </div>
            </DialogHeader>
            <BlogPostForm
              post={editingPost}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={createPost.isPending || updatePost.isPending}
            />
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </ProtectedRoute>
  );
}
