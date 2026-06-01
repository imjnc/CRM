# CRM Lead Design Builder - Data, Templates & Features

## CRM Auto Fill
Builder automatically receives Lead Data.
Example payload:
```json
{
  "name": "John Doe",
  "company": "ABC Ltd",
  "email": "john@abc.com",
  "phone": "9999999999"
}
```
Template variables automatically populated:
`{{lead_name}}`, `{{company_name}}`, `{{email}}`, `{{phone}}`, `{{website}}`, `{{address}}`

## Templates
Prebuilt Templates:
- Sales Proposal: Logo, Lead Details, Services, Pricing, Contact
- Marketing Flyer: Hero Image, Features, CTA
- Product Brochure: Product Images, Specifications, Pricing
- Event Flyer: Event Banner, Date, Time, Venue
- Real Estate Flyer: Property Images, Agent Details, QR Code

## Asset Library & Brand Kit
- Folders for Company, Personal, and Shared Assets (Logos, Brand Images, Icons, Marketing Assets)
- Brand Kit: Company Logo, Primary Color, Secondary Color, Fonts, Watermark (1-click apply)

## Save System & Version History
- States: Draft, Published, Archived
- Features: Auto Save, Manual Save
- Version History: Maintain past versions, users can restore older versions

## Export & Sharing
- Export Formats: PNG, JPG, PDF (Future: PPTX, HTML, DOCX)
- Sharing: Generate Public URL `/design/share/abc123`
- Share Options: View Only, Editable, Password Protected

## Advanced Features (Future)
- Team Collaboration: Live Editing, Comments, Mentions, Activity Feed
- AI Generate Design: e.g. "Create a flyer for a software company"
- AI Generate Content: Headings, Descriptions, CTA, Product Content
- AI Generate Proposal: Using Lead Data (Company, Contact, Requirements)

## Permissions & Analytics
- Admin: Full Access
- Manager: Create + Edit
- Sales User: Own Designs Only
- Viewer: Read Only
- Analytics Track: Views, Downloads, Shares, Exports
