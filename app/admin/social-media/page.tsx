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

// Platform Icon Function - Available globally
const getPlatformIcon = (platform: string) => {
  const iconComponents: { [key: string]: JSX.Element } = {
    youtube: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#FF0000">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    facebook: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    whatsapp: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#25D366">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.051 3.488"/>
      </svg>
    ),
    instagram: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="url(#instagram-gradient)">
        <defs>
          <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#833AB4"/>
            <stop offset="50%" stopColor="#FD1D1D"/>
            <stop offset="100%" stopColor="#FCB045"/>
          </linearGradient>
        </defs>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    twitter: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1DA1F2">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
    ),
    linkedin: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#0A66C2">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    telegram: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#0088CC">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
    website: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#6B7280">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    ),
    custom: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#6B7280">
        <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
      </svg>
    )
  };
  return iconComponents[platform] || iconComponents.custom;
};

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
  const [isDragDropEnabled, setIsDragDropEnabled] = useState(false); // Disabled for webview compatibility
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSocialMediaLinks();
    // Drag-drop disabled for webview compatibility
    // const timer = setTimeout(() => {
    //   setIsDragDropEnabled(true);
    // }, 1000);

    // return () => clearTimeout(timer);
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

  // Function moved to global scope above

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
      <div className="p-4 sm:p-6 max-w-7xl mx-auto webview-optimized">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 webview-text">Social Media Management</h1>
            <p className="text-gray-600 mt-2 webview-text">Manage your social media links and track their performance</p>
          </div>
        <div className="flex flex-col sm:flex-row gap-3 webview-mobile-stack">
          <button
            onClick={() => setShowAnalytics(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors webview-button webview-mobile-full"
          >
            <BarChart3 size={20} />
            <span className="webview-text">Analytics</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors webview-button webview-mobile-full"
          >
            <Plus size={20} />
            <span className="webview-text">Add Link</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="webview-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
      <div className="bg-white rounded-lg shadow-sm border webview-optimized">
        <div className="p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 webview-text">Social Media Links</h2>
          <p className="text-gray-600 mt-1 webview-text">
            {isDeleting
              ? 'Deleting link...'
              : 'Manage your social media links and their visibility'
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
                                <div className="flex-shrink-0">{getPlatformIcon(link.platform)}</div>
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
                      <div className="flex-shrink-0">{getPlatformIcon(link.platform)}</div>
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
      phoneNumber: '8000950408',
      defaultMessage: 'Hello! I am interested in your products from Ghanshyam Murti Bhandar.'
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
    { value: 'youtube', label: 'YouTube', icon: 'YouTube' },
    { value: 'facebook', label: 'Facebook', icon: 'Facebook' },
    { value: 'whatsapp', label: 'WhatsApp', icon: 'WhatsApp' },
    { value: 'instagram', label: 'Instagram', icon: 'Instagram' },
    { value: 'twitter', label: 'Twitter', icon: 'Twitter' },
    { value: 'linkedin', label: 'LinkedIn', icon: 'LinkedIn' },
    { value: 'telegram', label: 'Telegram', icon: 'Telegram' },
    { value: 'website', label: 'Website', icon: 'Website' },
    { value: 'custom', label: 'Custom', icon: 'Custom' }
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
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {formData.platform && getPlatformIcon(formData.platform)}
              </div>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
              {platforms.map((platform) => (
                <option key={platform.value} value={platform.value}>
                  {platform.label}
                </option>
              ))}
              </select>
            </div>
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
