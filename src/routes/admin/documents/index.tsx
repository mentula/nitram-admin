import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  useDocuments,
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument,
  useUploadDocument,
  DOCUMENT_CATEGORIES,
} from '@/lib/hooks/useDocuments';
import { DocumentUpload } from '@/components/admin/documents/DocumentUpload';
import { KPICard } from '@/components/admin/KPICard';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  FileText,
  Calendar,
  Download,
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Search,
  ExternalLink,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export const Route = createFileRoute('/admin/documents/')({
  component: DocumentsAdminPage,
});

function DocumentsAdminPage() {
  const { data: documents, isLoading } = useDocuments();
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();
  const uploadDocument = useUploadDocument();

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadForm, setUploadForm] = useState({
    category: '',
    description: '',
    expires_at: '',
  });

  // Calculate KPIs
  const totalDocs = documents?.length || 0;
  const expiringSoon = documents?.filter(doc => {
    if (!doc.expires_at) return false;
    const daysUntilExpiry = differenceInDays(new Date(doc.expires_at), new Date());
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
  }).length || 0;

  const categoryCounts = documents?.reduce((acc, doc) => {
    const cat = doc.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    try {
      for (const file of selectedFiles) {
        // Upload file
        const uploadResult = await uploadDocument.mutateAsync({
          file,
          category: uploadForm.category,
        });

        // Create document record
        await createDocument.mutateAsync({
          name: uploadResult.fileName,
          file_path: uploadResult.filePath,
          file_size: uploadResult.fileSize,
          file_type: uploadResult.fileType,
          bucket_name: 'documents',
          category: uploadForm.category || null,
          description: uploadForm.description || null,
          expires_at: uploadForm.expires_at || null,
        });
      }

      toast.success(`${selectedFiles.length} document(s) uploaded successfully`);
      setUploadDialogOpen(false);
      setSelectedFiles([]);
      setUploadForm({ category: '', description: '', expires_at: '' });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload documents');
    }
  };

  const handleDelete = async () => {
    if (!docToDelete) return;

    try {
      await deleteDocument.mutateAsync({
        id: docToDelete.id,
        filePath: docToDelete.file_path,
      });
      toast.success('Document deleted successfully');
      setDeleteDialogOpen(false);
      setDocToDelete(null);
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const handleDownload = async (doc: any) => {
    const { data, error } = await supabase.storage
      .from(doc.bucket_name || 'documents')
      .createSignedUrl(doc.file_path, 300);
    if (error || !data?.signedUrl) {
      toast.error('Unable to open document');
      return;
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  };

  const filteredDocs = documents?.filter(doc => {
    const matchesSearch = !searchQuery || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const daysUntilExpiry = differenceInDays(new Date(expiryDate), new Date());
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return differenceInDays(new Date(expiryDate), new Date()) < 0;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <ProtectedRoute requiredRole={['super_admin', 'manager', 'logistics_officer']}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
              <p className="text-gray-600 mt-1">
                Manage company documents, licenses, and certificates
              </p>
            </div>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard
              title="Total Documents"
              value={totalDocs}
              icon={FileText}
              iconColor="text-blue-600"
            />
            <KPICard
              title="Expiring Soon"
              value={expiringSoon}
              icon={AlertCircle}
              iconColor="text-amber-600"
            />
            <KPICard
              title="Categories"
              value={Object.keys(categoryCounts).length}
              icon={Calendar}
              iconColor="text-green-600"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Documents Table */}
          {!filteredDocs || filteredDocs.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No documents found.</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery || categoryFilter
                  ? 'Try adjusting your filters'
                  : 'Upload your first document to get started'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="w-[56px] sm:w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocs.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          {doc.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {doc.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {doc.category ? (
                          <Badge variant="outline">{doc.category}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {doc.file_size
                            ? `${(doc.file_size / 1024).toFixed(1)} KB`
                            : '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {doc.expires_at ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm ${
                                isExpired(doc.expires_at)
                                  ? 'text-red-600 font-medium'
                                  : isExpiringSoon(doc.expires_at)
                                  ? 'text-amber-600 font-medium'
                                  : ''
                              }`}
                            >
                              {format(new Date(doc.expires_at), 'MMM d, yyyy')}
                            </span>
                            {isExpiringSoon(doc.expires_at) && !isExpired(doc.expires_at) && (
                              <AlertCircle className="h-4 w-4 text-amber-600" />
                            )}
                            {isExpired(doc.expires_at) && (
                              <Badge variant="destructive" className="text-xs">
                                Expired
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{format(new Date(doc.created_at), 'MMM d, yyyy')}</p>
                          {doc.uploaded_by_profile && (
                            <p className="text-xs text-muted-foreground">
                              {doc.uploaded_by_profile.full_name}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownload(doc)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(doc)}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open in New Tab
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setDocToDelete(doc);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="max-w-[96vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Upload Documents</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <DocumentUpload
                onFilesSelected={setSelectedFiles}
                disabled={uploadDocument.isPending || createDocument.isPending}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={uploadForm.category}
                    onValueChange={(value) =>
                      setUploadForm({ ...uploadForm, category: value })
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expires_at">Expiry Date (Optional)</Label>
                  <Input
                    id="expires_at"
                    type="date"
                    value={uploadForm.expires_at}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, expires_at: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, description: e.target.value })
                  }
                  placeholder="Add notes about this document..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setUploadDialogOpen(false);
                  setSelectedFiles([]);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={
                  selectedFiles.length === 0 ||
                  uploadDocument.isPending ||
                  createDocument.isPending
                }
              >
                {uploadDocument.isPending || createDocument.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Document</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{docToDelete?.name}"? This action cannot
                be undone and will permanently delete the file.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteDocument.isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </ProtectedRoute>
  );
}
