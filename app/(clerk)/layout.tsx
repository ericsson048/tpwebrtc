export default function ClerkLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <div className="container flex items-center justify-center">
        {children}
      </div>
    );
  }