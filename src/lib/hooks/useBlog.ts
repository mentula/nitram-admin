import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { logActivity, ActivityTypes } from '@/lib/activity-log';
import type { Database } from '@/lib/database.types';

type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert'];
type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update'];

type BlogCategory = Database['public']['Tables']['blog_categories']['Row'];
type BlogCategoryInsert = Database['public']['Tables']['blog_categories']['Insert'];
type BlogCategoryUpdate = Database['public']['Tables']['blog_categories']['Update'];

type BlogTag = Database['public']['Tables']['blog_tags']['Row'];
type BlogTagInsert = Database['public']['Tables']['blog_tags']['Insert'];
type BlogTagUpdate = Database['public']['Tables']['blog_tags']['Update'];

type BlogAuthor = Database['public']['Tables']['blog_authors']['Row'];
type BlogAuthorInsert = Database['public']['Tables']['blog_authors']['Insert'];
type BlogAuthorUpdate = Database['public']['Tables']['blog_authors']['Update'];

/**
 * Generate URL-friendly slug from title
 */
export function generateSlug(title: string): string {
  const slug = title
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || `article-${Date.now()}`;
}

/**
 * Ensure slug is unique by appending number if needed
 */
async function ensureUniqueSlug(slug: string, tableName: string, excludeId?: string): Promise<string> {
  let uniqueSlug = slug;
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    let query = supabase
      .from(tableName as any)
      .select('slug')
      .eq('slug', uniqueSlug);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data } = await query.maybeSingle();

    if (!data) {
      isUnique = true;
    } else {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
  }

  return uniqueSlug;
}

// ============================================================================
// BLOG POSTS
// ============================================================================

export function useBlogPosts(filters?: {
  status?: string;
  published?: boolean;
  category_id?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['blog-posts', filters],
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          author:blog_authors(id, name, avatar_url),
          category:blog_categories(id, name, slug),
          tags:blog_post_tags(tag:blog_tags(id, name, slug))
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.published !== undefined) {
        query = query.eq('published', filters.published);
      }

      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data ?? []).map((post: any) => ({
        ...post,
        tags: (post.tags ?? []).map((item: any) => item.tag).filter(Boolean),
      }));
    },
  });
}

export function useBlogPost(id: string | null) {
  return useQuery({
    queryKey: ['blog-post', id],
    queryFn: async () => {
      if (!id) throw new Error('Post ID is required');

      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author:blog_authors(id, name, bio, avatar_url),
          category:blog_categories(id, name, slug),
          created_by_profile:profiles!blog_posts_created_by_fkey(full_name, email),
          updated_by_profile:profiles!blog_posts_updated_by_fkey(full_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Fetch tags separately due to many-to-many relationship
      const { data: tagData } = await supabase
        .from('blog_post_tags')
        .select('tag:blog_tags(id, name, slug)')
        .eq('post_id', id);

      return {
        ...data,
        tags: tagData?.map(t => t.tag).filter(Boolean) || [],
      };
    },
    enabled: !!id,
  });
}

export function useBlogPostBySlug(slug: string | null) {
  return useQuery({
    queryKey: ['blog-post-slug', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Slug is required');

      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author:blog_authors(id, name, bio, avatar_url, social_links),
          category:blog_categories(id, name, slug)
        `)
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) throw error;

      // Increment view count
      await supabase
        .from('blog_posts')
        .update({ view_count: data.view_count + 1 })
        .eq('id', data.id);

      // Fetch tags
      const { data: tagData } = await supabase
        .from('blog_post_tags')
        .select('tag:blog_tags(id, name, slug)')
        .eq('post_id', data.id);

      return {
        ...data,
        tags: tagData?.map(t => t.tag).filter(Boolean) || [],
      };
    },
    enabled: !!slug,
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      post, 
      tagIds 
    }: { 
      post: BlogPostInsert; 
      tagIds?: string[];
    }) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('You must be signed in to create a blog post.');
      }

      // Ensure unique slug
      const slug = await ensureUniqueSlug(post.slug, 'blog_posts');

      // Build an explicit database payload. Form-only fields and undefined values
      // must not be sent to PostgREST because they can cause schema errors.
      const { tagIds: _tagIds, ...formData } = post as any;
      const postData = Object.fromEntries(
        Object.entries(formData).filter(([, value]) => value !== undefined)
      );

      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          ...postData,
          slug,
          content: String(postData.content ?? '').trim(),
          published: postData.status === 'published',
          published_at: postData.status === 'published' ? new Date().toISOString() : null,
          created_by: user.id,
          updated_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add tags if provided
      if (tagIds && tagIds.length > 0) {
        const { error: tagError } = await supabase
          .from('blog_post_tags')
          .insert(tagIds.map(tagId => ({
            post_id: data.id,
            tag_id: tagId,
          })));
        if (tagError) {
          console.error('[v0] Blog post created, but tags could not be saved:', tagError);
        }
      }

      try {
        await logActivity({
          action: ActivityTypes.BLOG_POST_CREATED,
          entity_type: 'blog_post',
          entity_id: data.id,
          details: { title: data.title, slug: data.slug },
        });
      } catch (activityError) {
        console.error('[v0] Blog post created, but activity logging failed:', activityError);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates, 
      tagIds 
    }: { 
      id: string; 
      updates: BlogPostUpdate; 
      tagIds?: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      // Ensure unique slug if slug is being updated
      // Remove tagIds before update — they belong in blog_post_tags, not blog_posts
      const { tagIds: _tagIds, ...updatesData } = updates as any;
      let finalUpdates = { ...updatesData, updated_by: user?.id };
      if (updates.slug) {
        finalUpdates.slug = await ensureUniqueSlug(updates.slug, 'blog_posts', id);
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .update(finalUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update tags if provided
      if (tagIds !== undefined) {
        // Delete existing tags
        const { error: deleteTagsError } = await supabase
          .from('blog_post_tags')
          .delete()
          .eq('post_id', id);
        if (deleteTagsError) throw deleteTagsError;

        if (tagIds.length > 0) {
          const { error: insertTagsError } = await supabase
            .from('blog_post_tags')
            .insert(tagIds.map(tagId => ({
              post_id: id,
              tag_id: tagId,
            })));
          if (insertTagsError) throw insertTagsError;
        }
      }

      await logActivity({
        action: ActivityTypes.BLOG_POST_UPDATED,
        entity_type: 'blog_post',
        entity_id: data.id,
        details: { title: data.title },
      });

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-post', variables.id] });
    },
  });
}

export function usePublishBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, publish }: { id: string; publish: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const updates: BlogPostUpdate = {
        published: publish,
        status: publish ? 'published' : 'draft',
        published_at: publish ? new Date().toISOString() : null,
        updated_by: user?.id,
      };

      const { data, error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await logActivity({
        action: publish ? ActivityTypes.BLOG_POST_PUBLISHED : ActivityTypes.BLOG_POST_UPDATED,
        entity_type: 'blog_post',
        entity_id: data.id,
        details: { title: data.title, published: publish },
      });

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-post', variables.id] });
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Delete associated tags first
      await supabase
        .from('blog_post_tags')
        .delete()
        .eq('post_id', id);

      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await logActivity({
        action: ActivityTypes.BLOG_POST_DELETED,
        entity_type: 'blog_post',
        entity_id: id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
}

// ============================================================================
// BLOG CATEGORIES
// ============================================================================

export function useBlogCategories() {
  return useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateBlogCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: BlogCategoryInsert) => {
      const slug = await ensureUniqueSlug(category.slug, 'blog_categories');

      const { data, error } = await supabase
        .from('blog_categories')
        .insert({ ...category, slug })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
    },
  });
}

export function useUpdateBlogCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: BlogCategoryUpdate }) => {
      let finalUpdates = { ...updates };
      if (updates.slug) {
        finalUpdates.slug = await ensureUniqueSlug(updates.slug, 'blog_categories', id);
      }

      const { data, error } = await supabase
        .from('blog_categories')
        .update(finalUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
    },
  });
}

export function useDeleteBlogCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
    },
  });
}

// ============================================================================
// BLOG TAGS
// ============================================================================

export function useBlogTags() {
  return useQuery({
    queryKey: ['blog-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_tags')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateBlogTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tag: BlogTagInsert) => {
      const slug = await ensureUniqueSlug(tag.slug, 'blog_tags');

      const { data, error } = await supabase
        .from('blog_tags')
        .insert({ ...tag, slug })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-tags'] });
    },
  });
}

export function useUpdateBlogTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: BlogTagUpdate }) => {
      let finalUpdates = { ...updates };
      if (updates.slug) {
        finalUpdates.slug = await ensureUniqueSlug(updates.slug, 'blog_tags', id);
      }

      const { data, error } = await supabase
        .from('blog_tags')
        .update(finalUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-tags'] });
    },
  });
}

export function useDeleteBlogTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Delete associated post-tag relationships first
      await supabase
        .from('blog_post_tags')
        .delete()
        .eq('tag_id', id);

      const { error } = await supabase
        .from('blog_tags')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-tags'] });
    },
  });
}

// ============================================================================
// BLOG AUTHORS
// ============================================================================

export function useBlogAuthors() {
  return useQuery({
    queryKey: ['blog-authors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_authors')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateBlogAuthor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (author: BlogAuthorInsert) => {
      const { data, error } = await supabase
        .from('blog_authors')
        .insert(author)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-authors'] });
    },
  });
}

export function useUpdateBlogAuthor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: BlogAuthorUpdate }) => {
      const { data, error } = await supabase
        .from('blog_authors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-authors'] });
    },
  });
}

export function useDeleteBlogAuthor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_authors')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-authors'] });
    },
  });
}
