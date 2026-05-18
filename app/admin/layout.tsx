export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout" data-theme="dark">
      {children}
    </div>
  )
}
