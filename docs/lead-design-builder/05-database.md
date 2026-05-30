# CRM Lead Design Builder - Database & Tech Stack

## Recommended Tech Stack
**Frontend:**
- React
- TypeScript
- Zustand (State Management)
- Konva.js (Canvas API wrapper)
- React DnD (Drag and drop)

**Backend:**
- PHP (Note: Current project is Next.js, so backend will likely adapt to Next.js API Routes/Server Actions)
- MySQL / PostgreSQL (Prisma)

**Storage:**
- AWS S3 or Cloudflare R2
- Local Storage

## Database Tables

### lead_designs
- `id`
- `lead_id`
- `title`
- `thumbnail`
- `canvas_json`
- `status`
- `created_by`
- `created_at`
- `updated_at`

### design_templates
- `id`
- `name`
- `category`
- `template_json`

### design_assets
- `id`
- `design_id`
- `file_path`
- `file_type`

### design_versions
- `id`
- `design_id`
- `version_number`
- `canvas_json`
