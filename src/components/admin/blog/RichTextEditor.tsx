import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  FileCode,
  Eye,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  minHeight = '400px',
}: RichTextEditorProps) {
  const [mode, setMode] = useState<'wysiwyg' | 'markdown'>('wysiwyg');
  const [markdownContent, setMarkdownContent] = useState(content);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose max-w-none focus:outline-none min-h-[' + minHeight + '] p-4',
      },
    },
  });

  // Sync editor content when switching modes
  useEffect(() => {
    if (mode === 'markdown' && editor) {
      setMarkdownContent(editor.getHTML());
    } else if (mode === 'wysiwyg' && editor) {
      editor.commands.setContent(markdownContent);
      onChange(markdownContent);
    }
  }, [mode]);

  const handleMarkdownChange = (value: string) => {
    setMarkdownContent(value);
    onChange(value);
  };

  const handleAddLink = () => {
    if (linkUrl && editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setLinkDialogOpen(false);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      if (imageUrl && editor) {
        editor.chain().focus().setImage({ src: imageUrl }).run();
        setImageUrl('');
        setImageDialogOpen(false);
      }
      return;
    }

    if (!imageFile.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }
    if (imageFile.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, imageFile, { contentType: imageFile.type, cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      if (editor) {
        editor.chain().focus().setImage({ src: publicUrl }).run();
      }

      toast.success('Image uploaded successfully');
      setImageFile(null);
      setImageUrl('');
      setImageDialogOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  const MenuButton = ({ 
    onClick, 
    active, 
    disabled, 
    icon: Icon, 
    title 
  }: { 
    onClick: () => void; 
    active?: boolean; 
    disabled?: boolean; 
    icon: any; 
    title: string;
  }) => (
    <Button
      type="button"
      variant={active ? 'default' : 'ghost'}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="h-8 w-8 p-0"
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  const wordCount = editor.state.doc.textContent.split(/\s+/).filter(Boolean).length;
  const charCount = editor.state.doc.textContent.length;

  return (
    <div className="space-y-2">
      <Tabs value={mode} onValueChange={(v) => setMode(v as 'wysiwyg' | 'markdown')}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="wysiwyg" className="gap-2">
              <Eye className="h-4 w-4" />
              Visual
            </TabsTrigger>
            <TabsTrigger value="markdown" className="gap-2">
              <FileCode className="h-4 w-4" />
              HTML
            </TabsTrigger>
          </TabsList>
          <div className="text-xs text-muted-foreground">
            {wordCount} words • {charCount} characters
          </div>
        </div>

        <TabsContent value="wysiwyg" className="space-y-2">
          {/* Toolbar */}
          <div className="border border-border rounded-t-lg bg-muted/50 p-2 flex flex-wrap gap-1">
            <MenuButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              icon={Bold}
              title="Bold"
            />
            <MenuButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              icon={Italic}
              title="Italic"
            />
            <MenuButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive('strike')}
              icon={Strikethrough}
              title="Strikethrough"
            />
            <MenuButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              active={editor.isActive('code')}
              icon={Code}
              title="Inline Code"
            />

            <div className="w-px h-6 bg-border mx-1" />

            <MenuButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive('heading', { level: 1 })}
              icon={Heading1}
              title="Heading 1"
            />
            <MenuButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
              icon={Heading2}
              title="Heading 2"
            />
            <MenuButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive('heading', { level: 3 })}
              icon={Heading3}
              title="Heading 3"
            />

            <div className="w-px h-6 bg-border mx-1" />

            <MenuButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
              icon={List}
              title="Bullet List"
            />
            <MenuButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
              icon={ListOrdered}
              title="Numbered List"
            />
            <MenuButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
              icon={Quote}
              title="Quote"
            />

            <div className="w-px h-6 bg-border mx-1" />

            <MenuButton
              onClick={() => setLinkDialogOpen(true)}
              active={editor.isActive('link')}
              icon={LinkIcon}
              title="Insert Link"
            />
            <MenuButton
              onClick={() => setImageDialogOpen(true)}
              icon={ImageIcon}
              title="Insert Image"
            />

            <div className="w-px h-6 bg-border mx-1" />

            <MenuButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              icon={Undo}
              title="Undo"
            />
            <MenuButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              icon={Redo}
              title="Redo"
            />
          </div>

          {/* Editor */}
          <div className="border border-border rounded-b-lg bg-white overflow-hidden">
            <EditorContent editor={editor} />
          </div>
        </TabsContent>

        <TabsContent value="markdown">
          <Textarea
            value={markdownContent}
            onChange={(e) => handleMarkdownChange(e.target.value)}
            placeholder="Enter HTML content..."
            className="font-mono text-sm"
            style={{ minHeight }}
          />
        </TabsContent>
      </Tabs>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLink();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLink}>Insert Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="image-upload">Upload Image</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Max 5MB. Supported: JPG, PNG, GIF, WebP
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <div>
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={!!imageFile}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImageUpload} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Insert Image'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
