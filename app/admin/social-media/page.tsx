'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ExternalLink, BarChart3, Eye, EyeOff, GripVertical } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the drag-drop wrapper to avoid SSR issues
const DragDropWrapper = dynamic(
  () => import('@/components/ui/drag-drop-wrapper').then(mod => ({ default: mod.DragDropWrapper })),
  {
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
  }
);

const DraggableItem = dynamic(
  () => import('@/components/ui/drag-drop-wrapper').then(mod => ({ default: mod.DraggableItem })),
  { ssr: false }
);
import { socialMediaService } from '@/lib/services';
import { toast } from 'sonner';
import ErrorBoundary, { SimpleErrorFallback } from '@/components/ui/error-boundary';
import { ErrorHandler } from '@/lib/error-handler';

interface SocialMediaLink {
  _id: string;
  platform: string;
  name: string;
  url: string;
  icon: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
  openInNewTab: boolean;
  showOnMobile: boolean;
  showOnWeb: boolean;
  clickCount: number;
  lastClicked?: string;
  whatsappConfig?: {
    phoneNumber: string;
    defaultMessage: string;
  };
  createdBy: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

const SocialMediaManagement = () => {
  const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialMediaLink | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isDragDropEnabled, setIsDragDropEnabled] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSocialMediaLinks();
    // Enable drag-drop after component mounts
    const timer = setTimeout(() => {
      setIsDragDropEnabled(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const fetchSocialMediaLinks = async () => {
    try {
      setLoading(true);
      const response = await socialMediaService.getAllSocialMediaLinks();
      setSocialMediaLinks(response.socialMediaLinks || []);
    } catch (error) {
      console.error('Error fetching social media links:', error);
      toast.error('Failed to fetch social media links');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await socialMediaService.updateSocialMediaLink(id, { isActive: !isActive });
      toast.success(`Link ${!isActive ? 'activated' : 'deactivated'} successfully`);
      fetchSocialMediaLinks();
    } catch (error) {
      console.error('Error toggling link status:', error);
      toast.error('Failed to update link status');
    }
  };

  const handleDelete = ErrorHandler.wrapAsyncFunction(async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      setLoading(true);
      setIsDeleting(true);
      setIsDragDropEnabled(false); // Disable drag-drop during delete

      console.log('Deleting social media link:', { id, name });

      const result = await socialMediaService.deleteSocialMediaLink(id);
      console.log('Delete result:', result);

      toast.success('Link deleted successfully');
      await fetchSocialMediaLinks(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting link:', error);

      // Handle different types of errors
      if (error?.response?.data?.message) {
        toast.error(`Failed to delete link: ${error.response.data.message}`);
      } else if (error?.message) {
        toast.error(`Failed to delete link: ${error.message}`);
      } else {
        toast.error('Failed to delete link. Please try again.');
      }
    } finally {
      setLoading(false);
      setIsDeleting(false);

      // Re-enable drag-drop after a short delay
      setTimeout(() => {
        setIsDragDropEnabled(true);
      }, 500);
    }
  }, 'Social Media Delete');

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(socialMediaLinks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSocialMediaLinks(items);

    try {
      const reorderData = items.map((item, index) => ({
        id: item._id,
        displayOrder: index + 1
      }));

      await socialMediaService.bulkReorderSocialMedia(reorderData);
      toast.success('Links reordered successfully');
    } catch (error) {
      console.error('Error reordering links:', error);
      toast.error('Failed to reorder links');
      fetchSocialMediaLinks(); // Revert on error
    }
  };

  const getPlatformIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
      youtube: '🎥',
      facebook: '📘',
      whatsapp: '💬',
      instagram: '📷',
      twitter: '🐦',
      linkedin: '💼',
      telegram: '✈️',
      website: '🌐',
      custom: '🔗'
    };
    return icons[platform] || '🔗';
  };

  const getPlatformColor = (platform: string) => {
    const colors: { [key: string]: string } = {
      youtube: 'bg-red-100 text-red-800',
      facebook: 'bg-blue-100 text-blue-800',
      whatsapp: 'bg-green-100 text-green-800',
      instagram: 'bg-pink-100 text-pink-800',
      twitter: 'bg-sky-100 text-sky-800',
      linkedin: 'bg-indigo-100 text-indigo-800',
      telegram: 'bg-cyan-100 text-cyan-800',
      website: 'bg-gray-100 text-gray-800',
      custom: 'bg-purple-100 text-purple-800'
    };
    return colors[platform] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={SimpleErrorFallback}>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Social Media Management</h1>
            <p className="text-gray-600 mt-2">Manage your social media links and track their performance</p>
          </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAnalytics(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <BarChart3 size={20} />
            Analytics
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add Social Media Link
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Links</p>
              <p className="text-2xl font-bold text-gray-900">{socialMediaLinks.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ExternalLink className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Links</p>
              <p className="text-2xl font-bold text-green-600">
                {socialMediaLinks.filter(link => link.isActive).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clicks</p>
              <p className="text-2xl font-bold text-purple-600">
                {socialMediaLinks.reduce((sum, link) => sum + link.clickCount, 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Platforms</p>
              <p className="text-2xl font-bold text-orange-600">
                {new Set(socialMediaLinks.map(link => link.platform)).size}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Plus className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Links List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Social Media Links</h2>
          <p className="text-gray-600 mt-1">
            {isDeleting
              ? 'Deleting link...'
              : isDragDropEnabled
                ? 'Drag and drop to reorder links'
                : 'Loading drag-and-drop functionality...'
            }
          </p>
        </div>

        {socialMediaLinks.length === 0 ? (
          <div className="p-12 text-center">
            <ExternalLink className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No social media links</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first social media link</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Social Media Link
            </button>
          </div>
        ) : isDragDropEnabled && !isDeleting ? (
          <DragDropWrapper
            onDragEnd={handleDragEnd}
            droppableId="social-media-links"
            disabled={isDeleting || loading}
          >
            {socialMediaLinks.map((link, index) => (
              <DraggableItem
                key={link._id}
                draggableId={link._id}
                index={index}
                disabled={isDeleting || loading}
              >
                {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-6 border-b last:border-b-0 ${
                            snapshot.isDragging ? 'bg-gray-50' : 'bg-white'
                          } hover:bg-gray-50 transition-colors`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div {...provided.dragHandleProps} className="cursor-grab">
                                <GripVertical className="h-5 w-5 text-gray-400" />
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{getPlatformIcon(link.platform)}</span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900">{link.name}</h3>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPlatformColor(link.platform)}`}>
                                      {link.platform}
                                    </span>
                                    {!link.isActive && (
                                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                        Inactive
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                    <span>Clicks: {link.clickCount}</span>
                                    <span>Mobile: {link.showOnMobile ? 'Yes' : 'No'}</span>
                                    <span>Web: {link.showOnWeb ? 'Yes' : 'No'}</span>
                                    <span>Created: {new Date(link.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Open link"
                              >
                                <ExternalLink size={16} />
                              </a>
                              
                              <button
                                onClick={() => handleToggleActive(link._id, link.isActive)}
                                className={`p-2 transition-colors ${
                                  link.isActive 
                                    ? 'text-green-600 hover:text-green-700' 
                                    : 'text-gray-400 hover:text-green-600'
                                }`}
                                title={link.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {link.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                              </button>

                              <button
                                onClick={() => setEditingLink(link)}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>

                              <button
                                onClick={() => handleDelete(link._id, link.name)}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                </DraggableItem>
              ))}
          </DragDropWrapper>
        ) : (
          // Fallback list without drag-and-drop
          <div>
            {socialMediaLinks.map((link, index) => (
              <div
                key={link._id}
                className="p-6 border-b last:border-b-0 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getPlatformIcon(link.platform)}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{link.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPlatformColor(link.platform)}`}>
                            {link.platform}
                          </span>
                          {!link.isActive && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Clicks: {link.clickCount}</span>
                          <span>Mobile: {link.showOnMobile ? 'Yes' : 'No'}</span>
                          <span>Web: {link.showOnWeb ? 'Yes' : 'No'}</span>
                          <span>Created: {new Date(link.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Open link"
                    >
                      <ExternalLink size={16} />
                    </a>

                    <button
                      onClick={() => handleToggleActive(link._id, link.isActive)}
                      className={`p-2 transition-colors ${
                        link.isActive
                          ? 'text-green-600 hover:text-green-700'
                          : 'text-gray-400 hover:text-green-600'
                      }`}
                      title={link.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {link.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>

                    <button
                      onClick={() => setEditingLink(link)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(link._id, link.name)}
                      disabled={isDeleting || loading}
                      className={`p-2 transition-colors ${
                        isDeleting || loading
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-400 hover:text-red-600'
                      }`}
                      title={isDeleting || loading ? 'Deleting...' : 'Delete'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingLink) && (
        <SocialMediaModal
          link={editingLink}
          isOpen={showCreateModal || !!editingLink}
          onClose={() => {
            setShowCreateModal(false);
            setEditingLink(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setEditingLink(null);
            fetchSocialMediaLinks();
          }}
        />
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <AnalyticsModal
          isOpen={showAnalytics}
          onClose={() => setShowAnalytics(false)}
        />
      )}
    </div>
    </ErrorBoundary>
  );
};

// Social Media Create/Edit Modal Component
const SocialMediaModal = ({
  link,
  isOpen,
  onClose,
  onSuccess
}: {
  link: SocialMediaLink | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState({
    platform: 'youtube',
    name: '',
    url: '',
    description: '',
    isActive: true,
    displayOrder: 0,
    openInNewTab: true,
    showOnMobile: true,
    showOnWeb: true,
    whatsappConfig: {
      phoneNumber: '',
      defaultMessage: 'Hello! I am interested in your products.'
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (link) {
      setFormData({
        platform: link.platform,
        name: link.name,
        url: link.url,
        description: link.description || '',
        isActive: link.isActive,
        displayOrder: link.displayOrder,
        openInNewTab: link.openInNewTab,
        showOnMobile: link.showOnMobile,
        showOnWeb: link.showOnWeb,
        whatsappConfig: link.whatsappConfig || {
          phoneNumber: '',
          defaultMessage: 'Hello! I am interested in your products.'
        }
      });
    } else {
      setFormData({
        platform: 'youtube',
        name: '',
        url: '',
        description: '',
        isActive: true,
        displayOrder: 0,
        openInNewTab: true,
        showOnMobile: true,
        showOnWeb: true,
        whatsappConfig: {
          phoneNumber: '',
          defaultMessage: 'Hello! I am interested in your products.'
        }
      });
    }
  }, [link]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (link) {
        await socialMediaService.updateSocialMediaLink(link._id, formData);
        toast.success('Social media link updated successfully');
      } else {
        await socialMediaService.createSocialMediaLink(formData);
        toast.success('Social media link created successfully');
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving social media link:', error);
      toast.error('Failed to save social media link');
    } finally {
      setLoading(false);
    }
  };

  const platforms = [
    { value: 'youtube', label: 'YouTube', icon: '🎥' },
    { value: 'facebook', label: 'Facebook', icon: '📘' },
    { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
    { value: 'instagram', label: 'Instagram', icon: '📷' },
    { value: 'twitter', label: 'Twitter', icon: '🐦' },
    { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { value: 'telegram', label: 'Telegram', icon: '✈️' },
    { value: 'website', label: 'Website', icon: '🌐' },
    { value: 'custom', label: 'Custom', icon: '🔗' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {link ? 'Edit Social Media Link' : 'Add Social Media Link'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform *
            </label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {platforms.map((platform) => (
                <option key={platform.value} value={platform.value}>
                  {platform.icon} {platform.label}
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Our YouTube Channel"
              required
            />
          </div>

          {/* WhatsApp Configuration */}
          {formData.platform === 'whatsapp' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.whatsappConfig.phoneNumber}
                  onChange={(e) => setFormData({
                    ...formData,
                    whatsappConfig: {
                      ...formData.whatsappConfig,
                      phoneNumber: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+919876543210"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Message
                </label>
                <textarea
                  value={formData.whatsappConfig.defaultMessage}
                  onChange={(e) => setFormData({
                    ...formData,
                    whatsappConfig: {
                      ...formData.whatsappConfig,
                      defaultMessage: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Hello! I am interested in your products."
                />
              </div>
            </div>
          ) : (
            /* URL */
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://youtube.com/@yourchannelname"
                required
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Brief description of this social media link"
            />
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="openInNewTab"
                  checked={formData.openInNewTab}
                  onChange={(e) => setFormData({ ...formData, openInNewTab: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="openInNewTab" className="ml-2 block text-sm text-gray-700">
                  Open in new tab
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showOnMobile"
                  checked={formData.showOnMobile}
                  onChange={(e) => setFormData({ ...formData, showOnMobile: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showOnMobile" className="ml-2 block text-sm text-gray-700">
                  Show on mobile
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showOnWeb"
                  checked={formData.showOnWeb}
                  onChange={(e) => setFormData({ ...formData, showOnWeb: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showOnWeb" className="ml-2 block text-sm text-gray-700">
                  Show on web
                </label>
              </div>
            </div>
          </div>

          {/* Display Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Order
            </label>
            <input
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : (link ? 'Update Link' : 'Create Link')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Analytics Modal Component
const AnalyticsModal = ({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchAnalytics();
    }
  }, [isOpen]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await socialMediaService.getSocialMediaAnalytics();
      setAnalytics(response);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Social Media Analytics</h2>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Total Links</h3>
                  <p className="text-2xl font-bold text-blue-600">{analytics.summary?.totalLinks || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900">Active Links</h3>
                  <p className="text-2xl font-bold text-green-600">{analytics.summary?.activeLinks || 0}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900">Total Clicks</h3>
                  <p className="text-2xl font-bold text-purple-600">{analytics.summary?.totalClicks || 0}</p>
                </div>
              </div>

              {/* Top Performing Links */}
              {analytics.topPerforming && analytics.topPerforming.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Links</h3>
                  <div className="space-y-3">
                    {analytics.topPerforming.map((link: any, index: number) => (
                      <div key={link._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                          <div>
                            <h4 className="font-medium text-gray-900">{link.name}</h4>
                            <p className="text-sm text-gray-600 capitalize">{link.platform}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{link.clickCount} clicks</p>
                          {link.lastClicked && (
                            <p className="text-xs text-gray-500">
                              Last: {new Date(link.lastClicked).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Platform Analytics */}
              {analytics.analytics && analytics.analytics.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Performance</h3>
                  <div className="space-y-3">
                    {analytics.analytics.map((platform: any) => (
                      <div key={platform._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{platform._id === 'youtube' ? '🎥' : platform._id === 'facebook' ? '📘' : platform._id === 'whatsapp' ? '💬' : '🔗'}</span>
                          <div>
                            <h4 className="font-medium text-gray-900 capitalize">{platform._id}</h4>
                            <p className="text-sm text-gray-600">{platform.totalLinks} links</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{platform.totalClicks} clicks</p>
                          <p className="text-sm text-gray-600">Avg: {Math.round(platform.avgClicks || 0)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No analytics data available</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaManagement;
