import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useBlogAuthors,
  useCreateBlogAuthor,
  useUpdateBlogAuthor,
  useDeleteBlogAuthor,
} from '@/lib/hooks/useBlog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2, Loader2, User, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const authorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bio: z.string().optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
  social_links: z.object({
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
  }).optional(),
});

type AuthorFormData = z.infer<typeof authorSchema>;

export function BlogAuthorManager() {
  const { data: authors, isLoading } = useBlogAuthors();
  const createAuthor = useCreateBlogAuthor();
  const updateAuthor = useUpdateBlogAuthor();
  const deleteAuthor = useDeleteBlogAuthor();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<any>(null);
  const [authorToDelete, setAuthorToDelete] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AuthorFormData>({
    resolver: zodResolver(authorSchema),
  });

  const handleOpenDialog = (author?: any) => {
    if (author) {
      setEditingAuthor(author);
      reset({
        name: author.name,
        bio: author.bio || '',
        avatar_url: author.avatar_url || '',
        social_links: author.social_links || {},
      });
    } else {
      setEditingAuthor(null);
      reset({
        name: '',
        bio: '',
        avatar_url: '',
        social_links: {},
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAuthor(null);
    reset();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `blog-authors/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      setValue('avatar_url', publicUrl);
      toast.success('Avatar uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onSubmit = async (data: AuthorFormData) => {
    try {
      const payload = {
        ...data,
        social_links: Object.keys(data.social_links || {}).length > 0 ? data.social_links : null,
      };

      if (editingAuthor) {
        await updateAuthor.mutateAsync({
          id: editingAuthor.id,
          updates: payload,
        });
        toast.success('Author updated successfully');
      } else {
        await createAuthor.mutateAsync(payload);
        toast.success('Author created successfully');
      }
      handleCloseDialog();
    } catch (error) {
      toast.error('Failed to save author');
    }
  };

  const handleDelete = async () => {
    if (!authorToDelete) return;

    try {
      await deleteAuthor.mutateAsync(authorToDelete);
      toast.success('Author deleted successfully');
      setDeleteDialogOpen(false);
      setAuthorToDelete(null);
    } catch (error) {
      toast.error('Failed to delete author');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Authors</h3>
          <p className="text-sm text-muted-foreground">
            Manage blog post authors and contributors
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Author
        </Button>
      </div>

      {!authors || authors.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No authors yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add authors to attribute blog posts
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Bio</TableHead>
                <TableHead>Social Links</TableHead>
                <TableHead className="w-[64px] sm:w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {authors.map((author) => (
                <TableRow key={author.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {author.avatar_url ? (
                        <img
                          src={author.avatar_url}
                          alt={author.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted grid place-items-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <span className="font-medium">{author.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {author.bio || '—'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 text-xs">
                      {author.social_links?.twitter && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Twitter
                        </span>
                      )}
                      {author.social_links?.linkedin && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          LinkedIn
                        </span>
                      )}
                      {author.social_links?.website && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          Website
                        </span>
                      )}
                      {!author.social_links && (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(author)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAuthorToDelete(author.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[96vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAuthor ? 'Edit Author' : 'Create Author'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Author name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                {...register('bio')}
                placeholder="Brief bio of the author"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar</Label>
              {watch('avatar_url') ? (
                <div className="space-y-2">
                  <img
                    src={watch('avatar_url')}
                    alt="Avatar"
                    className="h-24 w-24 rounded-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setValue('avatar_url', '')}
                  >
                    Remove Avatar
                  </Button>
                </div>
              ) : (
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              )}
            </div>

            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">Social Links</h4>
              
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  {...register('social_links.twitter')}
                  placeholder="https://twitter.com/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  {...register('social_links.linkedin')}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  {...register('social_links.website')}
                  placeholder="https://example.com"
                />
                {errors.social_links?.website && (
                  <p className="text-sm text-red-500">
                    {errors.social_links.website.message}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createAuthor.isPending || updateAuthor.isPending}
              >
                {createAuthor.isPending || updateAuthor.isPending
                  ? 'Saving...'
                  : editingAuthor
                  ? 'Update'
                  : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Author</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this author? Posts by this author will become
              unattributed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteAuthor.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
