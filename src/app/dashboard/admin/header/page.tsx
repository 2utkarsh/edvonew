'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Save, Plus, Trash2, ChevronDown, ChevronRight, GripVertical,
  Eye, ArrowLeft, Check, Palette, Type, Link2, Bell, X, ExternalLink,
  Menu, ToggleLeft, ToggleRight, RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { useHeaderStore, NavLink, AnnouncementBar, HeaderConfig } from '@/store/useHeaderStore';

type ActiveTab = 'announcement' | 'navigation' | 'branding';

export default function AdminHeaderPage() {
  const { config, setConfig, updateAnnouncement, updateNavLinks, updateLogoText } = useHeaderStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>('announcement');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [previewMode, setPreviewMode] = useState(false);

  // Local editing state (syncs to store on save)
  const [localConfig, setLocalConfig] = useState<HeaderConfig>(structuredClone(config));

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setConfig(localConfig);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  const handleReset = () => {
    setLocalConfig(structuredClone(config));
  };

  // ─── Nav link handlers ───
  const addNavLink = () => {
    setLocalConfig({
      ...localConfig,
      navLinks: [...localConfig.navLinks, { href: '/', label: 'New Link', hasDropdown: false, children: [] }],
    });
  };

  const removeNavLink = (index: number) => {
    setLocalConfig({
      ...localConfig,
      navLinks: localConfig.navLinks.filter((_, i) => i !== index),
    });
  };

  const updateNavLink = <K extends keyof NavLink>(index: number, field: K, value: NavLink[K]) => {
    const updated = [...localConfig.navLinks];
    updated[index] = { ...updated[index], [field]: value };
    setLocalConfig({ ...localConfig, navLinks: updated });
  };

  const addSubLink = (navIndex: number) => {
    const updated = [...localConfig.navLinks];
    if (!updated[navIndex].children) updated[navIndex].children = [];
    updated[navIndex].children!.push({ href: '/', label: 'Sub Link' });
    setLocalConfig({ ...localConfig, navLinks: updated });
  };

  const removeSubLink = (navIndex: number, subIndex: number) => {
    const updated = [...localConfig.navLinks];
    updated[navIndex].children = updated[navIndex].children!.filter((_, i) => i !== subIndex);
    setLocalConfig({ ...localConfig, navLinks: updated });
  };

  const updateSubLink = <K extends keyof NonNullable<NavLink['children']>[number]>(navIndex: number, subIndex: number, field: K, value: NonNullable<NavLink['children']>[number][K]) => {
    const updated = [...localConfig.navLinks];
    const child = updated[navIndex].children![subIndex];
    updated[navIndex].children![subIndex] = { ...child, [field]: value };
    setLocalConfig({ ...localConfig, navLinks: updated });
  };

  const tabs = [
    { id: 'announcement' as ActiveTab, label: 'Announcement Bar', icon: <Bell className="w-4 h-4" /> },
    { id: 'navigation' as ActiveTab, label: 'Navigation Links', icon: <Menu className="w-4 h-4" /> },
    { id: 'branding' as ActiveTab, label: 'Branding & Auth', icon: <Palette className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ═══ HEADER ═══ */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/admin/new"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Header Management</h1>
                <p className="text-sm text-gray-500">Configure the announcement bar, navigation, and branding</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/"
                target="_blank"
                className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors px-3 py-2 rounded-lg hover:bg-indigo-50"
              >
                <Eye className="w-4 h-4" />
                Preview Site
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={handleReset}
                className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-70"
              >
                {saveStatus === 'saving' ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                ) : saveStatus === 'saved' ? (
                  <><Check className="w-4 h-4" /> Saved!</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Changes</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ─── LIVE PREVIEW ─── */}
        <div className="mb-8">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Live Preview</div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Announcement preview */}
            {localConfig.announcement.enabled && (
              <div
                className="px-4 py-2 flex items-center justify-between text-sm"
                style={{ backgroundColor: localConfig.announcement.bgColor }}
              >
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{ color: localConfig.announcement.bgColor, backgroundColor: localConfig.announcement.textColor }}
                >
                  {localConfig.announcement.leftText || 'Tag'}
                </span>
                <span className="text-xs font-medium truncate mx-4" style={{ color: localConfig.announcement.textColor }}>
                  {localConfig.announcement.centerText || 'Announcement text...'}
                </span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded border whitespace-nowrap"
                  style={{ color: localConfig.announcement.textColor, borderColor: localConfig.announcement.textColor }}
                >
                  {localConfig.announcement.ctaText || 'CTA'}
                </span>
              </div>
            )}
            {/* Nav bar preview */}
            <div className="bg-gray-950 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-green-400 to-emerald-500 rounded-md flex items-center justify-center">
                  <Type className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold text-sm">{localConfig.logoText}</span>
              </div>
              <div className="flex items-center gap-3">
                {localConfig.navLinks.slice(0, 5).map((link) => (
                  <span key={link.label} className="text-gray-400 text-xs flex items-center gap-0.5">
                    {link.label}
                    {link.hasDropdown && <ChevronDown className="w-2.5 h-2.5" />}
                  </span>
                ))}
                {localConfig.navLinks.length > 5 && (
                  <span className="text-gray-500 text-xs">+{localConfig.navLinks.length - 5} more</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs">{localConfig.loginText}</span>
                <span
                  className="text-white text-xs font-semibold px-2 py-1 rounded"
                  style={{ backgroundColor: localConfig.registerBgColor }}
                >
                  {localConfig.registerText}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── ANNOUNCEMENT TAB ─── */}
        {activeTab === 'announcement' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Announcement Bar</h3>
                <button
                  onClick={() => setLocalConfig({
                    ...localConfig,
                    announcement: { ...localConfig.announcement, enabled: !localConfig.announcement.enabled },
                  })}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    localConfig.announcement.enabled
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {localConfig.announcement.enabled ? (
                    <><ToggleRight className="w-4 h-4" /> Enabled</>
                  ) : (
                    <><ToggleLeft className="w-4 h-4" /> Disabled</>
                  )}
                </button>
              </div>

              <div className={`space-y-5 ${!localConfig.announcement.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Left Tag Text</label>
                    <input
                      type="text"
                      value={localConfig.announcement.leftText}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        announcement: { ...localConfig.announcement, leftText: e.target.value },
                      })}
                      placeholder="e.g., Transform Your Career in 2026"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">CTA Button Text</label>
                    <input
                      type="text"
                      value={localConfig.announcement.ctaText}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        announcement: { ...localConfig.announcement, ctaText: e.target.value },
                      })}
                      placeholder="e.g., Know More!"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Center Message</label>
                  <textarea
                    value={localConfig.announcement.centerText}
                    onChange={(e) => setLocalConfig({
                      ...localConfig,
                      announcement: { ...localConfig.announcement, centerText: e.target.value },
                    })}
                    placeholder="Main announcement message..."
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">CTA Link</label>
                  <input
                    type="text"
                    value={localConfig.announcement.ctaLink}
                    onChange={(e) => setLocalConfig({
                      ...localConfig,
                      announcement: { ...localConfig.announcement, ctaLink: e.target.value },
                    })}
                    placeholder="/courses/my-course"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Background Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={localConfig.announcement.bgColor}
                        onChange={(e) => setLocalConfig({
                          ...localConfig,
                          announcement: { ...localConfig.announcement, bgColor: e.target.value },
                        })}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={localConfig.announcement.bgColor}
                        onChange={(e) => setLocalConfig({
                          ...localConfig,
                          announcement: { ...localConfig.announcement, bgColor: e.target.value },
                        })}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Text Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={localConfig.announcement.textColor}
                        onChange={(e) => setLocalConfig({
                          ...localConfig,
                          announcement: { ...localConfig.announcement, textColor: e.target.value },
                        })}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={localConfig.announcement.textColor}
                        onChange={(e) => setLocalConfig({
                          ...localConfig,
                          announcement: { ...localConfig.announcement, textColor: e.target.value },
                        })}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick presets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quick Color Presets</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { bg: '#facc15', text: '#000000', label: 'Yellow' },
                      { bg: '#ef4444', text: '#ffffff', label: 'Red' },
                      { bg: '#3b82f6', text: '#ffffff', label: 'Blue' },
                      { bg: '#22c55e', text: '#ffffff', label: 'Green' },
                      { bg: '#8b5cf6', text: '#ffffff', label: 'Purple' },
                      { bg: '#f97316', text: '#ffffff', label: 'Orange' },
                      { bg: '#111827', text: '#ffffff', label: 'Dark' },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => setLocalConfig({
                          ...localConfig,
                          announcement: { ...localConfig.announcement, bgColor: preset.bg, textColor: preset.text },
                        })}
                        className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium hover:border-indigo-300 transition-colors"
                      >
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.bg }} />
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── NAVIGATION TAB ─── */}
        {activeTab === 'navigation' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Navigation Links</h3>
              <button
                onClick={addNavLink}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Link
              </button>
            </div>

            {localConfig.navLinks.map((link, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Link header */}
                <div className="px-6 py-4 flex items-center gap-4 border-b border-gray-100">
                  <GripVertical className="w-4 h-4 text-gray-300 cursor-grab flex-shrink-0" />
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => updateNavLink(index, 'label', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">URL</label>
                      <input
                        type="text"
                        value={link.href}
                        onChange={(e) => updateNavLink(index, 'href', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer bg-gray-50 px-2.5 py-1.5 rounded-lg">
                      <input
                        type="checkbox"
                        checked={link.hasDropdown || false}
                        onChange={(e) => {
                          updateNavLink(index, 'hasDropdown', e.target.checked);
                          if (e.target.checked && !link.children) {
                            updateNavLink(index, 'children', []);
                          }
                        }}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      Dropdown
                    </label>
                    <button
                      onClick={() => removeNavLink(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Dropdown children */}
                {link.hasDropdown && (
                  <div className="bg-gray-50 px-6 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dropdown Items</span>
                      <button
                        onClick={() => addSubLink(index)}
                        className="text-indigo-600 hover:text-indigo-700 text-xs font-medium flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add Item
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(link.children || []).map((child, cIndex) => (
                        <div key={cIndex} className="flex items-center gap-3">
                          <GripVertical className="w-3 h-3 text-gray-300 flex-shrink-0" />
                          <input
                            type="text"
                            value={child.label}
                            onChange={(e) => updateSubLink(index, cIndex, 'label', e.target.value)}
                            placeholder="Label"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
                          />
                          <input
                            type="text"
                            value={child.href}
                            onChange={(e) => updateSubLink(index, cIndex, 'href', e.target.value)}
                            placeholder="/path"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-mono bg-white"
                          />
                          <button
                            onClick={() => removeSubLink(index, cIndex)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {(!link.children || link.children.length === 0) && (
                        <p className="text-xs text-gray-400 text-center py-3">No dropdown items. Click &quot;+ Add Item&quot; above.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {localConfig.navLinks.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <Menu className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No navigation links</p>
                <button
                  onClick={addNavLink}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                >
                  Add First Link
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── BRANDING TAB ─── */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Logo & Branding</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo Text</label>
                  <input
                    type="text"
                    value={localConfig.logoText}
                    onChange={(e) => setLocalConfig({ ...localConfig, logoText: e.target.value })}
                    placeholder="EDVO"
                    className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg font-bold"
                  />
                  <p className="text-xs text-gray-400 mt-1">This appears next to the logo icon in the header</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Authentication Buttons</h3>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Login Button Text</label>
                  <input
                    type="text"
                    value={localConfig.loginText}
                    onChange={(e) => setLocalConfig({ ...localConfig, loginText: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Register Button Text</label>
                  <input
                    type="text"
                    value={localConfig.registerText}
                    onChange={(e) => setLocalConfig({ ...localConfig, registerText: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Register Button Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={localConfig.registerBgColor}
                      onChange={(e) => setLocalConfig({ ...localConfig, registerBgColor: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300"
                    />
                    <input
                      type="text"
                      value={localConfig.registerBgColor}
                      onChange={(e) => setLocalConfig({ ...localConfig, registerBgColor: e.target.value })}
                      className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-mono"
                    />
                    {/* Quick presets */}
                    <div className="flex gap-1.5">
                      {['#22c55e', '#3b82f6', '#8b5cf6', '#ef4444', '#f97316', '#06b6d4'].map((color) => (
                        <button
                          key={color}
                          onClick={() => setLocalConfig({ ...localConfig, registerBgColor: color })}
                          className="w-8 h-8 rounded-lg border border-gray-200 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

