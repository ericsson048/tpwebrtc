export default function ClerkLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <div className="container grid place-content-center">
        {children}
      </div>
    );
  }