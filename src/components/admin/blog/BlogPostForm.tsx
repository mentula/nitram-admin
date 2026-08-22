import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RichTextEditor } from './RichTextEditor';
import { useBlogCategories, useBlogTags, useBlogAuthors, generateSlug } from '@/lib/hooks/useBlog';
import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, X, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  featured_image: z.string().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  canonical_url: z.string().url().optional().or(z.literal('')),
  author_id: z.string().optional(),
  category_id: z.string().optional(),
  status: z.enum(['draft', 'published', 'scheduled']),
  published: z.boolean(),
  scheduled_at: z.string().optional(),
});

type BlogPostFormData = z.infer<typeof blogPostSchema>;

interface BlogPostFormProps {
  post?: any;
  onSubmit: (data: BlogPostFormData & { tagIds: string[] }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BlogPostForm({ post, onSubmit, onCancel, isLoading }: BlogPostFormProps) {
  const { data: categories } = useBlogCategories();
  const { data: tags } = useBlogTags();
  const { data: authors } = useBlogAuthors();

  const [selectedTags, setSelectedTags] = useState<string[]>(
    post?.tags?.map((t: any) => t.id) || []
  );
  const [content, setContent] = useState(post?.content || '');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    post?.scheduled_at ? new Date(post.scheduled_at) : undefined
  );
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: post?.title || '',
      slug: post?.slug || '',
      excerpt: post?.excerpt || '',
      content: post?.content || '',
      featured_image: post?.featured_image || '',
      seo_title: post?.seo_title || '',
      seo_description: post?.seo_description || '',
      canonical_url: post?.canonical_url || '',
      author_id: post?.author_id || '',
      category_id: post?.category_id || '',
      status: post?.status || 'draft',
      published: post?.published || false,
      scheduled_at: post?.scheduled_at || '',
    },
  });

  const title = watch('title');
  const status = watch('status');

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !post) {
      setValue('slug', generateSlug(title));
    }
  }, [title, post, setValue]);

  // Sync scheduled date
  useEffect(() => {
    if (scheduledDate) {
      setValue('scheduled_at', scheduledDate.toISOString());
    } else {
      setValue('scheduled_at', '');
    }
  }, [scheduledDate, setValue]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `blog-featured/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      setValue('featured_image', publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFormSubmit = async (data: BlogPostFormData) => {
    await onSubmit({
      ...data,
      content,
      tagIds: selectedTags,
    });
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Enter post title"
          className={errors.title ? 'border-red-500' : ''}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <Label htmlFor="slug">URL Slug *</Label>
        <Input
          id="slug"
          {...register('slug')}
          placeholder="post-url-slug"
          className={errors.slug ? 'border-red-500' : ''}
        />
        {errors.slug && (
          <p className="text-sm text-red-500">{errors.slug.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          URL-friendly version of the title
        </p>
      </div>

      {/* Excerpt */}
      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          {...register('excerpt')}
          placeholder="Brief summary of the post..."
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          Short description shown in post listings
        </p>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label>Content *</Label>
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Write your blog post content..."
          minHeight="500px"
        />
        {errors.content && (
          <p className="text-sm text-red-500">{errors.content.message}</p>
        )}
      </div>

      {/* Featured Image */}
      <div className="space-y-2">
        <Label htmlFor="featured-image">Featured Image</Label>
        {watch('featured_image') ? (
          <div className="space-y-2">
            <img
              src={watch('featured_image')}
              alt="Featured"
              className="rounded-lg max-h-64 object-cover"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setValue('featured_image', '')}
            >
              Remove Image
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              id="featured-image-file"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="flex-1"
            />
            {uploadingImage && <span className="text-sm text-muted-foreground">Uploading...</span>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={watch('category_id') || 'none'}
            onValueChange={(value) => setValue('category_id', value === 'none' ? undefined : value)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Author */}
        <div className="space-y-2">
          <Label htmlFor="author">Author</Label>
          <Select
            value={watch('author_id') || 'none'}
            onValueChange={(value) => setValue('author_id', value === 'none' ? undefined : value)}
          >
            <SelectTrigger id="author">
              <SelectValue placeholder="Select author" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {authors?.map((author) => (
                <SelectItem key={author.id} value={author.id}>
                  {author.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2">
          {tags?.map((tag) => (
            <Badge
              key={tag.id}
              variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleTag(tag.id)}
            >
              {tag.name}
              {selectedTags.includes(tag.id) && (
                <X className="h-3 w-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>
        {tags && tags.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No tags available. Create tags in the Tags section.
          </p>
        )}
      </div>

      {/* Status & Publishing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={watch('status')}
            onValueChange={(value: any) => {
              setValue('status', value);
              setValue('published', value === 'published');
            }}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Scheduled Date */}
        {status === 'scheduled' && (
          <div className="space-y-2">
            <Label>Publish Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !scheduledDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduledDate ? format(scheduledDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={scheduledDate}
                  onSelect={setScheduledDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* SEO Settings */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="font-semibold">SEO Settings</h3>
        
        <div className="space-y-2">
          <Label htmlFor="seo-title">SEO Title</Label>
          <Input
            id="seo-title"
            {...register('seo_title')}
            placeholder="Leave empty to use post title"
          />
          <p className="text-xs text-muted-foreground">
            Optimal length: 50-60 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo-description">SEO Description</Label>
          <Textarea
            id="seo-description"
            {...register('seo_description')}
            placeholder="Brief description for search engines"
            rows={2}
          />
          <p className="text-xs text-muted-foreground">
            Optimal length: 150-160 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="canonical-url">Canonical URL</Label>
          <Input
            id="canonical-url"
            {...register('canonical_url')}
            placeholder="https://example.com/original-post"
          />
          {errors.canonical_url && (
            <p className="text-sm text-red-500">{errors.canonical_url.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Use if this content was originally published elsewhere
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 border-t pt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
        </Button>
      </div>
    </form>
  );
}
