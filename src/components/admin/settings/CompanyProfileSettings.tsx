import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSettings, useUpdateSettings, getSettingValue } from '@/lib/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Upload, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const companyProfileSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  company_tagline: z.string().optional(),
  company_description: z.string().optional(),
  company_address: z.string().optional(),
  company_city: z.string().optional(),
  company_country: z.string().optional(),
  company_phone: z.string().optional(),
  company_email: z.string().email().optional().or(z.literal('')),
  company_website: z.string().url().optional().or(z.literal('')),
  company_logo: z.string().url().optional().or(z.literal('')),
  social_facebook: z.string().optional(),
  social_twitter: z.string().optional(),
  social_linkedin: z.string().optional(),
  social_instagram: z.string().optional(),
  social_youtube: z.string().optional(),
});

type CompanyProfileFormData = z.infer<typeof companyProfileSchema>;

export function CompanyProfileSettings() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<CompanyProfileFormData>({
    resolver: zodResolver(companyProfileSchema),
  });

  // Load settings into form
  useEffect(() => {
    if (settings?.parsed) {
      reset({
        company_name: getSettingValue(settings.parsed, 'company_name', ''),
        company_tagline: getSettingValue(settings.parsed, 'company_tagline', ''),
        company_description: getSettingValue(settings.parsed, 'company_description', ''),
        company_address: getSettingValue(settings.parsed, 'company_address', ''),
        company_city: getSettingValue(settings.parsed, 'company_city', ''),
        company_country: getSettingValue(settings.parsed, 'company_country', ''),
        company_phone: getSettingValue(settings.parsed, 'company_phone', ''),
        company_email: getSettingValue(settings.parsed, 'company_email', ''),
        company_website: getSettingValue(settings.parsed, 'company_website', ''),
        company_logo: getSettingValue(settings.parsed, 'company_logo', ''),
        social_facebook: getSettingValue(settings.parsed, 'social_facebook', ''),
        social_twitter: getSettingValue(settings.parsed, 'social_twitter', ''),
        social_linkedin: getSettingValue(settings.parsed, 'social_linkedin', ''),
        social_instagram: getSettingValue(settings.parsed, 'social_instagram', ''),
        social_youtube: getSettingValue(settings.parsed, 'social_youtube', ''),
      });
    }
  }, [settings, reset]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be less than 2MB');
      return;
    }

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `company-logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      setValue('company_logo', publicUrl, { shouldDirty: true });
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const onSubmit = async (data: CompanyProfileFormData) => {
    try {
      const settingsArray = Object.entries(data).map(([key, value]) => ({
        key,
        value,
        description: getSettingDescription(key),
      }));

      await updateSettings.mutateAsync(settingsArray);
      toast.success('Company profile updated successfully');
    } catch (error) {
      toast.error('Failed to update company profile');
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Company Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Company Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name *</Label>
            <Input
              id="company_name"
              {...register('company_name')}
              placeholder="Your Company Name"
              className={errors.company_name ? 'border-red-500' : ''}
            />
            {errors.company_name && (
              <p className="text-sm text-red-500">{errors.company_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_tagline">Tagline</Label>
            <Input
              id="company_tagline"
              {...register('company_tagline')}
              placeholder="Your company's tagline"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_description">Description</Label>
          <Textarea
            id="company_description"
            {...register('company_description')}
            placeholder="Brief description of your company"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_logo">Company Logo</Label>
          {watch('company_logo') ? (
            <div className="space-y-2">
              <img
                src={watch('company_logo')}
                alt="Company Logo"
                className="h-24 w-auto object-contain bg-muted p-2 rounded-lg"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setValue('company_logo', '', { shouldDirty: true })}
                >
                  Remove Logo
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                id="company_logo"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
              />
              {uploadingLogo && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Recommended: PNG or SVG with transparent background, max 2MB
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-semibold">Contact Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company_phone">Phone</Label>
            <Input
              id="company_phone"
              {...register('company_phone')}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_email">Email</Label>
            <Input
              id="company_email"
              type="email"
              {...register('company_email')}
              placeholder="contact@company.com"
            />
            {errors.company_email && (
              <p className="text-sm text-red-500">{errors.company_email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_website">Website</Label>
            <Input
              id="company_website"
              {...register('company_website')}
              placeholder="https://www.company.com"
            />
            {errors.company_website && (
              <p className="text-sm text-red-500">{errors.company_website.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_address">Address</Label>
          <Input
            id="company_address"
            {...register('company_address')}
            placeholder="Street address"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company_city">City</Label>
            <Input
              id="company_city"
              {...register('company_city')}
              placeholder="City"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_country">Country</Label>
            <Input
              id="company_country"
              {...register('company_country')}
              placeholder="Country"
            />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-semibold">Social Media</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="social_facebook">Facebook</Label>
            <Input
              id="social_facebook"
              {...register('social_facebook')}
              placeholder="https://facebook.com/yourcompany"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_twitter">Twitter</Label>
            <Input
              id="social_twitter"
              {...register('social_twitter')}
              placeholder="https://twitter.com/yourcompany"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_linkedin">LinkedIn</Label>
            <Input
              id="social_linkedin"
              {...register('social_linkedin')}
              placeholder="https://linkedin.com/company/yourcompany"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_instagram">Instagram</Label>
            <Input
              id="social_instagram"
              {...register('social_instagram')}
              placeholder="https://instagram.com/yourcompany"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_youtube">YouTube</Label>
            <Input
              id="social_youtube"
              {...register('social_youtube')}
              placeholder="https://youtube.com/@yourcompany"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end border-t pt-6">
        <Button
          type="submit"
          disabled={!isDirty || updateSettings.isPending}
        >
          {updateSettings.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function getSettingDescription(key: string): string {
  const descriptions: Record<string, string> = {
    company_name: 'Official company name',
    company_tagline: 'Company tagline or slogan',
    company_description: 'Brief company description',
    company_address: 'Physical address',
    company_city: 'City location',
    company_country: 'Country location',
    company_phone: 'Primary phone number',
    company_email: 'Primary email address',
    company_website: 'Company website URL',
    company_logo: 'Company logo URL',
    social_facebook: 'Facebook page URL',
    social_twitter: 'Twitter profile URL',
    social_linkedin: 'LinkedIn company page URL',
    social_instagram: 'Instagram profile URL',
    social_youtube: 'YouTube channel URL',
  };

  return descriptions[key] || '';
}
