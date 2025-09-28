"use client"

import React, { type JSX } from 'react'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { Checkbox } from '../../components/ui/checkbox'
import AdminLayout from '../../components/admin/AdminLayout'
import { useStoreSettings } from '../../contexts/StoreSettingsContext'
import { ApiError, updateStoreSettings, StoreSettings, NavigationItem } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

interface NavItemState {
  id?: string
  key: string
  label: string
  url: string
  isExternal: boolean
}

interface StoreFormState {
  storeName: string
  logoUrl: string
  heroHeadline: string
  heroTagline: string
  heroDescription: string
  heroImage: string
  whatsappNumber: string
  instagram: string
  facebook: string
  tiktok: string
  shopee: string
}

function generateKey(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function mapSettingsToForm(settings: StoreSettings): StoreFormState {
  return {
    storeName: settings.storeName ?? '',
    logoUrl: settings.logoUrl ?? '',
    heroHeadline: settings.heroHeadline ?? '',
    heroTagline: settings.heroTagline ?? '',
    heroDescription: settings.heroDescription ?? '',
    heroImage: settings.heroImage ?? '',
    whatsappNumber: settings.whatsappNumber ?? '',
    instagram: settings.instagram ?? '',
    facebook: settings.facebook ?? '',
    tiktok: settings.tiktok ?? '',
    shopee: settings.shopee ?? '',
  }
}

function mapNavigationToState(navigation: NavigationItem[] = []): NavItemState[] {
  return navigation.map((item, index) => ({
    id: item.id,
    key: item.id ?? generateKey(`nav-${index}`),
    label: item.label ?? '',
    url: item.url ?? '',
    isExternal: Boolean(item.isExternal),
  }))
}

function AdminStoreSettings(): JSX.Element {
  const router = useRouter()
  const { settings, refresh } = useStoreSettings()
  const token = useAuthStore((state) => state.token)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const hydrate = useAuthStore((state) => state.hydrate)
  const logout = useAuthStore((state) => state.logout)

  const [form, setForm] = React.useState<StoreFormState>(() => mapSettingsToForm(settings))
  const [navItems, setNavItems] = React.useState<NavItemState[]>(() => mapNavigationToState(settings.navigation))
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const loginRoute = '/admin/login' as Route

  React.useEffect(() => {
    if (!isHydrated) {
      hydrate()
    }
  }, [hydrate, isHydrated])

  React.useEffect(() => {
    if (isHydrated && !token) {
      router.replace(loginRoute)
    }
  }, [isHydrated, token, router, loginRoute])

  React.useEffect(() => {
    setForm(mapSettingsToForm(settings))
    setNavItems(mapNavigationToState(settings.navigation))
  }, [settings])

  const handleFieldChange = (field: keyof StoreFormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.target
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const addNavItem = () => {
    setNavItems((prev) => [
      ...prev,
      {
        key: generateKey('nav-new'),
        label: '',
        url: '',
        isExternal: false,
      },
    ])
  }

  const updateNavItem = (key: string, patch: Partial<NavItemState>) => {
    setNavItems((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)))
  }

  const removeNavItem = (key: string) => {
    setNavItems((prev) => prev.filter((item) => item.key !== key))
  }

  const moveNavItem = (index: number, direction: number) => {
    setNavItems((prev) => {
      const newIndex = index + direction
      if (newIndex < 0 || newIndex >= prev.length) {
        return prev
      }
      const next = [...prev]
      const [item] = next.splice(index, 1)
      next.splice(newIndex, 0, item)
      return next
    })
  }

  const handleReset = () => {
    setForm(mapSettingsToForm(settings))
    setNavItems(mapNavigationToState(settings.navigation))
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    const trimmedForm: StoreFormState = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]),
    ) as StoreFormState

    if (!trimmedForm.storeName) {
      setError('Nama toko wajib diisi.')
      return
    }
    if (!trimmedForm.heroHeadline || !trimmedForm.heroTagline || !trimmedForm.heroDescription || !trimmedForm.heroImage) {
      setError('Kolom hero (headline, tagline, deskripsi, dan gambar) wajib diisi.')
      return
    }

    const navigationPayload = navItems.map((item) => ({
      id: item.id,
      label: item.label.trim(),
      url: item.url.trim(),
      isExternal: item.isExternal,
    }))

    const invalidNav = navigationPayload.find((item) => !item.label || !item.url)
    if (invalidNav) {
      setError('Setiap menu navigasi wajib memiliki label dan tautan.')
      return
    }

    setSaving(true)
    try {
      const updated = await updateStoreSettings({
        storeName: trimmedForm.storeName,
        logoUrl: trimmedForm.logoUrl,
        heroHeadline: trimmedForm.heroHeadline,
        heroTagline: trimmedForm.heroTagline,
        heroDescription: trimmedForm.heroDescription,
        heroImage: trimmedForm.heroImage,
        whatsappNumber: trimmedForm.whatsappNumber,
        instagram: trimmedForm.instagram,
        facebook: trimmedForm.facebook,
        tiktok: trimmedForm.tiktok,
        shopee: trimmedForm.shopee,
        navigation: navigationPayload,
      })

      setForm(mapSettingsToForm(updated))
      setNavItems(mapNavigationToState(updated.navigation))
      setSuccess('Pengaturan toko berhasil disimpan.')
      await refresh()
    } catch (err) {
      console.error('Gagal menyimpan pengaturan toko:', err)
      if (err instanceof ApiError && err.status === 401) {
        logout()
        router.replace(loginRoute)
        return
      }
      const message = err instanceof ApiError && err.message
        ? err.message
        : 'Gagal menyimpan pengaturan toko. Silakan coba lagi.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout
      title="Pengaturan Toko"
      description="Atur identitas toko, konten hero, dan tautan navigasi yang tampil di landing page."
    >
      <Card className="border-amber-200/60 dark:border-amber-300/20">
        <CardHeader>
          <CardTitle>Detail Toko</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-8" onSubmit={handleSubmit}>
            <section className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="storeName">Nama Toko</Label>
                <Input id="storeName" value={form.storeName} onChange={handleFieldChange('storeName')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">URL Logo</Label>
                <Input
                  id="logoUrl"
                  value={form.logoUrl}
                  onChange={handleFieldChange('logoUrl')}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">Nomor WhatsApp Utama</Label>
                <Input
                  id="whatsappNumber"
                  value={form.whatsappNumber}
                  onChange={handleFieldChange('whatsappNumber')}
                  placeholder="628xxxxxxxxx"
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Digunakan sebagai default link WhatsApp pada tombol "Beli" apabila produk tidak memiliki nomor khusus.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroImage">URL Gambar Hero</Label>
                <Input
                  id="heroImage"
                  value={form.heroImage}
                  onChange={handleFieldChange('heroImage')}
                  placeholder="https://..."
                  required
                />
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="heroHeadline">Hero Headline</Label>
                <Input
                  id="heroHeadline"
                  value={form.heroHeadline}
                  onChange={handleFieldChange('heroHeadline')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroTagline">Hero Tagline</Label>
                <Input
                  id="heroTagline"
                  value={form.heroTagline}
                  onChange={handleFieldChange('heroTagline')}
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="heroDescription">Hero Deskripsi</Label>
                <Textarea
                  id="heroDescription"
                  value={form.heroDescription}
                  onChange={handleFieldChange('heroDescription')}
                  rows={4}
                  required
                />
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input id="instagram" value={form.instagram} onChange={handleFieldChange('instagram')} placeholder="https://instagram.com/..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input id="facebook" value={form.facebook} onChange={handleFieldChange('facebook')} placeholder="https://facebook.com/..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiktok">TikTok</Label>
                <Input id="tiktok" value={form.tiktok} onChange={handleFieldChange('tiktok')} placeholder="https://tiktok.com/@..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopee">Shopee</Label>
                <Input id="shopee" value={form.shopee} onChange={handleFieldChange('shopee')} placeholder="https://shopee.co.id/..." />
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-amber-700 dark:text-amber-300">Menu Navigasi</h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Tentukan tautan yang tampil pada navbar di landing page.
                  </p>
                </div>
                <Button type="button" variant="outline" onClick={addNavItem}>
                  + Tambah Menu
                </Button>
              </div>
              <div className="space-y-3">
                {navItems.length === 0 && (
                  <p className="rounded-md border border-dashed border-amber-300/60 bg-amber-50/60 p-4 text-sm text-amber-700 dark:border-amber-300/30 dark:bg-amber-900/10 dark:text-amber-200">
                    Belum ada menu. Tambahkan item untuk tampil di navbar.
                  </p>
                )}
                {navItems.map((item, index) => (
                  <div
                    key={item.key}
                    className="rounded-lg border border-amber-200/60 bg-white p-4 shadow-sm dark:border-amber-300/20 dark:bg-neutral-900"
                  >
                    <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                      <div className="space-y-2">
                        <Label htmlFor={`nav-label-${item.key}`}>Label</Label>
                        <Input
                          id={`nav-label-${item.key}`}
                          value={item.label}
                          onChange={(event) => updateNavItem(item.key, { label: event.target.value })}
                          placeholder="Contoh: Produk"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`nav-url-${item.key}`}>URL</Label>
                        <Input
                          id={`nav-url-${item.key}`}
                          value={item.url}
                          onChange={(event) => updateNavItem(item.key, { url: event.target.value })}
                          placeholder="#produk atau https://..."
                          required
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <Checkbox
                          id={`nav-external-${item.key}`}
                          checked={item.isExternal}
                          onCheckedChange={(checked) => updateNavItem(item.key, { isExternal: Boolean(checked) })}
                        />
                        <Label htmlFor={`nav-external-${item.key}`}>Link eksternal</Label>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => moveNavItem(index, -1)}
                        disabled={index === 0}
                      >
                        Naik
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => moveNavItem(index, 1)}
                        disabled={index === navItems.length - 1}
                      >
                        Turun
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => removeNavItem(item.key)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            {success && <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleReset} disabled={saving}>
                Reset
              </Button>
              <Button type="submit" disabled={saving} className="bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600">
                {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}

export default AdminStoreSettings
