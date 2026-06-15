type Props = {
  className?: string
}

export default function DbUnavailableNotice({ className }: Props) {
  return (
    <div
      className={className ?? "guide-disclaimer"}
      style={className ? undefined : { margin: "24px auto", maxWidth: "960px" }}
    >
      Directory data is temporarily unavailable. Check your database connection and refresh the page.
    </div>
  )
}
