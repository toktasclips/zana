# Teneffüs — Özel Ders Yönetim Platformu

Öğrenci, öğretmen ve adminlerin kullandığı çok kullanıcılı, güvenli, mobil ve web uyumlu SaaS platformu.

## Teknik Stack

- **Next.js 16** App Router + TypeScript
- **Supabase** Auth, Database, Row Level Security
- **Tailwind CSS v4**
- **@supabase/ssr** — cookie-tabanlı server-side auth

## Kurulum

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Environment Değişkenlerini Ayarla

```bash
cp .env.example .env.local
```

`.env.local` dosyasına Supabase proje bilgilerini ekle:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> ⚠️ `service_role` key'i hiçbir zaman frontend env değişkenine koyma.

### 3. Veritabanı Migration'ı Çalıştır

Supabase Dashboard > SQL Editor üzerinden şu dosyayı çalıştır:

```
database/migrations/001_initial_schema.sql
```

Bu script:
- 8 tabloyu oluşturur (profiles, students, teachers, teacher_assignments, lessons, lesson_packages, messages, audit_logs)
- Her tablo için RLS etkinleştirir
- Rol bazlı güvenlik politikalarını yazar
- `public_teacher_cards` view'ını oluşturur (öğrencilere güvenli öğretmen bilgisi)
- `handle_new_user()` trigger'ını kurar (yeni auth kullanıcısı → otomatik profil oluşturma)

### 4. Geliştirme Sunucusunu Başlat

```bash
npm run dev
```

## Kullanıcı Rolleri

| Rol | Erişim |
|-----|--------|
| `student` | Kendi dersleri, öğretmen seçimi, mesajlaşma |
| `teacher` | Atanmış öğrenciler, ders yönetimi, not ekleme |
| `admin` | Tüm sistem, öğrenci-öğretmen eşleştirme, audit logs |

## Güvenlik Mimarisi

- **Route Protection**: `proxy.ts` (Next.js 16 middleware replacement) ile tüm korumalı rotalar auth ve rol kontrolünden geçer
- **RLS**: Her tablo için Supabase Row Level Security politikaları tanımlıdır
- **Server-side Role Check**: Rol bilgisi her zaman veritabanından doğrulanır, client'a güvenilmez
- **Contact Privacy**: Öğrenci ve öğretmen birbirinin iletişim bilgilerini göremez
- **Message Filter**: Mesajlarda email, telefon ve sosyal medya paylaşımı tespit edilip işaretlenir
- **Audit Logs**: Kritik admin işlemleri kayıt altına alınır

## Proje Yapısı

```
app/
  (protected)/          # Auth gerektiren rotalar
    student/            # Öğrenci paneli
    teacher/            # Öğretmen paneli
    admin/              # Admin paneli
    dashboard/          # Rol bazlı yönlendirme
  login/                # Giriş sayfası
  unauthorized/         # Yetkisiz erişim sayfası
components/
  ui/                   # Button, Card, Badge, StatCard
  layout/               # Sidebar, BottomNav, NavWrapper, LogoutButton
lib/
  supabase/             # client.ts (browser), server.ts (SSR)
  auth/                 # get-user-role.ts
  security/             # message-filter.ts
types/
  database.ts           # Supabase tablo tipleri
database/
  migrations/           # SQL migration dosyaları
proxy.ts                # Route protection (Next.js 16)
```
